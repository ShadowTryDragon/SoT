import {SessionData} from "./session-data.js";
import {ApiClient} from "../sot/api.js";
import {GuildShip, ShipChronicle, ShipChronicleFeedData,} from "../sot/api.types.js";
import isGuildShipAtSea = GuildShip.isGuildShipAtSea;

type SessionLogUpdateJobData = {
  session: SessionData;
  retryCounter: number;
  retries: number;
};

export class SessionManager {
  private started: boolean = false;
  private sessions: SessionData[] = [];
  private sessionLogUpdateJobs: SessionLogUpdateJobData[] = [];
  private chronicleUpdateListeners: ((sd: SessionData) => Promise<void>)[] = [];
  private constructor(
    private api: ApiClient,
    private readonly guildId: string,
  ) {}

  public async start(): Promise<SessionData[]> {
    if (this.started) {
      return Promise.reject(
        new Error("Can not start an already started SessionManager!"),
      );
    }
    const guildShips = await this.api.getGuildShips(this.guildId);
    if (!guildShips || !guildShips.Ships || !Array.isArray(guildShips.Ships)) {
      return Promise.reject(
        new Error("Error loading guild ships!", {
          cause: { response: guildShips },
        }),
      );
    }

    this.sessions.splice(0);
    const sessions = guildShips.Ships.filter(isGuildShipAtSea).map((ship) =>
      SessionData.create(ship, guildShips.Paths?.Entitlement),
    );
    this.sessions.push(...sessions);
    this.started = true;
    return sessions;
  }

  public async updateSessionData(): Promise<{
    additions: SessionData[];
    removals: SessionData[];
    remaining: SessionData[];
  }> {
    await this.api.waitWithPriority();
    const guildShips = await this.api.getGuildShips(this.guildId);
    if (!guildShips || !guildShips.Ships || !Array.isArray(guildShips.Ships)) {
      return Promise.reject(
        new Error("Api get guild ships send invalid response", {
          cause: { guildShips },
        }),
      );
    }
    const additions = [...guildShips.Ships.filter(GuildShip.isGuildShipAtSea)];
    const removals: SessionData[] = [];
    const remaining: SessionData[] = [];
    this.sessions
      .filter((session) => session.active)
      .forEach((session) => {
        // TODO: Handle anonymous
        const index = additions.findIndex((ship) => session.shipId === ship.Id);
        if (index !== -1) {
          session.seen(
            additions.splice(index, 1)[0],
            guildShips.Paths?.Entitlement,
          );
          remaining.push(session);
        } else {
          session.deactivate();
          removals.push(session);
        }
      });
    const sessionAdditions = additions.map((addition) =>
      SessionData.create(addition, guildShips.Paths?.Entitlement),
    );
    this.sessions.push(...sessionAdditions);

    const removeJob = (job: SessionLogUpdateJobData) => {
      const index = this.sessionLogUpdateJobs.indexOf(job);
      if (index === -1) {
        console.error("Error finding job in jobs list");
      } else {
        this.sessionLogUpdateJobs.splice(index, 1);
      }
    };
    this.sessionLogUpdateJobs
      .filter((job) => --job.retryCounter <= 0)
      .map((job) => job.session.shipId)
      .filter((value, index, array) => array.indexOf(value) === index)
      .map(async (shipId) => {
        const shipJobs = this.sessionLogUpdateJobs
          .filter((job) => job.session.shipId === shipId)
          .toSorted(
            (a, b) =>
              a.session.lastSeen.getTime() - b.session.lastSeen.getTime(),
          );
        await this.api.waitForDelay();
        const shipChronicles = (
          await this.api.getGuildShipChronicles(this.guildId, shipId)
        ).Feed.map((chronicle): ShipChronicleFeedData<Date> => {
          return {
            ...chronicle,
            CreatedAtUtc: new Date(chronicle.CreatedAtUtc),
          };
        });
        for (let i = 0, shipJob = shipJobs[i]; i < shipJobs.length; i++) {
          // TODO: Does this need to be adjusted?
          const startTime = shipJob.session.lastSeen;
          const endTime =
            shipJobs.length > 1
              ? shipJobs[i + 1].session.firstSeen
              : new Date();
          const matchingChronicle = shipChronicles
            .filter(
              (chronicle) =>
                chronicle.CreatedAtUtc >= startTime &&
                chronicle.CreatedAtUtc <= endTime,
            )
            .toSorted(
              (a, b) => a.Item.EmissaryValueEarned - b.Item.EmissaryValueEarned,
            )
            .find(() => true);
          if (typeof matchingChronicle !== "undefined") {
            removeJob(shipJob);
            await this.updateChronicle(shipJob.session, matchingChronicle.Item);
            continue;
          }
          if (shipJob.retryCounter > 0) {
            continue;
          }
          if (++shipJob.retries > 4 || shipJob.retries < 0) {
            // TODO: retry with a bigger time-frame?
            console.warn("Could not find matching chronicle after 3 retries", {
              shipChronicles,
              startTime,
              endTime,
              shipJob: shipJob,
            });
            removeJob(shipJob);
            continue;
          }
          shipJob.retryCounter = shipJob.retries;
        }
      });
    this.sessionLogUpdateJobs.push(
      ...removals.map((session) => {
        return {
          session,
          retries: 0,
          retryCounter: 1,
        };
      }),
    );
    return { additions: sessionAdditions, remaining, removals };
  }

  async updateChronicle(
    session: SessionData,
    chronicle: ShipChronicle,
  ): Promise<void> {
    session.guildLogEntry = chronicle;
    for (const listener of this.chronicleUpdateListeners) {
      await listener(session);
    }
  }

  registerChronicleUpdateListener(handler: (sd: SessionData) => Promise<void>) {
    if (this.chronicleUpdateListeners.includes(handler)) {
      return;
    }
    this.chronicleUpdateListeners.push(handler);
  }

  removeChronicleUpdateListener(handler: (sd: SessionData) => Promise<void>) {
    const index = this.chronicleUpdateListeners.indexOf(handler);
    if (index === -1) {
      return;
    }
    this.chronicleUpdateListeners.splice(index, 1);
  }

  private static self: SessionManager | undefined;
  static getInstance(api?: ApiClient | undefined): SessionManager {
    return (this.self ??= new SessionManager(
      api ?? ApiClient.getInstance(),
      process.env.SOT_GUILD ?? "",
    ));
  }
}

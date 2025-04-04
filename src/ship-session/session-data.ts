import {
  GuildShipAtSea,
  SailingState,
  ShipChronicle,
  ShipType,
} from "../sot/api.types.js";
import { SessionCrewData } from "./session-crew-data.js";

export class SessionData {
  #active: boolean;
  public readonly firstSeen: Date;
  public guildLogEntry: ShipChronicle | undefined;
  public lastSeen: Date;
  constructor(
    /** Image url */
    public sailImage: string,
    public sailingState: SailingState,
    public sessionCrewData: SessionCrewData[],
    public readonly shipId: string,
    public readonly shipName: string,
    public readonly shipType: ShipType,
  ) {
    this.#active = true;
    this.lastSeen = this.firstSeen = new Date();
  }

  seen(guildShip: GuildShipAtSea, baseUrl?: string): void {
    if (!this.active) {
      // TODO: throw?
      return;
    }
    if (this.shipId !== guildShip.Id) {
      // TODO: throw?
      return;
    }
    const now = new Date();

    this.sailImage = SessionData.withBaseUrl(guildShip.SailImage, baseUrl);
    this.sailingState = guildShip.SailingState;

    const additions = [...(guildShip.Crew ?? [])];
    for (const sessionCrewDatum of this.sessionCrewData.filter(
      (datum) => datum.active,
    )) {
      // TODO: Handle anonymous
      const index = additions.findIndex(
        (crew) => sessionCrewDatum.gamertag === crew.Gamertag,
      );
      if (index !== -1) {
        sessionCrewDatum.seen(now);
        additions.splice(index, 1);
      } else {
        sessionCrewDatum.deactivate();
      }
    }
    this.sessionCrewData.push(
      ...additions.map(
        (addCrew) => new SessionCrewData(addCrew.Gamertag ?? "Anonymous", now),
      ),
    );
  }

  deactivate(): void {
    this.sessionCrewData.forEach((crew) => crew.deactivate());
    this.#active = false;
  }

  get active(): boolean {
    return this.#active;
  }

  static create(guildShip: GuildShipAtSea, baseUrl?: string): SessionData {
    return new SessionData(
      SessionData.withBaseUrl(guildShip.SailImage, baseUrl),
      guildShip.SailingState,
      guildShip.Crew?.map(
        (crew) => new SessionCrewData(crew.Gamertag ?? "Anonymous"),
      ) ?? [],
      guildShip.Id,
      guildShip.Name,
      guildShip.Type,
    );
  }

  private static withBaseUrl(imageUrl: string, baseUrl?: string): string {
    return baseUrl ? `${baseUrl}/${imageUrl}` : imageUrl;
  }
}

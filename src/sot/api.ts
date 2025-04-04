import { RestClient } from "typed-rest-client";
import {
  APIGetGuidShipsResponse,
  APIGetShipChronicleResponse,
} from "./api.types.js";
/*
To log all requests use NODE_DEBUG=http
 */

const REQUEST_DELAY = 60_000; /* 1min */

export class ApiClient {
  private waitingRequests: (() => void)[];
  private waitingPriorityRequests: (() => void)[];
  private scheduler: ReturnType<typeof setInterval> | undefined;
  private restClient: RestClient;
  private lastRequest: Date;

  private constructor() {
    this.restClient = new RestClient(
      "harbour-master-discord-app/0.0.1 (contact: DeclinedSteam66 via forums)",
      "https://seaofthieves.com/api/profilev2/",
      undefined,
      {
        headers: {
          Cookie: process.env.SOT_RAT,
        },
      },
    );
    this.lastRequest = new Date(0);
    this.waitingRequests = [];
    this.waitingPriorityRequests = [];
  }

  async getGuildShips(guildId: string): Promise<APIGetGuidShipsResponse> {
    await this.requireRequestDelay();
    const response = await this.restClient.get<APIGetGuidShipsResponse>(
      `guild-ships`,
      {
        additionalHeaders: {
          referer: `https://www.seaofthieves.com/profile/guilds/${encodeURIComponent(guildId)}/`,
        },
        queryParameters: {
          params: {
            guild: guildId,
          },
        },
      },
    );
    if (response.statusCode !== 200) {
      throw new Error("API responded with non 200 code", { cause: response });
    }
    if (response.result === null) {
      throw new Error("API responded with null", { cause: response });
    }
    return response.result;
  }

  async getGuildShipChronicles(
    guildId: string,
    shipId?: string,
    localization: null | "de" = null,
  ): Promise<APIGetShipChronicleResponse> {
    await this.requireRequestDelay();
    // https://www.seaofthieves.com/de/api/profilev2/guild-chronicle?guild=ad449ba1-b2e5-4ac0-9ec7-cc6131142c22
    // https://www.seaofthieves.com/api/profilev2/ship-chronicle?guild=ad449ba1-b2e5-4ac0-9ec7-cc6131142c22&ship=9c527cc0-4d00-48dc-9618-0fddf2d20d5d
    // https://www.seaofthieves.com/de/api/profilev2/ship-chronicle?guild=ad449ba1-b2e5-4ac0-9ec7-cc6131142c22&ship=9c527cc0-4d00-48dc-9618-0fddf2d20d5d
    const url = `https://www.seaofthieves.com/${
      localization ? encodeURIComponent(localization) + "/" : ""
    }api/profilev2/${shipId ? "ship" : "guild"}-chronicle`;
    const response = await this.restClient.get<APIGetShipChronicleResponse>(
      url,
      {
        additionalHeaders: {
          referer: `https://www.seaofthieves.com/profile/guilds/${encodeURIComponent(guildId)}/`,
        },
        queryParameters: {
          params: {
            guild: guildId,
            ...(shipId ? { ship: shipId } : {}),
          },
        },
      },
    );
    if (response.statusCode !== 200) {
      throw new Error("API responded with non 200 code", { cause: response });
    }
    if (response.result === null) {
      throw new Error("API responded with null", { cause: response });
    }
    return response.result;
  }

  waitForDelay(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.waitingRequests.push(resolve);
      this.startScheduling();
    });
  }

  waitWithPriority(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.waitingPriorityRequests.push(resolve);
      this.startScheduling();
    });
  }

  private startScheduling(): void {
    const executeNextJob = () => {
      const job = (
        this.waitingPriorityRequests.length > 0
          ? this.waitingPriorityRequests.splice(0, 1)
          : this.waitingRequests.splice(0, 1)
      ).find(() => true);
      if (typeof job === "undefined") {
        return;
      }
      job();
    };
    const startNextJob = (): void => {
      if (typeof this.scheduler !== "undefined") {
        return;
      }
      if (
        this.waitingRequests.length === 0 &&
        this.waitingPriorityRequests.length === 0
      ) {
        return;
      }
      const now = new Date();
      const diff = REQUEST_DELAY - now.getTime() + this.lastRequest.getTime();
      if (diff <= 0) {
        executeNextJob();
        return startNextJob();
      }
      this.scheduler = setTimeout(async () => {
        this.scheduler = undefined;
        executeNextJob();
        return startNextJob();
      }, diff);
    };
    startNextJob();
  }

  private async requireRequestDelay(
    updateLastRequestTime: boolean = true,
  ): Promise<void> {
    const now = new Date();
    const diff = now.getTime() - this.lastRequest.getTime();
    if (diff < REQUEST_DELAY /* 1min */) {
      return Promise.reject(new Error("Rate limit"));
    }
    if (updateLastRequestTime) {
      this.lastRequest = now;
    }
  }

  private static self: ApiClient | undefined;
  static getInstance(): ApiClient {
    return (this.self ??= new ApiClient());
  }
}

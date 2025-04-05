import {
  ChatInputCommandInteraction,
  Client,
  ClientOptions,
  Collection,
  EmbedBuilder,
  Events,
  Snowflake,
  TextChannel,
} from "discord.js";
import { PollCommand, StatusCommand } from "../commands/index.js";
import { SessionManager } from "../ship-session/session-manager.js";
import { SessionData } from "../ship-session/session-data.js";
import { SessionCrewData } from "../ship-session/session-crew-data.js";

const SESSION_UPDATE_INTERVAL = 5 * 60_000;

const sortCrewByTime = (
  crewA: SessionCrewData,
  crewB: SessionCrewData,
): number =>
  crewA.firstSeen.getTime() === crewB.firstSeen.getTime()
    ? crewA.lastSeen?.getTime() - crewB.lastSeen?.getTime()
    : crewA.firstSeen.getTime() - crewB.firstSeen.getTime();

const sessionToMessage = (session: SessionData): EmbedBuilder =>
  new EmbedBuilder()
    .setTitle(
      `${session.shipName} ${session.active ? "ist auf See" : "ist zurück im Hafen"}`,
    )
    .setDescription(
      `Unser ehrwürdiges Gildenschiff ${session.shipName} ist am ${session.firstSeen.toLocaleString("de-DE")} in See gestochen.\n` +
        (session.active
          ? "Es befindet sich derzeit auf hoher See"
          : `Am ${session.lastSeen.toLocaleString("de-DE")} ist es sicher in den Hafen zurückgekehrt`),
    )
    .setThumbnail(session.sailImage)
    .addFields(
      session.sessionCrewData
        .toSorted((crewA, crewB): number =>
          crewA.active && crewB.active
            ? sortCrewByTime(crewA, crewB)
            : crewA.active
              ? -1
              : crewB.active
                ? 1
                : sortCrewByTime(crewA, crewB),
        )
        .toSpliced(21) // max 25 fields and guild log is 4
        .map((crew) => {
          return {
            name: crew.gamertag,
            value:
              `Crew beigetreten: ${crew.firstSeen.toLocaleString("de-DE")}\n` +
              (crew.active
                ? "Teil der Crew"
                : `Crew verlassen:   ${crew.lastSeen.toLocaleString("de-DE")}`),
          };
        }),
    )
    .addFields(
      session.guildLogEntry
        ? [
            {
              name: "Gold",
              value: "" + session.guildLogEntry.GoldEarned,
              inline: true,
            },
            {
              name: "Botschafterwert",
              value: "" + session.guildLogEntry.EmissaryValueEarned,
              inline: true,
            },
            {
              name: "Reputation",
              value: "" + session.guildLogEntry.ReputationEarned,
              inline: true,
            },
            {
              name: "Meilensteine",
              value: "" + session.guildLogEntry.ShipAccoladesIncreased,
              inline: true,
            },
          ]
        : [],
    );

export class App extends Client {
  // private guildShips;
  readonly commands: Collection<string, any>;
  private sessionManager: SessionManager;
  private sessionManagementInterval: ReturnType<typeof setInterval> | undefined;
  private sessionMessages: WeakMap<SessionData, Snowflake>;
  private guildChannel: TextChannel | undefined;

  constructor(options: ClientOptions) {
    super(options);
    this.commands = new Collection();
    this.commands.set(StatusCommand.data.name, StatusCommand);
    this.commands.set(PollCommand.data.name, PollCommand);
    this.sessionMessages = new WeakMap<SessionData, Snowflake>();
    if (!process.env.SOT_GUILD) {
      throw new Error("SOT_GUILD not set!");
    }
    this.sessionManager = SessionManager.getInstance();
  }

  async start(discordToken?: string) {
    const login = this.login(discordToken);

    return await Promise.all([login]);
  }

  registerListener() {
    this.once(Events.ClientReady, async (client) => {
      console.log(`Logged in as ${client.user.tag}`);
      console.log(`Starting session management...`);
      await this.startSessionManagement();
      console.log(`Session management started`);
    });
    this.on(Events.InteractionCreate, async (interaction) => {
      if (interaction.isChatInputCommand()) {
        return await this.handleChatInputCommand(interaction);
      }
    });
    this.sessionManager.registerChronicleUpdateListener(
      async (session: SessionData) => {
        await this.updateMessage(session);
        this.sessionMessages.delete(session);
      },
    );
  }

  private async handleChatInputCommand(
    interaction: ChatInputCommandInteraction,
  ) {
    // console.log(interaction);
    const command = this.commands.get(interaction.commandName);
    if (typeof command === "undefined") {
      console.error(
        `No command matching ${interaction.commandName} was found.`,
      );
      return;
    }
    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      }
    }
  }

  private async startSessionManagement() {
    if (typeof this.sessionManagementInterval !== "undefined") {
      console.error("Session management already started");
      return;
    }
    const guild = this.guilds.cache.get(process.env.GUILD_ID ?? "");
    if (!guild) {
      console.error("Error finding guild");
      return;
    }
    const guildChannel = guild.channels.cache.get(
      process.env.GUILD_CHANNEL ?? "",
    );
    if (!guildChannel) {
      console.error("Error finding guild channel");
      return;
    }
    if (!(guildChannel instanceof TextChannel)) {
      console.error("Error guild channel is not a text channel");
      return;
    }
    this.guildChannel = guildChannel;
    try {
      const sessions = await this.sessionManager.start();
      /*sessions.push(
        new SessionData(
          "https://athenawebsiteassets-a9awftf5fyfxandj.b01.azurefd.net/2-138-1387-0/Entitlement/Inventory/3607f458-6636-47ae-8c8d-d1a402bd4766.png",
          SailingState.NotAtSeaAvailable,
          [new SessionCrewData("Fake Zoey")],
          "9c527cc0-4d00-48dc-9618-0fddf2d20d5d",
          "Fake Dark Octavious",
          ShipType.Sloop,
        ),
      );*/
      for (const session of sessions) {
        await this.updateMessage(session, false);
      }
    } catch (e) {
      console.error("Error starting session management", e);
      return;
    }
    this.sessionManagementInterval = setInterval(async () => {
      console.info("Session update started");
      try {
        const { additions, removals, remaining } =
          await this.sessionManager.updateSessionData();
        for (const session of additions) {
          await this.updateMessage(session, false);
        }
        for (const session of [...removals, ...remaining]) {
          await this.updateMessage(session);
        }
      } catch (e) {
        clearInterval(this.sessionManagementInterval);
        this.sessionManagementInterval = undefined;
        console.error("Stopping session management due to error", e);
      }
      console.info("Session update finished");
    }, SESSION_UPDATE_INTERVAL);
  }

  private async updateMessage(
    session: SessionData,
    expectEdit: boolean = true,
  ) {
    if (!this.guildChannel) {
      throw new Error("Guild channel not set!");
    }
    const channel = this.guildChannel;
    const postNew = () =>
      channel
        .send({
          embeds: [messageEmbed],
        })
        .then((newMessage) => this.sessionMessages.set(session, newMessage.id));
    const messageEmbed = sessionToMessage(session);
    const messageId = this.sessionMessages.get(session);
    if (typeof messageId === "undefined") {
      if (expectEdit) {
        console.warn("Error could not find message id for session");
      }
      return postNew();
    }
    const message = channel.messages.cache.get(messageId);
    if (!message) {
      console.warn("Error could not find message");
      return postNew();
    }
    const editedMessage = await channel.messages.edit(message, {
      embeds: [messageEmbed],
    });
    this.sessionMessages.set(session, editedMessage.id);
  }
}

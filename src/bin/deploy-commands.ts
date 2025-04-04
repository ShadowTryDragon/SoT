import "dotenv/config";
import {
  REST,
  RESTPutAPIApplicationGuildCommandsResult,
  Routes,
} from "discord.js";
import * as CommandModule from "../commands/index.js";

if (
  typeof process.env.DISCORD_TOKEN !== "string" ||
  typeof process.env.APP_ID !== "string" ||
  typeof process.env.GUILD_ID !== "string"
) {
  throw new Error("Missing configuration");
}
const token = process.env.DISCORD_TOKEN;
const appId = process.env.APP_ID;
const guildId = process.env.GUILD_ID;

const commands = [];
for (let commandModuleMember in CommandModule) {
  const command = (
    CommandModule as { [P: typeof commandModuleMember]: unknown }
  )[commandModuleMember];
  if (
    typeof command === "object" &&
    command !== null &&
    "data" in command &&
    "execute" in command &&
    typeof command.data === "object" &&
    command.data !== null &&
    "toJSON" in command.data &&
    typeof command.data.toJSON === "function"
  ) {
    commands.push(command.data.toJSON());
  } else {
    console.log(
      `[WARNING] The command module member ${commandModuleMember} is missing a required "data" or "execute" property.`,
    );
  }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`,
    );

    // The put method is used to fully refresh all commands in the guild with the current set
    const data = (await rest.put(
      Routes.applicationGuildCommands(appId, guildId),
      { body: commands },
    )) as RESTPutAPIApplicationGuildCommandsResult;

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`,
    );
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
  }
})();

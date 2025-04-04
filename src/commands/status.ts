import { Interaction, SlashCommandBuilder } from "discord.js";
import { Command } from "./command.type.js";

export default {
  data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("Outputs information about the current state of the app"),
  execute: async (interaction: Interaction) => {
    if (interaction.isRepliable()) {
      interaction.reply("Lol");
    }
  },
};

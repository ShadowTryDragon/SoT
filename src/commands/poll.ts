import {
  Interaction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { ApiClient } from "../sot/api.js";

export default {
  data: new SlashCommandBuilder()
    .setName("poll")
    .setDescription("Polls the current ship state from the SoT API")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  execute: async (interaction: Interaction) => {
    if (interaction.isRepliable()) {
      interaction.deferReply();
      const ships = await ApiClient.getInstance().getGuildShips(
        "ad449ba1-b2e5-4ac0-9ec7-cc6131142c22",
      );
      interaction.followUp("```" + JSON.stringify(ships) + "```");
    }
  },
};

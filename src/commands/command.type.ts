import { Interaction, SlashCommandBuilder } from "discord.js";

export type Command = {
  data: SlashCommandBuilder;
  execute: (i: Interaction) => void;
};

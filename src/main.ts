import "dotenv/config";
import { GatewayIntentBits } from "discord.js";
import { App } from "./app/app.js";

process.env.TZ = "Europe/Berlin";
const app = new App({ intents: [GatewayIntentBits.Guilds] });
app.registerListener();
app.start(process.env.DISCORD_TOKEN);

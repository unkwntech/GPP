import {
    Client,
    Collection,
    Events,
    GatewayIntentBits,
    REST,
    Routes,
} from "discord.js";
import fs from "fs";
import path from "path";
require("dotenv").config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

client.once(Events.ClientReady, (readyClient) => {
    console.log("CLIENT LOGGED IN");
});
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;

    await command.execute(interaction);
});

//Load commands
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);
const commands = [];
for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs
        .readdirSync(commandsPath)
        .filter((file) => file.endsWith(".js"));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ("data" in command && "execute" in command) {
            client.commands.set(command.data.name, command);
            commands.push(command.data.toJSON());
        } else {
            console.log(
                `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
            );
        }
    }
}

const restClient = new REST().setToken(process.env.DISCORD_TOKEN);
restClient.put(
    Routes.applicationCommand(
        process.env.DISCORD_CLIENT_ID,
        process.env.DISCORD_GUILD_ID
    ),
    { body: commands }
);

client.login(process.env.DISCORD_TOKEN);

import {
    Client,
    Collection,
    Events,
    GatewayIntentBits,
    REST,
    Routes,
} from "discord.js";
import fs from "fs";
import mysql from "mysql";
import path from "path";
require("dotenv").config();

//https://discord.com/oauth2/authorize?client_id=1101135490847080508&permissions=563227045939264&scope=bot%20applications.commands

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

client.once(Events.ClientReady, (readyClient) => {
    console.info("CLIENT LOGGED IN");
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;

    await command.execute(interaction);
});

client.mysql = mysql.createConnection({
    host: "localhost",
    user: "cheesus",
    password: "password1",
    database: "cheesus",
});

//Load commands
const foldersPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(foldersPath);
const commands = [];
for (const file of commandFiles) {
    if (file.endsWith(".map")) continue;
    const filePath = path.join(foldersPath, file);
    const command = require(filePath).default;
    if (command === undefined) continue;
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ("data" in command && "execute" in command) {
        if ("init" in command) {
            command.init();
        }
        console.info(`Setting Up\t/${command.data.name}`);
        client.commands.set(command.data.name, command);
        commands.push(command.data.toJSON());
    } else {
        console.warn(
            `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
        );
    }
}

const restClient = new REST().setToken(process.env.DISCORD_TOKEN);
(async () => {
    await restClient.put(
        Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
        {
            body: commands,
        }
    );

    client.login(process.env.DISCORD_TOKEN);
})();

import axios from "axios";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName("rats")
        .setDescription("A random Rat gif to bring you fulfillment"),
    execute: async (interaction: ChatInputCommandInteraction) => {
        if (interaction.client.mysql.state !== "connected") {
            interaction.client.mysql.connect((err) => {
                console.info("MYSQL CONNECTED");
            });
        }

        axios
            .get(
                `https://tenor.googleapis.com/v2/search?q=rat&key=${process.env.TENOR_API_KEY}&client_key=discord&limit=1&media_filter=gif&random=true`
            )
            .then((res) => res.data)
            .then((data) => {
                interaction.reply(data.results[0].media_formats.gif.url);
            });
    },
};

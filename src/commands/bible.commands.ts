import axios from "axios";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

const RAT_QUOTES: string[] = [];

const arrayShuffle = (input: any[]) => {
    let array: any[] = [];
    Object.assign(array, input);
    let currentIndex = array.length;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {
        // Pick a remaining element...
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex],
            array[currentIndex],
        ];
    }
    return array;
};

export default {
    init: async () => {
        //fetch rat quotes
        axios
            .get(
                "https://raw.githubusercontent.com/minmatarfleet/minmatar.org/31339912a40d962742d3e1cd8b62213a4657b283/backend/reminders/messages/rat_quotes.py"
            )
            .then((res) => res.data)
            .then((data: string) => {
                const qJSON = data
                    .replaceAll("rat_quotes = ", "")
                    .replaceAll(",\n]", "\n]");
                RAT_QUOTES.push(...arrayShuffle(JSON.parse(qJSON)));
            });
    },
    data: new SlashCommandBuilder()
        .setName("bible")
        .setDescription("A random Rat quote to bring you fulfillment"),
    execute: async (interaction: ChatInputCommandInteraction) => {
        if (interaction.client.mysql.state !== "connected") {
            interaction.client.mysql.connect((err) => {
                console.info("MYSQL CONNECTED");
            });
        }

        var quote = RAT_QUOTES.shift() as string;
        RAT_QUOTES.push(quote);

        interaction.reply(quote);
    },
};

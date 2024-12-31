import axios from "axios";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

const TYPEID_CACHE: { [key: string]: { id: number; display: string } } = {};

export default {
    data: new SlashCommandBuilder()
        .setName("price")
        .setDescription("Get the current Jita price for an Item")
        .addStringOption((option) =>
            option
                .setName("itemName")
                .setDescription("Name of Item")
                .setRequired(true)
        ),
    execute: async (interaction: ChatInputCommandInteraction) => {
        let itemName = "";
        for (let option of interaction.options.data) {
            switch (option.name) {
                case "itemName":
                    itemName = option.value as string;
                    break;
            }
        }
        let typeID: number = -1;
        if (!TYPEID_CACHE[itemName]) {
            await axios
                .get(``)
                .then((res) => JSON.parse(res.data))
                .then((res) => {
                    typeID = res.typeID;
                    TYPEID_CACHE[itemName.toLocaleLowerCase()] = {
                        id: typeID,
                        display: res.typeName,
                    };
                });
        } else {
            typeID = TYPEID_CACHE[itemName].id;
        }

        axios
            .get(
                `https://market.fuzzwork.co.uk/aggregates/?station=60003760&types=${typeID}`
            )
            .then((res) => JSON.parse(res.data))
            .then((res) => {
                let messsage = `**${
                    TYPEID_CACHE[itemName].display
                }** @ **Jita**\n**Buy Orders**: ${
                    res[TYPEID_CACHE[itemName].id].buy.max
                }\n**Sell Orders**${res[TYPEID_CACHE[itemName].id].sell.min}`;

                interaction.reply(messsage);
            });
    },
};

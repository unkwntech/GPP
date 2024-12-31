import axios from "axios";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

const TYPEID_CACHE: { [key: string]: { id: number; display: string } } = {};

export default {
    data: new SlashCommandBuilder()
        .setName("pricecheck")
        .setDescription("Get the current Jita price for an Item")
        .addStringOption((option) =>
            option
                .setName("itemname")
                .setDescription("Name of Item")
                .setRequired(true)
        ),
    execute: async (interaction: ChatInputCommandInteraction) => {
        let itemName = "";
        for (let option of interaction.options.data) {
            switch (option.name) {
                case "itemname":
                    itemName = option.value as string;
                    break;
            }
        }
        let typeID: number = -1;
        if (!TYPEID_CACHE[itemName]) {
            await axios
                .get(
                    `https://www.fuzzwork.co.uk/api/typeid.php?typename=${itemName.replaceAll(
                        " ",
                        "%20"
                    )}`
                )
                .then((res) => res.data)
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
            .then((res) => res.data)
            .then((res) => {
                let messsage = `**${
                    TYPEID_CACHE[itemName].display
                }** @ **Jita**\n**Buy Orders**: ${parseFloat(
                    res[TYPEID_CACHE[itemName].id].buy.max
                ).toLocaleString("en-US")}\n**Sell Orders:** ${parseFloat(
                    res[TYPEID_CACHE[itemName].id].sell.min
                ).toLocaleString("en-US")}`;

                interaction.reply(messsage);
            });
    },
};

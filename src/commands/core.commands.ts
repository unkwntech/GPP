import { SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder().setName("gpp").setDescription("foobar"),
    execute: async (interaction: any) => {
        console.log("foobar");
    },
};

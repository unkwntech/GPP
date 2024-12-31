import axios from "axios";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
require("dotenv").config();

export default {
    data: new SlashCommandBuilder()
        .setName("route")
        .setDescription(
            "Find the shortest route from Sosala to the destination"
        )
        .addStringOption((option) =>
            option
                .setName("destination")
                .setDescription("Name of destination")
                .setRequired(true)
        ),
    execute: async (interaction: ChatInputCommandInteraction) => {
        console.log("route");
        let destination: string[] = [];

        for (let option of interaction.options.data) {
            switch (option.name) {
                case "destination":
                    destination = [option.value as string];
                    break;
            }
        }

        if (destination[0].toLowerCase() === "all") {
            destination = process.env.ROUTES_ALL.split(",");
        }

        axios
            .post("https://api.eve-scout.com/v2/public/routes", {
                from: "sosala",
                to: destination,
                preference: "shortest",
            })
            .then((res) => res.data)
            .then((dests) => {
                let output = "";
                for (let data of dests) {
                    output += `The shortest route to **${data.to}** is ${data.jumps} jumps `;
                    let i = 0;
                    let shortcut = false;
                    for (let system of data.route) {
                        if (system.system_name === "Thera") {
                            shortcut = true;
                            output += `through **Thera** via the entrance at [${
                                data.route[i - 1].system_name
                            }](https://evemaps.dotlan.net/map/${data.route[
                                i - 1
                            ].region_name.replaceAll(" ", "_")}/${
                                data.route[i - 1].system_name
                            }) , you will exit too [${
                                data.route[i + 1].system_name
                            }](https://evemaps.dotlan.net/map/${data.route[
                                i + 1
                            ].region_name.replaceAll(" ", "_")}/${
                                data.route[i + 1].system_name
                            }) .`;
                            break;
                        }
                        if (system.system_name === "Turnur") {
                            shortcut = true;
                            output += `via **Turnur**, you will exit too [${
                                data.route[i + 1].system_name
                            }](https://evemaps.dotlan.net/map/${data.route[
                                i + 1
                            ].region_name.replaceAll(" ", "_")}/${
                                data.route[i + 1].system_name
                            }) .\n`;
                            break;
                        }
                        i++;
                    }

                    if (!shortcut) {
                        output += "There is no shortcut.";
                    }
                }

                interaction.reply(output);
            })
            .catch((e) => {
                interaction.reply(
                    "I was unable to find a route to that system."
                );
                console.error(e);
            });
    },
};

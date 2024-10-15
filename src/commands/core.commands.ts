import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName("cheese")
        .setDescription("View your cheese (update if you have permissions)")
        .addUserOption((option) =>
            option
                .setName("person")
                .setDescription("person whos cheese you want to change")
                .setRequired(false)
        )
        .addIntegerOption((option) =>
            option
                .setName("cheese")
                .setDescription("cheese to add/remove")
                .setRequired(false)
        ),
    execute: async (interaction: ChatInputCommandInteraction) => {
        if (interaction.client.mysql.state !== "connected") {
            interaction.client.mysql.connect((err) => {
                console.info("MYSQL CONNECTED");
            });
        }
        let cheese = 0;
        if (interaction.options.data.length < 2) {
            interaction.client.mysql.query(
                `SELECT cheese FROM cheese WHERE discordID = "${interaction.user.id}"`,
                async (err, result) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    if (result.length < 1) cheese = 0;
                    else cheese = result[0].cheese;

                    await interaction.reply({
                        content: `${interaction.user.displayName} has ${cheese} cheese.`,
                        ephemeral: false,
                    });
                }
            );
            return;
        }

        let input_cheese = 0,
            input_target;

        for (let option of interaction.options.data) {
            switch (option.name) {
                case "person":
                    input_target = option.value;
                    break;
                case "cheese":
                    input_cheese = parseInt((option.value as string) ?? "0");
                    break;
            }
        }

        interaction.client.mysql.query(
            `SELECT cheese FROM cheese WHERE discordID = "${interaction.user.id}"`,
            async (err, result) => {
                if (err) {
                    console.error(err);
                    return;
                }
                let existingCheese = 0;
                if (result.length < 1) {
                    interaction.client.mysql.query(
                        `INSERT INTO cheese VALUES ("${interaction.user.id}", 0)`
                    );
                    existingCheese = 0;
                } else existingCheese = result[0].cheese;

                interaction.client.mysql.query(
                    `UPDATE cheese SET cheese = ${
                        existingCheese + input_cheese
                    } WHERE discordID = "${interaction.user.id}"`,
                    async (err, result) => {
                        if (err) {
                            console.error(err);
                            return;
                        }
                        if (result.affectedRows !== 1) {
                            console.warn("MORE THAN 1 ROW UPDATED");
                            return;
                        }

                        await interaction.reply({
                            content: `${
                                interaction.user.displayName
                            } was given ${input_cheese} cheese, they now have ${
                                existingCheese + input_cheese
                            }`,
                            ephemeral: false,
                        });
                    }
                );
            }
        );
        cheese += input_cheese;
    },
};

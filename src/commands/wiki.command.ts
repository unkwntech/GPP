import axios from "axios";
import {
    ActionRowBuilder,
    ChatInputCommandInteraction,
    ComponentType,
    SlashCommandBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
} from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName("wiki")
        .setDescription("Find and link a wiki page")
        .addStringOption((option) =>
            option
                .setName("search")
                .setDescription("Search Terms")
                .setRequired(true)
        ),
    execute: async (interaction: ChatInputCommandInteraction) => {
        let query = "";
        for (let option of interaction.options.data) {
            switch (option.name) {
                case "search":
                    query = option.value as string;
                    break;
            }
        }
        axios
            .post(`https://wiki.minmatar.org/graphql`, [
                {
                    operationName: null,
                    variables: {
                        query: query,
                    },
                    extensions: {},
                    query: "query ($query: String!) {\n  pages {\n    search(query: $query) {\n      results {\n        id\n        title\n        description\n        path\n        locale\n        __typename\n      }\n      suggestions\n      totalHits\n      __typename\n    }\n    __typename\n  }\n}\n",
                },
            ])
            .then(async (res) => {
                const data = res.data;
                const results = data[0].data.pages.search.results;
                if (data[0].data.pages.search.results.length === 0) {
                    interaction.reply(
                        "I didn't find any articles with those search terms."
                    );
                    return;
                }
                if (data[0].data.pages.search.results.length === 1) {
                    interaction.reply(
                        `https://wiki.minmatar.org/${results[0].path}`
                    );
                    return;
                }

                const select = new StringSelectMenuBuilder()
                    .setCustomId("result")
                    .setPlaceholder("Which article would you like to link?");

                for (let res of results) {
                    select.addOptions(
                        new StringSelectMenuOptionBuilder()
                            .setLabel(res.title)
                            .setDescription(res.path)
                            .setValue(res.id)
                    );
                }

                const row =
                    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
                        select
                    );

                const response = await interaction.reply({
                    content: "Multiple Articles Found",
                    components: [row],
                    withResponse: true,
                });

                const filter = (i: any) => i.user.id === interaction.user.id;

                try {
                    const confirmation =
                        await response.resource?.message?.awaitMessageComponent<ComponentType.StringSelect>(
                            { filter: filter, time: 15000 }
                        );
                    if (
                        confirmation === undefined ||
                        confirmation.values === undefined
                    ) {
                        throw new Error("");
                    }

                    let result = results.find(
                        (r: any) => r.id === confirmation.values[0]
                    );

                    interaction.editReply({
                        content: `https://wiki.minmatar.org/${result.path}`,
                        components: [],
                    });
                } catch {
                    await interaction.editReply({
                        content:
                            "No selection made within 1 minute, cancelling.",
                        components: [],
                    });
                }
            });
    },
};

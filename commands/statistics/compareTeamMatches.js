const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('team-matches')
        .setDescription('gives you past game of teams')
        .addStringOption(option => 
            option.setName('team_1_name')
                .setDescription('team 1 name')
                .setRequired(true)
                .setAutocomplete(true)
            )
        .addStringOption(option => 
            option.setName('team_2_name')
                .setDescription('team 2 name')
                .setRequired(true)
                .setAutocomplete(true)
            ),

    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused().toLowerCase();
        const choices = [
            "[Team 1] Excellent Century",
            "[Team 2] Supernova",
            "[Team 3] Sacrifice eSports",
            "[Team 4] Honor Level Zero",
            "[Team 5] OVGUcci",
            "[Team 6] WhalePower Goldfish",
            "[Team 7] FLY Super Stars",
            "[Team 8] VITA NXT",
            "[Team 9] Hubertus",
            "[Team 10] League of Ducks",
            "[Team 11] OVGUtglück",
            "[Team 12] Shiny Flemmli Impossible",
            "[Team 13] BANDLE CITY",
            "[Team 14] VITA",
            "[Team 15] Touch of Chaos",
            "[Team 16] Dream Ace"
        ];
        const filtered = choices.filter(choice => choice.toLowerCase().includes(focusedValue)).slice(0, 10);

        if (!interaction) return;

        await interaction.respond(
            filtered.map(choice => ({ name: choice, value: choice })),
        );
    },

    async execute(interaction) {

        const { options, channel, member } = interaction

        await interaction.reply("waiting on backend")

        const name1 = options.getString('team_1_name').split("] ").pop()
        const name2 = options.getString('team_2_name').split("] ").pop()

        const id1resp = await axios.get("http://localhost:8090/api/team/" + name1 + "/id")
        const id2resp  = await axios.get("http://localhost:8090/api/team/" + name2 + "/id")

        const id1 = id1resp.data
        const id2 = id2resp.data

        const response = await axios.get("http://localhost:8090/api/match/" + id1 + "/vs/" + id2)

        console.log(response.data)

        await interaction.editReply("Your requested stats:");
    },
}

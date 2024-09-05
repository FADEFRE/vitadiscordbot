const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('team-stats')
        .setDescription('gives you stats')
        .addStringOption(option => 
            option.setName('team_name')
                .setDescription('team name')
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

        const name = options.getString('team_name').split("] ").pop()

        const response = await axios.get("http://localhost:8090/api/team/" + name)

        console.log(response.data)

        const embedSetup = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(response.data.name)
                .setDescription('\u200B')
                .addFields(
                    { name: 'Highest Pick Rate', value: '\u200B' },
                    { name: String(response.data.highestPick_Champions_names?.[0]), value: String(response.data.highestPick_Percentage?.[0]), inline: true },
                    { name: String(response.data.highestPick_Champions_names?.[1]), value: String(response.data.highestPick_Percentage?.[1]), inline: true },
                    { name: String(response.data.highestPick_Champions_names?.[2]), value: String(response.data.highestPick_Percentage?.[2]), inline: true },
                    { name: '\u200B', value: '\u200B' },
                    { name: 'Highest Ban Rate', value: '\u200B' },
                    { name: String(response.data.highestBan_Champions_names?.[0]), value: String(response.data.highestBan_Percentage?.[0]), inline: true },
                    { name: String(response.data.highestBan_Champions_names?.[1]), value: String(response.data.highestBan_Percentage?.[1]), inline: true },
                    { name: String(response.data.highestBan_Champions_names?.[2]), value: String(response.data.highestBan_Percentage?.[2]), inline: true },
                    { name: '\u200B', value: '\u200B' },
                    { name: 'Highest Ban Rate Against', value: '\u200B' },
                    { name: String(response.data.highestBannedAgainst_Champions_names?.[0]), value: String(response.data.highestBannedAgainst_Percentage?.[0]), inline: true },
                    { name: String(response.data.highestBannedAgainst_Champions_names?.[1]), value: String(response.data.highestBannedAgainst_Percentage?.[1]), inline: true },
                    { name: String(response.data.highestBannedAgainst_Champions_names?.[2]), value: String(response.data.highestBannedAgainst_Percentage?.[2]), inline: true },
                )

        await channel.send({ embeds: [embedSetup]})

        await interaction.editReply("Your requested stats:");
    },
}

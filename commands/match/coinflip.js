const { SlashCommandBuilder, ChannelType, PermissionsBitField } = require('discord.js');
var teamTags = require('../util/teamTag.js')
const { refreshCache } = require('../util/uitlFunctions.js')

module.exports = {

    data: new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('flips a coin')
        .addRoleOption(option => option.setName('team_1')
            .setDescription('team_1')
            .setRequired(true)
        )
        .addRoleOption(option => option.setName('team_2')
            .setDescription('team_2')
            .setRequired(true)
        ),

    async execute(interaction) {

        const { options, channel } = interaction

        await interaction.reply('Flipping...');

        const team_1 = options.getRole('team_1');
        const team_2 = options.getRole('team_2');

        let winner = ""
        let side = ""

        var coin = await pickRandom()
        if(coin === 'heads') {
            winner = team_1.id
            side = 'Kopf!'
        }
        if(coin === 'tails') {
            winner = team_2.id
            side = 'Zahl!'
        }
        await channel.send(`**${side}**` + " -> Winner: " + `<@&${winner}>` + "\n\n Wollt ihr Blue Side oder Red Side?")
        interaction.editReply("Flipped:");

    },

}

async function pickRandom() {
    return Math.random() >= 0.5 ? "heads" : "tails"
}


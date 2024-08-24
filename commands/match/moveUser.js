const { SlashCommandBuilder, ChannelType, PermissionsBitField, PresenceUpdateStatus } = require('discord.js');
var teamTags = require('../util/teamTag.js')
var teamChannels = require('../util/teamChannel.js')

module.exports = {

    data: new SlashCommandBuilder()
        .setName('move-my-team-channel')
        .setDescription('moves you to your team channel'),

    async execute(interaction) {

        await interaction.reply('Working on it');

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.editReply("no permissions")
        else {
            const member = interaction.member

            const allTeamNameKeys = Object.keys(teamChannels)

            for (let index = 0; index < allTeamNameKeys.length; index++) {
                const element = allTeamNameKeys[index];
                if (interaction.member.roles.cache.some(role => role.name === element)) {
                    const entries = Object.entries(teamChannels)
                    const channelId =  entries[index][1]
                    try {
                        member.voice.setChannel(channelId).catch(err => {console.log("not connected to voice")})
                        interaction.editReply("Moved "+ member.user.username + " to their Team Channel");
                        return
                    } catch (error) {
                        console.log("test")
                    }
                }
                else {
                    interaction.editReply("Could not find Team");
                }
            }
        }
    },

}

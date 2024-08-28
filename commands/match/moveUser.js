const { SlashCommandBuilder } = require('discord.js');
var teamTags = require('../util/teamTag.js')
var teamChannels = require('../util/teamChannel.js')
const { refreshCache } = require('../util/uitlFunctions.js')

module.exports = {

    data: new SlashCommandBuilder()
        .setName('move-my-team-channel')
        .setDescription('moves you to your team channel'),

    async execute(interaction) {

        await interaction.reply('Working on it');

        const allTeamNameKeys = Object.keys(teamChannels)
        
        await refreshCache(interaction)

        
        const id = interaction.member.user.id
        const GUILD_ID = process.env.GUILD_ID;
        const g = await interaction.client.guilds.fetch(GUILD_ID).then(gi => {return gi})
        const memb = await g.members.fetch(id).then(m => {return m})
        const member = await g.members.fetch({user: memb, force: true}).then(m => {return m})

        for (let index = 0; index < allTeamNameKeys.length; index++) {
            const element = allTeamNameKeys[index];
            if (member.roles.cache.some(role => role.name === element)) {
                const entries = Object.entries(teamChannels)
                const channelId = entries[index][1]
                try {
                    member.voice.setChannel(channelId).catch(err => {console.log("not connected to voice")})
                    interaction.editReply("Moved '"+ member.user.globalName + "' to their Team Channel");
                    return
                } catch (error) {
                    console.log("test")
                }
            }
        }

        interaction.editReply("Could not find Team");
    }

}

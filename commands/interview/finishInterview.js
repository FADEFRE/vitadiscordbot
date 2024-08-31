const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
var teamChannels = require('../util/teamChannel.js')
const { refreshCache } = require('../util/uitlFunctions.js')

module.exports = {

    data: new SlashCommandBuilder()
        .setName('finish-interview')
        .setDescription('finishes the interview and moves partner back'),

    async execute(interaction) {

        await interaction.reply('Working on it');

        //early return
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.MoveMembers)) return interaction.editReply("no permissions")

        let liveChannel = null
        let interviewRole = null
        const REGIE_CHAT_A_ID = process.env.REGIE_CHAT_A_ID;
        const REGIE_CHAT_B_ID = process.env.REGIE_CHAT_B_ID;
        const INTERVIEW_A_ID = process.env.INTERVIEW_A_ID;
        const INTERVIEW_B_ID = process.env.INTERVIEW_B_ID;
        const LIVE_A_ID = process.env.LIVE_A_ID;
        const LIVE_B_ID = process.env.LIVE_B_ID;

        if (interaction.channel.id === REGIE_CHAT_A_ID) {
            liveChannel = LIVE_A_ID
            interviewRole = INTERVIEW_A_ID
        } 
        else if (interaction.channel.id === REGIE_CHAT_B_ID) {
            liveChannel = LIVE_B_ID
            interviewRole = INTERVIEW_B_ID
        }
        //testing channel
        else if (interaction.channel.id === '1278359714274480169') {
            liveChannel = LIVE_B_ID
            interviewRole = INTERVIEW_B_ID
        }
        else {
            return await interaction.editReply("Dieser Befehl funktioniert hier nicht :(")
        }

        const channel = await interaction.guild.channels.fetch(liveChannel)
        const allMembersInChannel = await channel.members.map((m) => m.user.id)
        const interviewMember = await getInterviewPartner(interaction, allMembersInChannel, interviewRole)
        
        if (!interviewMember) {
            return await interaction.editReply("Kein Interview Partner mehr im Channel :(")
        }
        

        const allTeamNameKeys = Object.keys(teamChannels)
        
        await refreshCache(interaction)

        const id = interviewMember.user.id
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
                    member.roles.remove(interviewRole).then(() => {})
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

async function getInterviewPartner(interaction, allMembersInChannel, interviewRole) {
    for (let index = 0; index < allMembersInChannel.length; index++) {
        const element = allMembersInChannel[index];
        const member = await interaction.guild.members.fetch(element).then(m => {return m})
        const memb = await interaction.guild.members.fetch({user: member.user, force: true}).then(m => {return m})
        const roles = await memb.roles.cache.filter((roles) => roles.id !== interaction.guild.id).map((role) => role)
        for (let index = 0; index < roles.length; index++) {
            const element = roles[index];
            if (element.id === interviewRole) {
                return memb
            }            
        }
        return null
    }
}

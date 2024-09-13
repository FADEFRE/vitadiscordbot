const { SlashCommandBuilder, ChannelType, PermissionsBitField } = require('discord.js');

var teamChannelId = require('../util/teamChannel.js')
const { refreshCache } = require('../util/uitlFunctions.js')

module.exports = {

    data: new SlashCommandBuilder()
        .setName('over')
        .setDescription('calls Match over')
        .addStringOption(option => option.setName('stream_slot')
            .setDescription('which Stream Slot')
            .setRequired(true)
            .addChoices(
                { name: 'A-Stream', value: 'A'},
                { name: 'B-Stream', value: 'B'},
                { name: 'No-Stream-1', value: 'No_One'},
                { name: 'No-Stream-2', value: 'No_Two'}
            )
        ),

    async execute(interaction) {

        const { options } = interaction
        
        await interaction.reply('Working on it');

        //early return
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.MoveMembers)) return interaction.editReply("no permissions")

        let categoryId = null
        const STREAM_A_CHANNEL_ID = process.env.STREAM_A_CHANNEL_ID;
        const STREAM_B_CHANNEL_ID = process.env.STREAM_B_CHANNEL_ID;
        const STREAM_NO_1_CHANNEL_ID = process.env.STREAM_NO_1_CHANNEL_ID;
        const STREAM_NO_2_CHANNEL_ID = process.env.STREAM_NO_2_CHANNEL_ID;
        const BACKUP_CHANNEL_ID = process.env.BACKUP_CHANNEL_ID;

        if (options.getString('stream_slot') === 'A') {
            categoryId = STREAM_A_CHANNEL_ID
        } 
        else if (options.getString('stream_slot') === 'B') {
            categoryId = STREAM_B_CHANNEL_ID
        }
        else if (options.getString('stream_slot') === 'No_One') {
            categoryId = STREAM_NO_1_CHANNEL_ID
        }
        else if (options.getString('stream_slot') === 'No_Two') {
            categoryId = STREAM_NO_2_CHANNEL_ID
        }

        const category = interaction.guild.channels.cache.get(categoryId);
        const childrenIds = category.children.cache.map(c => c.id);

        if (childrenIds.length === 0) {
            interaction.editReply("finished: no channels exist");
            return
        } 
        else {


            for (let index = 0; index < childrenIds.length; index++) {
                const channelId = childrenIds[index];
                
                const GUILD_ID = process.env.GUILD_ID;
                const guild = await interaction.client.guilds.fetch(GUILD_ID).then(gi => {return gi})

                if (channelId !== '') {
                    const channel = await guild.channels
                        .edit(channelId, { 
                            reason: 'backup'
                        })
                        .then(c => { return c})
                        
                    if (channel.type === ChannelType.GuildText) {
                        await channel.send("------- Match ist beendet -------")
                        await channel.setParent(BACKUP_CHANNEL_ID)
                        await channel.lockPermissions()
                    } else {
                        await refreshCache(interaction)
                        await wrapper(interaction, channel)
                    }
                        
                }
            }
    
    
            interaction.editReply("moved channel from " + options.getString('stream_slot') + "-Stream to Backup");
        }
    },
}


async function getTeam(allRoles, channel) {
    for (const role of allRoles) {
        if (role[1].name === channel.name) {
            return role[1]
        }
    }
}

async function getTeamChannelId(allRoles, channel) {
    for (const role of allRoles) {
        if (role[1].name === channel.name) {
            const teamName = role[1].name
            const allTeamNameKeys = Object.keys(teamChannelId)
            for (let index = 0; index < allTeamNameKeys.length; index++) {
                const element = allTeamNameKeys[index];
                if (element === teamName) {
                    const entries = Object.entries(teamChannelId)
                    return entries[index][1]
                }
            }
        }
    }
}


async function wrapper(interaction, channel) {
    const GUILD_ID = process.env.GUILD_ID;
    const guild = await interaction.client.guilds.fetch(GUILD_ID).then(gi => {return gi})

    const allRoles = await guild.roles.fetch().then(r => {return r})
    const team = await getTeam(allRoles, channel)
    const channelId = await getTeamChannelId(allRoles, channel)
    await moveChannelMembersOfTeam(guild, team, channelId)
    await deleteChannel(guild, channel)
}

async function moveChannelMembersOfTeam(guild, team, channelId) {
    const role = await guild.roles.fetch(team.id).then(r => {return r})
    const membersOfRole = role.members.map(m => m)

    const INTERVIEW_A_ID = process.env.INTERVIEW_A_ID;
    const INTERVIEW_B_ID = process.env.INTERVIEW_B_ID;

    for (let index = 0; index < membersOfRole.length; index++) {
        const member = membersOfRole[index];
        const membRole = await guild.members.fetch({user: member.user, force: true}).then(m => {return m})
        if (membRole.roles.cache.some(role => role.id === INTERVIEW_A_ID || role.id === INTERVIEW_B_ID)) { continue }
        try {
            await membRole.voice.setChannel(channelId).catch(err => {return})
        } catch (error) {
            console.log("test")
        }
    }
}

async function deleteChannel(guild, channel) {
    await guild.channels.delete(channel.id).then(console.log(channel.name + " deleted"))
}

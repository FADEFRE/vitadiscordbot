const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');

var teamChannelId = require('../util/teamChannel.js')

module.exports = {

    data: new SlashCommandBuilder()
        .setName('over')
        .setDescription('calls Match over')
        .addStringOption(option => option.setName('stream_slot')
            .setDescription('which Stream Slot')
            .setRequired(true)
            .addChoices(
                { name: 'A-Stream', value: 'A'},
                { name: 'B-Stream', value: 'B'}
            )
        ),

    async execute(interaction) {

        const { options, guild } = interaction

        let categoryId = null
        const STAFF_ID = process.env.STAFF_ID;
        const BOT_ID = process.env.BOT_ID;
        const STREAM_A_CHANNEL_ID = process.env.STREAM_A_CHANNEL_ID;
        const STREAM_B_CHANNEL_ID = process.env.STREAM_B_CHANNEL_ID;
        const BACKUP_CHANNEL_ID = process.env.BACKUP_CHANNEL_ID;

        if (options.getString('stream_slot') === 'A') {
            categoryId = STREAM_A_CHANNEL_ID
        } 
        else if (options.getString('stream_slot') === 'B') {
            categoryId = STREAM_B_CHANNEL_ID
        }

        const category = guild.channels.cache.get(categoryId);
        const childrenIds = category.children.cache.map(c => c.id);

        if (childrenIds.length === 0) {
            interaction.reply("finished: no channels exist");
            return
        }

        for (let index = 0; index < childrenIds.length; index++) {
            const channelId = childrenIds[index];
            
            if (channelId !== '') {
                const channel = await guild.channels
                    .edit(channelId, { 
                        permissionOverwrites: [
                            {
                                id: guild.id,
                                deny: [PermissionFlagsBits.ViewChannel],
                            },
                            {
                                id: STAFF_ID,
                                allow: [PermissionFlagsBits.ViewChannel],
                            },
                            {
                                id: BOT_ID,
                                allow: [PermissionFlagsBits.ViewChannel],
                            },
                        ],
                    })
                    .then(c => { return c})
                    
                if (channel.type === ChannelType.GuildText) {
                    channel.setParent(BACKUP_CHANNEL_ID);
                } else {
                    await wrapper(guild, channel)
                }
                    
            }
        }


        interaction.reply("moved channel from " + interaction.options.getString('stream_slot') + "-Stream to Backup");
    },
}


async function getTeam(guild, channel) {
    const allRoles = await guild.roles.fetch().then(r => {return r})
    for (const role of allRoles) {
        if (role[1].name === channel.name) {
            return role[1]
        }
    }
}

async function getTeamChannelId(guild, channel) {
    const allRoles = await guild.roles.fetch().then(r => {return r})
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


async function wrapper(guild, channel) {
    const team = await getTeam(guild, channel)
    const channelId = await getTeamChannelId(guild, channel)
    await moveChannelMembersOfTeam(guild, team, channelId)
    await deleteChannel(guild, channel)
}

async function moveChannelMembersOfTeam(guild, team, channelId) {
    const role = await guild.roles.fetch(team.id).then(r => {return r})
    const membersOfRole = role.members.map(m => m)
    for (let index = 0; index < membersOfRole.length; index++) {
        const member = membersOfRole[index];
        const memb = await guild.members.fetch({user: member.user, force: true}).then(m => {return m})

        try {
            memb.voice.setChannel(channelId).catch(err => {return})
        } catch (error) {
            console.log("test")
        }
    }
}

async function deleteChannel(guild, channel) {
    await guild.channels.delete(channel.id).then(console.log(channel.name + " deleted"))
}

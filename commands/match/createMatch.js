const { SlashCommandBuilder, ChannelType, PermissionsBitField } = require('discord.js');
var teamTags = require('../util/teamTag.js')
const { refreshCache } = require('../util/uitlFunctions.js')

module.exports = {

    data: new SlashCommandBuilder()
        .setName('create')
        .setDescription('creates new Match')
        .addRoleOption(option => option.setName('team_1')
            .setDescription('team_1')
            .setRequired(true)
        )
        .addRoleOption(option => option.setName('team_2')
            .setDescription('team_2')
            .setRequired(true)
        )
        .addStringOption(option => option.setName('stream_slot')
            .setDescription('which Stream Slot')
            .setRequired(true)
            .addChoices(
                { name: 'A-Stream', value: 'A'},
                { name: 'B-Stream', value: 'B'}
            )
        )
        .addStringOption(option => option.setName('name')
            .setDescription('channel name')
            .setRequired(true)
        ),

    async execute(interaction) {

        const { options, guild } = interaction

        await interaction.reply('Working on it');

        //early return
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.MoveMembers)) return interaction.editReply("no permissions")

        
        const text = options.getString('name');
        const team_1 = options.getRole('team_1');
        const team_2 = options.getRole('team_2');
        
        let categoryId = null
        const STREAM_A_CHANNEL_ID = process.env.STREAM_A_CHANNEL_ID;
        const STREAM_B_CHANNEL_ID = process.env.STREAM_B_CHANNEL_ID;
        const MATCHMANAGER_ID = process.env.MATCHMANAGER_ID;
        const matchmangerRole = await guild.roles.fetch(MATCHMANAGER_ID)
        
        if (options.getString('stream_slot') === 'A') {
            categoryId = STREAM_A_CHANNEL_ID
        } 
        else if (options.getString('stream_slot') === 'B') {
            categoryId = STREAM_B_CHANNEL_ID
        } 

        const tag_1 = await getTeamTag(team_1)
        const tag_2 = await getTeamTag(team_2)

        const channelName = tag_1 + " " + tag_2 + " " + text

        const channel = await guild.channels
            .create({
                name: channelName,
                type: ChannelType.GuildText,
            })
            .then((channel) => {
                channel.setParent(categoryId);
                return channel
            });

        await channel.permissionOverwrites.edit(matchmangerRole, { "ViewChannel": true })
        await channel.permissionOverwrites.edit(team_1, { "ViewChannel": true })
        await channel.permissionOverwrites.edit(team_2, { "ViewChannel": true })
            

        const channel_1 = await createVoiceChannel(guild, team_1, categoryId);
        await channel_1.permissionOverwrites.edit(matchmangerRole, { "ViewChannel": true })
        await channel_1.permissionOverwrites.edit(team_1, { "ViewChannel": true })

        const channel_2 = await createVoiceChannel(guild, team_2, categoryId);
        await channel_2.permissionOverwrites.edit(matchmangerRole, { "ViewChannel": true })
        await channel_2.permissionOverwrites.edit(team_2, { "ViewChannel": true })
        
        await refreshCache(interaction)
        await moveChannelMembersOfTeam(interaction, options.getRole('team_1'), channel_1.id)
        await refreshCache(interaction)
        await moveChannelMembersOfTeam(interaction, options.getRole('team_2'), channel_2.id)

        interaction.editReply("Channel: "+ channelName );

    },

}

async function getTeamTag(team) {
    const teamName = team.name
    const allTeamNameKeys = Object.keys(teamTags)
    for (let index = 0; index < allTeamNameKeys.length; index++) {
        const element = allTeamNameKeys[index];
        if (element === teamName) {
            const entries = Object.entries(teamTags)
            return entries[index][1]
        }
        
    }
}

async function createVoiceChannel(guild, team, categoryId) {
    const name = team.name
    return guild.channels
        .create({
            name: name,
            type: ChannelType.GuildVoice,
        })
        .then((channel) => {
            channel.setParent(categoryId);
            channel.lockPermissions()
            return channel
        });
}

async function moveChannelMembersOfTeam(interaction, team, channelId) {
    
    const GUILD_ID = process.env.GUILD_ID;
    const guild = await interaction.client.guilds.fetch(GUILD_ID).then(gi => {return gi})

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

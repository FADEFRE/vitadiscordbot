const { SlashCommandBuilder, ChannelType, PermissionsBitField, PresenceUpdateStatus } = require('discord.js');
var teamTags = require('../util/teamTag.js')
var teamChannels = require('../util/teamChannel.js')
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

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.editReply("no permissions")
        else {
            const text = options.getString('name');
            const team_1 = options.getRole('team_1');
            const team_2 = options.getRole('team_2');
            
            let categoryId = null
            let groupId = null
            const STREAM_A_CHANNEL_ID = process.env.STREAM_A_CHANNEL_ID;
            const STREAM_B_CHANNEL_ID = process.env.STREAM_B_CHANNEL_ID;
            
            if (options.getString('stream_slot') === 'A') {
                categoryId = STREAM_A_CHANNEL_ID
            } 
            else if (options.getString('stream_slot') === 'B') {
                categoryId = STREAM_B_CHANNEL_ID
            } 

            const tag_1 = await getTeamTag(team_1)
            const tag_2 = await getTeamTag(team_2)

            const channelName = tag_1 + " " + tag_2 + " " + text

            guild.channels
                .create({
                    name: channelName,
                    type: ChannelType.GuildText,
                })
                .then((channel) => {
                    channel.setParent(categoryId);
                });

            const channelId_1 = await createVoiceChannel(guild, team_1, categoryId);
            const channelId_2 = await createVoiceChannel(guild, team_2, categoryId);
            
            await refreshCache(interaction)
            await moveChannelMembersOfTeam(interaction, options.getRole('team_1'), channelId_1)
            await refreshCache(interaction)
            await moveChannelMembersOfTeam(interaction, options.getRole('team_2'), channelId_2)

            interaction.editReply("Channel: "+ channelName );
        }
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
            return channel.id
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

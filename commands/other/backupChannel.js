const { SlashCommandBuilder, ChannelType, PermissionsBitField } = require('discord.js');

var teamChannelId = require('../util/teamChannel.js')
const { refreshCache } = require('../util/uitlFunctions.js')

module.exports = {

    data: new SlashCommandBuilder()
        .setName('backup')
        .setDescription('moves channel to backup'),

    async execute(interaction) {

        const { options } = interaction
        
        await interaction.reply('Working on it');

        //early return
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return interaction.editReply("no permissions")

        const BACKUP_CHANNEL_ID = process.env.BACKUP_CHANNEL_ID;

        const channelId = interaction.channel.id;
        
        const GUILD_ID = process.env.GUILD_ID;
        const guild = await interaction.client.guilds.fetch(GUILD_ID).then(gi => {return gi})

        if (channelId !== '') {
            const channel = await guild.channels
                .edit(channelId, { 
                    reason: 'backup'
                })
                .then(c => { return c})
                
            if (channel.type === ChannelType.GuildText) {
                await channel.setParent(BACKUP_CHANNEL_ID)
                await channel.lockPermissions()
            } else {
                return interaction.editReply("this is not a text channel");
            }
                
        }

        await interaction.editReply("moved channel from " + options.getString('stream_slot') + "-Stream to Backup");
    },
}
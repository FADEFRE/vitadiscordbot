const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');

var teamChannelId = require('../util/teamChannel.js')

module.exports = {

    data: new SlashCommandBuilder()
        .setName('deletebackup')
        .setDescription('deletes bakcup'),

    async execute(interaction) {
        const BACKUP_CHANNEL_ID = process.env.BACKUP_CHANNEL_ID;

        const category = interaction.guild.channels.cache.get(BACKUP_CHANNEL_ID);
        const childrenIds = category.children.cache.map(c => c.id);

        if (childrenIds.length === 0) {
            interaction.reply("finished: no channels exist");
            return
        }

        childrenIds.forEach(channelId => {
            if (channelId !== '') {
                interaction.guild.channels
                    .edit(channelId, { 
                        permissionOverwrites: [
                            {
                                id: interaction.guild.id,
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
                    .then((channel) => {
                        interaction.guild.channels
                            .delete(channel.id)
                            .then()
                    })
            }
        });

        interaction.reply("deleted backup");
    },
}

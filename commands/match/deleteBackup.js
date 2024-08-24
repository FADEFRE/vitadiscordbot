const { SlashCommandBuilder } = require('discord.js');


module.exports = {

    data: new SlashCommandBuilder()
        .setName('deletebackup')
        .setDescription('deletes bakcup')
        .setDMPermission(false)
        .setDefaultMemberPermissions(0),

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
                interaction.guild.channels.delete(channelId)
            }
        });

        interaction.reply("deleted backup");
    },
}

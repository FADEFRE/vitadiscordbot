const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('clear-all-interview')
        .setDescription('clears all interview partner')
        .addStringOption(option => option.setName('stream_slot')
            .setDescription('which Stream Slot')
            .setRequired(true)
            .addChoices(
                { name: 'A-Stream', value: 'A'},
                { name: 'B-Stream', value: 'B'}
            )
        ),

    async execute(interaction) {

        await interaction.reply('Working on it');

        let categoryId = null
        const INTERVIEW_A_ID = process.env.INTERVIEW_A_ID;
        const INTERVIEW_B_ID = process.env.INTERVIEW_B_ID;

        //early return
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.MoveMembers)) return interaction.editReply("no permissions")

        const streamSlot = interaction.options.getString('stream_slot')

        if (streamSlot === 'A') {
            categoryId = INTERVIEW_A_ID
        } 
        else if (streamSlot === 'B') {
            categoryId = INTERVIEW_B_ID
        } 

        const role = interaction.guild.roles.cache.get(categoryId)
        role.members.forEach((member) => {
            member.roles.remove(role)
        });
        interaction.editReply("Removed all Interview Partner from " + streamSlot + "-Stream")
    }

}

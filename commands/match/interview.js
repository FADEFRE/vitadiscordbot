const { SlashCommandBuilder, EmbedBuilder  } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('interview')
        .setDescription('makes you an interview partner')
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('Erklärung'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('ready')
                .setDescription('Füge link ein und sei bereit')),

    async execute(interaction) {

        const { options, guild } = interaction

        //--------------------------------------------------------------------

        if (options.getSubcommand() === 'setup') {

            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('Interview')
                .setDescription('Some description here')
                .addFields(
                    { name: 'Regular field title', value: 'Some value here' },
                    { name: '\u200B', value: '\u200B' },
                    { name: 'Inline field title', value: 'Some value here', inline: true },
                    { name: 'Inline field title', value: 'Some value here', inline: true },
                )

            await interaction.reply({ embeds: [embed]});

        }

        //--------------------------------------------------------------------

        else if (options.getSubcommand() === 'ready') {
            await interaction.reply('Working on it');

            const link = options.getString('link')

        }

        //--------------------------------------------------------------------

        else {
            await interaction.reply('Error no fitting subcommand');
        }
    },
}
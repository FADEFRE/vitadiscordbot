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
                .setDescription('Sei bereit')),

    async execute(interaction) {

        const { options, guild } = interaction

        const VDO_NINJA_LINK_A = process.env.VDO_NINJA_LINK_A;
        const VDO_NINJA_LINK_B = process.env.VDO_NINJA_LINK_B;
        const STREAM_A_CHANNEL_ID = process.env.STREAM_A_CHANNEL_ID;
        const STREAM_B_CHANNEL_ID = process.env.STREAM_B_CHANNEL_ID;

        //--------------------------------------------------------------------

        let interviewLink = null

        if (interaction.channel.parentId === STREAM_A_CHANNEL_ID) {
            interviewLink = VDO_NINJA_LINK_A
        } 
        else if (interaction.channel.parentId === STREAM_B_CHANNEL_ID) {
            interviewLink = VDO_NINJA_LINK_B
        }
        else {
            return await interaction.reply("Du kannst leider kein Interview geben :(")
        }

        //--------------------------------------------------------------------

        if (options.getSubcommand() === 'setup') {

            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('Interview Setup')
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
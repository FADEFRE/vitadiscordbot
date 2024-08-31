const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
var teamTags = require('../util/teamTag.js')

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
                .setDescription('Sei bereit')
                .addStringOption(option => option.setName('ingame_name')
                    .setDescription('Dein Ingame Name')
                    .setRequired(true))
                .addStringOption(option => option.setName('real_name')
                    .setDescription('Der Name mit dem du angeschprochen werden willst')
                    .setRequired(true)
            )),

    async execute(interaction) {

        const { options, guild, member } = interaction

        const VDO_NINJA_LINK_A = process.env.VDO_NINJA_LINK_A;
        const VDO_NINJA_LINK_B = process.env.VDO_NINJA_LINK_B;
        const STREAM_A_CHANNEL_ID = process.env.STREAM_A_CHANNEL_ID;
        const STREAM_B_CHANNEL_ID = process.env.STREAM_B_CHANNEL_ID;
        
        const INTERVIEW_A_ID = process.env.INTERVIEW_A_ID;
        const INTERVIEW_B_ID = process.env.INTERVIEW_B_ID;
        const REGIE_CHAT_A_ID = process.env.REGIE_CHAT_A_ID;
        const REGIE_CHAT_B_ID = process.env.REGIE_CHAT_B_ID;

        //--------------------------------------------------------------------

        let interviewLink = null 
        let roleId = null
        let regieChannel = null

        if (interaction.channel.parentId === STREAM_A_CHANNEL_ID) {
            interviewLink = VDO_NINJA_LINK_A
            roleId = INTERVIEW_A_ID
            regieChannel = REGIE_CHAT_A_ID
        } 
        else if (interaction.channel.parentId === STREAM_B_CHANNEL_ID) {
            interviewLink = VDO_NINJA_LINK_B
            roleId = INTERVIEW_B_ID
            regieChannel = REGIE_CHAT_B_ID
        }
        //testing channel
        else if (interaction.channel.parentId === '1279535661740986471') {
            interviewLink = VDO_NINJA_LINK_B
            roleId = INTERVIEW_B_ID
            regieChannel = '1278359714274480169'
        }
        else {
            return await interaction.reply("Du kannst leider kein Interview geben :(")
        }

        //--------------------------------------------------------------------

        if (options.getSubcommand() === 'setup') {

            const embedSetup = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('Interview Setup')
                .setDescription('Some description here')
                .addFields(
                    { name: 'Regular field title', value: 'Some value here' },
                    { name: '\u200B', value: '\u200B' },
                    { name: 'Inline field title', value: 'Some value here', inline: true },
                    { name: 'Inline field title', value: 'Some value here', inline: true },
                    { name: '\u200B', value: interviewLink},
                )

            await interaction.reply({ embeds: [embedSetup]});

        }

        //--------------------------------------------------------------------

        else if (options.getSubcommand() === 'ready') {
            await interaction.reply('Working on it');

            const memberRoles = member.roles.cache
                .filter((roles) => roles.id !== interaction.guild.id)
                .map((role) => role.name)

            const interviewTeam = await findTeamName(memberRoles)

            

            

            const embedReply = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('Interview ist Ready!')
                .setDescription('Interview Partner Informationen:')
                .addFields(
                    { name: 'Spieler', value: options.getString('ingame_name'), inline: true },
                    { name: '\u200B', value: '\u200B', inline: true },
                    { name: 'Name', value: options.getString('real_name'), inline: true },
                    { name: 'Team', value: interviewTeam.split("] ").pop()},
                    { name: '\u200B', value: '\u200B' },
                    { name: 'VDO Ninja Link', value: interviewLink},
                    { name: '\u200B', value: '\u200B' },
                    { name: '\u200B', value: '\u200B' },
                    { name: 'ID', value: member.user.id },
                )

            const moveButton = new ButtonBuilder()
                .setCustomId('moveInterview')
                .setLabel('Move Interview Partner in Live Channel')
                .setStyle(ButtonStyle.Danger);

            const row = new ActionRowBuilder()
                .addComponents(moveButton);


            const channel = await guild.channels.fetch(regieChannel)
            await channel.send({ embeds: [embedReply], components: [row] })

            await interaction.editReply('Du wirst gemoved sobald die Regie ready ist. Bitte bleibe solange in einem Voice Channel');
        }

        //--------------------------------------------------------------------

        else {
            await interaction.reply('Error no fitting subcommand');
        }
    },
}

async function findTeamName(memberRoles) {
    const allTeamNameKeys = Object.keys(teamTags)

    for (let index = 0; index < memberRoles.length; index++) {
        const memberRole = memberRoles[index];

        for (let index = 0; index < allTeamNameKeys.length; index++) {
            const teamName = allTeamNameKeys[index];

            if (memberRole === teamName) {
                return teamName
            }
        }
    }

    return 'no team'
}
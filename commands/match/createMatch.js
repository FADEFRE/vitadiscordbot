const { SlashCommandBuilder, ChannelType } = require('discord.js');

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
        .addStringOption(option => option.setName('name')
            .setDescription('channel name')
            .setRequired(true)
        ),

    async execute(interaction) {
        console.log("hallo");
        const channelName = interaction.options.getString('name');
        const team_1_Name = interaction.options.getRole('team_1').name;
        const team_2_Name = interaction.options.getRole('team_2').name;
        const categoryId = '1275501203647762504';

        //const matchId = await this.getUnusedMatchId();
        const matchId = "000000";

        interaction.guild.channels
            .create({
                name: channelName,
                type: ChannelType.GuildText,
            })
            .then((channel) => {
                const categoryId = '1275501203647762504';
                channel.setParent(categoryId);
            });

        await createVoiceChannel(interaction, team_1_Name, categoryId);
        await createVoiceChannel(interaction, team_2_Name, categoryId);
        interaction.reply("MatchId: " + matchId + " - Channel: "+ channelName );
    },

}

async function createVoiceChannel(interaction, name, categoryId) {
    interaction.guild.channels
        .create({
            name: name,
            type: ChannelType.GuildVoice,
        })
        .then((channel) => {
            channel.setParent(categoryId);
        });
}

async function getUnusedMatchId() {
    const idArray = await db.get('matches');
    const newID = Math.floor(100000 + Math.random() * 900000).toString;

    while (idArray.includes(newID)) {
        newID = Math.floor(100000 + Math.random() * 900000).toString;
    }

    await db.push("matches", newID);
    return newID;
}
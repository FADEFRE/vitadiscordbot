const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('teams-all')
        .setDescription('gives you all teams'),

    async execute(interaction) {

        await interaction.reply("waiting on backend")

        const response = await axios.get("http://localhost:8090/api/team")

        const reply = response.data.map(team => team.discordName)
        
        let str = ""
        for (let index = 0; index < reply.length; index++) {
            const element = reply[index];
            if (index === 0) {
                str = element
            } 
            else {
                str = str + "\n" + element
            }
        }

        const rpl = `**${"printing all " + reply.length + " teams:\n"}**`

        await interaction.editReply(rpl + str)
        return
    },
}

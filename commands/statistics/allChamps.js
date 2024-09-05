const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('champions-all')
        .setDescription('gives you all champions'),

    async execute(interaction) {

        await interaction.reply("waiting on backend")

        const response = await axios.get("http://localhost:8090/api/champion")

        const reply = response.data.map(champ => champ.name)

        console.log(reply[0])

        await interaction.channel.send("printing all " + reply.length + " champions")
        for (let index = 0; index < reply.length; index++) {
            const element = reply[index];
            await interaction.channel.send(index + ": " + element)
        }

        
        await interaction.editReply("done")
    },
}

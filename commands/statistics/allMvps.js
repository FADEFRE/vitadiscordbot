const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mvps-all')
        .setDescription('gives you all mvps'),

    async execute(interaction) {

        const { options, channel, member } = interaction

        await interaction.reply("waiting on backend")

        const response = await axios.get("http://localhost:8090/api/player/mvp/all")

        const reply = response.data.map(player => player)

        console.log(reply[0])

        const embedSetup = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle("All Mvps:")
                .setDescription('\u200B')
                .addFields(
                    
                )
        
        for (let i = 0; i < reply.length; i++) {
            for (let j = i+1; j < reply.length; j++) {
                if (reply[i].number < reply[j].number) {
                    const temp = reply[i]
                    reply[i] = reply[j]
                    reply[j] = temp;
                }
            }
        }



        for (let index = 0; index < reply.length; index++) {
            const element = reply[index];
            embedSetup.addFields(
                { name: String(element.name), value: String(element.number)},
            )
        }
        

        await channel.send({ embeds: [embedSetup]})


        await interaction.editReply("done")
    },
}

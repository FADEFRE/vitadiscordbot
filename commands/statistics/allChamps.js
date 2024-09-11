const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('champions-all')
        .setDescription('gives you all champions')
        .addStringOption(option => option.setName('stat-option')
            .setDescription('what stats you want (shows top 5 / "full" shows all top 3)')
            .setRequired(true)
            .addChoices(
                { name: 'Most Picked', value: 'Most Picked'},
                { name: 'Most Banned', value: 'Most Banned'},
                { name: 'Highest Presence', value: 'Highest Presence'},
                { name: 'Highest Winrate', value: 'Highest Winrate'},
                { name: 'Lowest Winrate', value: 'Lowest Winrate'}
            )
        )
        ,

    async execute(interaction) {

        const { options, channel } = interaction

        await interaction.reply("waiting on backend")

        const stat = options.getString('stat-option');

        const response = await request(stat)

        if (!response) { await interaction.editReply("error with data fetch"); return; }

        
        const embedSetup = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(stat)
                .setDescription('\u200B')

        
        await printStats(response, stat, embedSetup, channel)

        await interaction.editReply("Your requested stats:")
    },
}

async function request(stat) {
    let response = null

    switch (stat) {
        case 'Most Picked':
            response = await axios.get("http://localhost:8090/api/champion/picked")
            break;
        case 'Most Banned':
            response = await axios.get("http://localhost:8090/api/champion/banned")
            break;
        case 'Highest Presence':
            response = await axios.get("http://localhost:8090/api/champion/presence")
            break;
        case 'Highest Winrate':
            response = await axios.get("http://localhost:8090/api/champion/winrate")
            break;
        case 'Lowest Winrate':
            response = await axios.get("http://localhost:8090/api/champion/lossrate")
            break;
        case 'Flawless Win':
            response = await axios.get("http://localhost:8090/api/champion/winrate/flawless")
            break;
        case 'Flawless Loss':
            response = await axios.get("http://localhost:8090/api/champion/lossrate/flawless")
            break;
    
        default:
            break;
    }
    return response;
}

async function printStats(response, stat, embedSetup, channel) {
    for (let index = 0; index < response.data.length; index++) {
        const element = response.data[index];
        let statOne = ""
        let statTwo = ""
        if (stat === 'Most Picked') {
            const rate = (element.wins/element.totalPick)*100
            statOne = String(element.averagePick?.toFixed(2) + "%")
            statTwo = String("Total: " + element.totalPick + "\n Winrate: " + rate?.toFixed(2) + "%")
        }
        if (stat === 'Most Banned') {
            const total = await axios.get("http://localhost:8090/api/match/total")
            const bans = element.totalPickBan - element.totalPick
            const rate = (bans/total.data)*100
            statOne = String(rate?.toFixed(2) + "%")
            statTwo = "Total: " + String(bans)
        }
        if (stat === 'Highest Presence') {
            const bans = element.totalPickBan - element.totalPick
            statOne = String(element.averagePickBan?.toFixed(2) + "%")
            statTwo = "Total/Pick/Ban: " + String(element.totalPickBan) + "/" + String(element.totalPick) + "/" + String(bans)
        }
        if (stat === 'Highest Winrate' || stat === 'Lowest Winrate') {
            const rate = (element.wins/element.totalPick)*100
            statOne = String(rate?.toFixed(2) + "%")
            statTwo = "Win/Loss: " + String(element.wins) + "/" + String(element.loss)
        }

        embedSetup.addFields(
            { name: String(index+1 + ". " + element.name + "     -     " + statOne), value: statTwo},
        )
    }

    await channel.send({ embeds: [embedSetup]})

    if (stat === 'Highest Winrate') {
        const reponse2 = await request('Flawless Win')

        if (!reponse2.data) {
            await interaction.editReply("Your requested stats:")
            return
        }

        const embedFlawless = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(stat + " - Flawless")
            .setDescription('These Champions have a 100% Winrate:\n(with at least 2 Wins total)')

        for (let index = 0; index < reponse2.data.length; index++) {
            const element = reponse2.data[index];
            embedFlawless.addFields(
                { name: String(index+1 + ". " + element.name), value: String("Wins: " + element.wins)},
            )
        }

        await channel.send({ embeds: [embedFlawless]})
    }

    if (stat === 'Lowest Winrate') {
        const reponse2 = await request('Flawless Loss')

        if (!reponse2.data) {
            await interaction.editReply("Your requested stats:")
            return
        }

        const embedFlawless = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(stat + " - Flawless")
            .setDescription('These Champions have a 0% Winrate:\n(with at least 2 Loss total)')

        for (let index = 0; index < reponse2.data.length; index++) {
            const element = reponse2.data[index];
            embedFlawless.addFields(
                { name: String(index+1 + ". " + element.name), value: String("Losses: " + element.loss)},
            )
        }

        await channel.send({ embeds: [embedFlawless]})
    }
}
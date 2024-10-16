const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('champion-matches')
        .setDescription('gives you matches')
        .addStringOption(option => 
            option.setName('champion_name')
                .setDescription('Champion name')
                .setRequired(true)
                .setAutocomplete(true)
            )
        .addStringOption(option => option.setName('what_stat')
        .setDescription('what stat')
        .setRequired(true)
        .addChoices(
            { name: 'picked', value: 'picked'},
            { name: 'banned', value: 'banned'},
            { name: 'won', value: 'won'},
            { name: 'lost', value: 'lost'}
        )
        ),

    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused().toLowerCase();
        const choices = [
            "Aatrox",
            "Ahri",
            "Akali",
            "Akshan",
            "Alistar",
            "Amumu",
            "Anivia",
            "Annie",
            "Aphelios",
            "Ashe",
            "Aurelion Sol",
            "Aurora",
            "Azir",
            "Bard",
            "Bel'Veth",
            "Blitzcrank",
            "Brand",
            "Braum",
            "Briar",
            "Caitlyn",
            "Camille",
            "Cassiopeia",
            "Cho'Gath",
            "Corki",
            "Darius",
            "Diana",
            "Dr. Mundo",
            "Draven",
            "Ekko",
            "Elise",
            "Evelynn",
            "Ezreal",
            "Fiddlesticks",
            "Fiora",
            "Fizz",
            "Galio",
            "Gangplank",
            "Garen",
            "Gnar",
            "Gragas",
            "Graves",
            "Gwen",
            "Hecarim",
            "Heimerdinger",
            "Hwei",
            "Illaoi",
            "Irelia",
            "Ivern",
            "Janna",
            "Jarvan IV",
            "Jax",
            "Jayce",
            "Jhin",
            "Jinx",
            "K'Sante",
            "Kai'Sa",
            "Kalista",
            "Karma",
            "Karthus",
            "Kassadin",
            "Katarina",
            "Kayle",
            "Kayn",
            "Kennen",
            "Kha'Zix",
            "Kindred",
            "Kled",
            "Kog'Maw",
            "LeBlanc",
            "Lee Sin",
            "Leona",
            "Lillia",
            "Lissandra",
            "Lucian",
            "Lulu",
            "Lux",
            "Malphite",
            "Malzahar",
            "Maokai",
            "Master Yi",
            "Milio",
            "Miss Fortune",
            "Mordekaiser",
            "Morgana",
            "Naafiri",
            "Nami",
            "Nasus",
            "Nautilus",
            "Neeko",
            "Nidalee",
            "Nilah",
            "Nocturne",
            "Nunu",
            "Olaf",
            "Orianna",
            "Ornn",
            "Pantheon",
            "Poppy",
            "Pyke",
            "Qiyana",
            "Quinn",
            "Rakan",
            "Rammus",
            "Rek'Sai",
            "Rell",
            "Renata Glasc",
            "Renekton",
            "Rengar",
            "Riven",
            "Rumble",
            "Ryze",
            "Samira",
            "Sejuani",
            "Senna",
            "Seraphine",
            "Sett",
            "Shaco",
            "Shen",
            "Shyvana",
            "Singed",
            "Sion",
            "Sivir",
            "Skarner",
            "Smolder",
            "Sona",
            "Soraka",
            "Swain",
            "Sylas",
            "Syndra",
            "Tahm Kench",
            "Taliyah",
            "Talon",
            "Taric",
            "Teemo",
            "Thresh",
            "Tristana",
            "Trundle",
            "Tryndamere",
            "Twisted Fate",
            "Twitch",
            "Udyr",
            "Urgot",
            "Varus",
            "Vayne",
            "Veigar",
            "Vel'Koz",
            "Vex",
            "Vi",
            "Viego",
            "Viktor",
            "Vladimir",
            "Volibear",
            "Warwick",
            "Wukong",
            "Xayah",
            "Xerath",
            "Xin Zhao",
            "Yasuo",
            "Yone",
            "Yorick",
            "Yuumi",
            "Zac",
            "Zed",
            "Zeri",
            "Ziggs",
            "Zilean",
            "Zoe",
            "Zyra"
        ];
        const filtered = choices.filter(choice => choice.toLowerCase().includes(focusedValue)).slice(0, 10);

        if (!interaction) return;

        await interaction.respond(
            filtered.map(choice => ({ name: choice, value: choice })),
        );
    },

    async execute(interaction) {

        const { options, channel, member } = interaction

        await interaction.reply("waiting on backend")

        const whatStat = options.getString('what_stat');

        const response = await axios.get("http://localhost:8090/api/champion/" + options.getString('champion_name') + "/matches/" + whatStat)

        await createAndSendEmbeds(channel, response)

        await interaction.editReply("Your requested stats:");
    },
}

async function createAndSendEmbeds(channel, response) {
    console.log(response.data)
    const array = response.data.matches;
    const numberOfEmbeds = Math.ceil(array.length / 8)
    for (let index = 0; index < numberOfEmbeds; index++) {
        const page = index+1
        
        const embedPage = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(String(response.data.champion.name + "  -  Page " + page))

        const start = 0 + index*8
        const normalEnd = start+8
        const correctEnd = Math.min(normalEnd, array.length-1)
        for (let j = start ; j < correctEnd; j++) {
            const element = array[j];
            const counter = j+1
            embedPage.addFields(
                { name: String("Match " + counter), value: String(element.teamOne + " vs " + element.teamTwo) },
                { name: 'Winner', value: String(element.winner) },
            )
            if (array.length-1 > j) {
                embedPage.addFields(
                    { name: '\u200B', value: '\u200B' },
                )
            }            
        }

        await channel.send({ embeds: [embedPage]})
    }
}

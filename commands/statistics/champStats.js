const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('champion-stats')
        .setDescription('gives you stats')
        .addStringOption(option => 
            option.setName('champion_name')
                .setDescription('Champion name')
                .setRequired(true)
                .setAutocomplete(true)
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

        const response = await axios.get("http://localhost:8090/api/champion/" + options.getString('champion_name'))

        console.log(response.data)

        const embedSetup = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(response.data.name)
                .addFields(
                    { name: 'Pick/Ban Rate', value: String(response.data.averagePickBan.toFixed(2) + "%") },
                    { name: 'Pick Rate', value: String(response.data.averagePick.toFixed(2) + "%") },
                    { name: '\u200B', value: '\u200B' },
                    { name: 'Wins', value: String(response.data.wins), inline: true },
                    { name: 'Loss', value: String(response.data.loss), inline: true },
                )

        await channel.send({ embeds: [embedSetup]})

        await interaction.editReply("Your requested stats:");
    },
}

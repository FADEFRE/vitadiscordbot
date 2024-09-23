require('dotenv').config(); //This will be used to store private keys
const path = require('path');
const fs = require('fs');
const deployCommands = require('./deploy/deployCommands');
const { Client, Collection, Events, GatewayIntentBits, Options, Routes, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle  } = require('discord.js');
var teamChannelId = require('./commands/util/teamChannel.js')

const BOT_TOKEN = process.env.CLIENT_TOKEN;

const client = new Client({ 
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);


for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

//Register our commands
deployCommands();


client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
	if (interaction.isChatInputCommand()) {
		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}
	
		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
			} else {
				await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
			}
		}
	}

	else if (interaction.isButton()) {
		if (interaction.customId === 'moveInterview') {

			await interaction.reply("trying to move")

			let channelId = null
			const REGIE_CHAT_A_ID = process.env.REGIE_CHAT_A_ID;
			const REGIE_CHAT_B_ID = process.env.REGIE_CHAT_B_ID;
			const LIVE_A_ID = process.env.LIVE_A_ID;
			const LIVE_B_ID = process.env.LIVE_B_ID;

			if (interaction.message.channelId === REGIE_CHAT_A_ID) {
				channelId = LIVE_A_ID
			} 
			else if (interaction.message.channelId === REGIE_CHAT_B_ID) {
				channelId = LIVE_B_ID
			}
			//testing channel
			else if (interaction.channel.parentId === '1279535661740986471') {
				channelId = LIVE_B_ID
			}
			else {
				await interaction.editReply("fuck")
			}

			const userId = interaction.message.embeds[0].data.fields.filter((fields) => fields.name === 'ID').map((field) => field.value)[0]
			const teamName = interaction.message.embeds[0].data.fields.filter((fields) => fields.name === 'TeamFull').map((field) => field.value)[0]
			const memb = await interaction.guild.members.fetch(userId).then(m => {return m})
			let memberName = ""
			if (memb.nickname === null) {
				memberName = memb.user.username
			} else {
				memberName = memb.nickname
			}

			const embedReply = new EmbedBuilder()
                .setColor(0x0099FF)
                .addFields(
                    { name: 'Spieler', value: memberName},
                    { name: 'TeamName', value: teamName},
                    { name: 'ID', value: userId },
                )

			const moveButton = new ButtonBuilder()
                .setCustomId('returnInterview')
                .setLabel('Move Interview Partner back to their Team Channel')
                .setStyle(ButtonStyle.Success);

            const row = new ActionRowBuilder()
                .addComponents(moveButton);

			try {
				await memb.voice
					.setChannel(channelId)
					.catch(err => {interaction.editReply("User " + memb.user.displayName + " not in Voice Channel"); return})
				await interaction.editReply("moved")
				await interaction.channel.send({embeds: [embedReply], components: [row]})
			} catch (error) {
				console.log("test")
			}
		}

		if (interaction.customId === 'returnInterview') {

			await interaction.reply("trying to move")

			let channelId = ""

			const userId = interaction.message.embeds[0].data.fields.filter((fields) => fields.name === 'ID').map((field) => field.value)[0]
			const teamName = interaction.message.embeds[0].data.fields.filter((fields) => fields.name === 'TeamName').map((field) => field.value)[0]
			const memb = await interaction.guild.members.fetch(userId).then(m => {return m})

			const allTeamNameKeys = Object.keys(teamChannelId)
            for (let index = 0; index < allTeamNameKeys.length; index++) {
                const element = allTeamNameKeys[index];
                if (element === teamName) {
                    const entries = Object.entries(teamChannelId)
					console.log(entries[index][1])
                    channelId = entries[index][1]
					break
                }
            }

			const INTERVIEW_A_ID = process.env.INTERVIEW_A_ID;
			const INTERVIEW_B_ID = process.env.INTERVIEW_B_ID;

			const roleA = interaction.guild.roles.cache.get(INTERVIEW_A_ID)
			const roleB = interaction.guild.roles.cache.get(INTERVIEW_B_ID)
			memb.roles.remove(roleA)
			memb.roles.remove(roleB)

			try {
				await memb.voice
					.setChannel(channelId)
					.catch(err => {interaction.editReply("User " + memb.user.displayName + " not in Voice Channel"); return})
				await interaction.editReply("moved")
			} catch (error) {
				console.log("test")
			}
		}
	}

	else if (interaction.isAutocomplete()) { 
		const command = client.commands.get(interaction.commandName);

		if (!command) return console.log('Command was not found');

		if (!command.autocomplete) {
			return console.error(
			`No autocomplete handler was found for the ${interaction.commandName} command.`,
			);
		}
	
		try {
			await command.autocomplete(interaction);
		} catch (error) {
			console.error(error);
		}
	}

	else {
		return
	}
});

client.login(BOT_TOKEN);
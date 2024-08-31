require('dotenv').config(); //This will be used to store private keys
const path = require('path');
const fs = require('fs');
const deployCommands = require('./deploy/deployCommands');
const { Client, Collection, Events, GatewayIntentBits, Options, Routes } = require('discord.js');

const BOT_TOKEN = process.env.CLIENT_TOKEN;

const client = new Client({ 
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
	// makeCache: Options.cacheWithLimits({
	// 	...Options.DefaultMakeCacheSettings,
	// 	ReactionManager: 0,
	// 	GuildMemberManager: {
	// 		maxSize: 0,
	// 		keepOverLimit: member => member.id === member.client.user.id,
	// 	},
	// 	UserManager: {
	// 		maxSize: 0,
	// 	},
	// }),
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
		// Set a new item in the Collection with the key as the command name and the value as the exported module
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
			const memb = await interaction.guild.members.fetch(userId).then(m => {return m})
			try {
				await memb.voice.setChannel(channelId).catch(err => {interaction.editReply("User " + memb.user.displayName + " not in Voice Channel"); return})
			} catch (error) {
				console.log("test")
			}
		}
	}

	else {
		return
	}
});

client.login(BOT_TOKEN);
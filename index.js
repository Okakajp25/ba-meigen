const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, PresenceUpdateStatus, ActivityType, WebhookClient, EmbedBuilder, ChannelType } = require('discord.js');
const { embedMessages } = require('./meigen_list');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config()


const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
const webhook = new WebhookClient({ url:`${process.env.WEBHOOK_URL}}`})
const prisma = new PrismaClient()

client.on('ready', async () => {
	await update()
	console.log(`${client.user.tag}でログインしました。`)
	const guilds = client.guilds.cache.map(guilds => guilds.id).join("\n")
	const guilds_name = client.guilds.cache.map(guilds => guilds.name).join("\n")
	//client.guilds.cache.map(guilds => guilds.channels.cache.filter(channel => channel.type === ChannelType.GuildText)).forEach(channel => {console.log(`${channel}`)})
	const embed = new EmbedBuilder()
	.setTitle("Server list")
	.setDescription(`${guilds}\r${guilds_name}\r\rPing:${client.ws.ping}ms`)
	.setColor("Gold");
	client.channels.cache.get(process.env.CHANNEL_ID).send({ embeds: [embed]})
});

client.login(process.env.TOKEN);


client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`${filePath} に必要な "data" か "execute" がありません。`);
	}
}

client.on('interactionCreate', async interaction => {
	//if (!interaction.isChatInputCommand() || !interaction.isMessageContextMenuCommand()) return;
	const guildId = interaction.guildId
	const channelId = interaction.channelId
	const msgId = interaction.targetMessage
	client.channels.cache.get(process.env.CHANNEL_ID).send(`Ping: ${client.ws.ping}ms\rGuild: ${guildId}\rChannel: ${channelId}\rTargetId: ${msgId}`)

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`${interaction.commandName} が見つかりません。`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'エラーが発生しました。', ephemeral: true });
	}
});


async function update() {
	setInterval(async () => {
		const db_id = await prisma.meigen.findMany({
			select: {
				id: true
			}
		})
		client.user.setStatus(PresenceUpdateStatus.Idle)
		const id = db_id.map(item => Number(item.id))
		const maxId = Math.max(...id)
		client.user.setStatus(PresenceUpdateStatus.Idle)
		client.user.setActivity({
			name: `現在登録されている迷言の数は${maxId}個です`,
			url: 'https://www.youtube.com/watch?v=LLjfal8jCYI',
			type: ActivityType.Streaming
		})
		console.log(`count ${maxId}`)
	}, 30000)
}

const { SlashCommandBuilder, WebhookClient, EmbedBuilder } = require('discord.js')
const { embedMessages } = require('../meigen_list')
const { PrismaClient } = require('@prisma/client')
require('dotenv').config()

const webhook = new WebhookClient({ url:`${process.env.WEBHOOK_URL}`})
const prisma = new PrismaClient()
module.exports = {
    data: new SlashCommandBuilder()
    .setName('mlist')
    .setDescription('send all meigen'),

    async execute(interaction) {
        await interaction.deferReply({ephemeral: true});
        const log_embed = new EmbedBuilder()
            .setTitle('Request all')
            .setColor('DarkOrange')
            .setDescription(`Request all list\r${new Date()}`);
            webhook.send({
                embeds: [log_embed]
            })

        const chunkSize = 10;
        const db_id = await prisma.meigen.findMany({
			select: {
				id: true
			}
		})
        const db = await prisma.meigen.findMany()
		const id = db_id.map(item => Number(item.id))
		const maxId = Math.max(...id)
        for(let i = 0; i <maxId; i += chunkSize) {
            const chunk = db.slice(i, i + chunkSize);
            const data = chunk.map(msg => ({
                title: msg.name,
                description: `${msg.dep} (${msg.id})`,
                image: { url: msg.url }
            }))
            await interaction.followUp({embeds: data, ephemeral: true})
        }
    }
}
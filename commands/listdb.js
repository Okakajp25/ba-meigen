const { SlashCommandBuilder } = require('discord.js')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

module.exports = {
    data: new SlashCommandBuilder()
    .setName('listdb')
    .setDescription('listdb'),
    async execute(interaction) {
        const meigens = await prisma.meigen.findMany()
        
        await interaction.reply('')
    }
}
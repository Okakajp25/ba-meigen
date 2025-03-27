const { SlashCommandBuilder, EmbedBuilder, WebhookClient } = require('discord.js')
const { S3 } = require('aws-sdk')
const { PrismaClient } = require('@prisma/client')
const { json } = require('../meigen_list')

const prisma = new PrismaClient()
const webhook = new WebhookClient({ url:'https://discord.com/api/webhooks/1348641171538448395/CKoGximeH5Y3oGFPAsYRa6yFJvWcoV-EtRIeu7JmWZpYhrbiy8JltAMBFJXqqd5HENWk'})
const choices = Object.entries(json).map(([value, name]) => ({
    name,
    value,
}));

module.exports = {
    data: new SlashCommandBuilder()
    .setName('addmeigen')
    .setDescription('addmeigen image')
    .addStringOption(option =>
        option.setName('username')
        .setDescription('input username')
        .addChoices(...choices)
        .setRequired(true)
    )
    .addAttachmentOption(option => 
        option.setName('image')
        .setDescription('add image')
        .setRequired(true)
    ),
    async execute(interaction) {
        await interaction.deferReply();
        const image = interaction.options.getAttachment('image')
        const text = interaction.options.getString('username')
        const message = webhook.send({ files: [image]})
        const url = (await message).attachments[0].url
        console.log(url)
        const putdb = await prisma.meigen.create({
            data: {
                name: text,
                dep: text,
                url: url
            }
        })
        const embed = new EmbedBuilder()
        .setTitle(`${putdb.name} is add!`)
        .setDescription(`${putdb.dep} (${putdb.id})`)
        .setImage(`${putdb.url}`)
        await interaction.followUp({embeds: [embed]})
        
    }
}
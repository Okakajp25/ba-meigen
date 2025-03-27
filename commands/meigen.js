const { SlashCommandBuilder, EmbedBuilder, WebhookClient } = require('discord.js');
const { json } = require('../meigen_list');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const choices = Object.entries(json).map(([value, name]) => ({
    name,
    value,
}));

const webhook = new WebhookClient({ url: 'https://discord.com/api/webhooks/1348641171538448395/CKoGximeH5Y3oGFPAsYRa6yFJvWcoV-EtRIeu7JmWZpYhrbiy8JltAMBFJXqqd5HENWk' });

module.exports = {
    data: new SlashCommandBuilder()
        .setName('meigen')
        .setDescription('meigenを返します')
        .addStringOption(option =>
            option.setName('user')
                .setDescription('please_choice')
                .addChoices(...choices)
        ),
    async execute(interaction) {
        await interaction.deferReply(); // 応答を遅らせることを通知

        try {
            const selectedUser = interaction.options.getString('user');
            const db_ids = await prisma.meigen.findMany({
                select: {
                    id: true
                }
            });
            const ids = db_ids.map(item => Number(item.id));
            const maxId = Math.max(...ids);
            
            if(maxId === -Infinity || maxId === 0){
                await interaction.editReply("データベースに名言がありません。");
                return;
            }

            const randomIndex = Math.floor(Math.random() * maxId) + 1; // 1からmaxIdまでの乱数を生成
            

            if (selectedUser) {
                const userQuotes = await prisma.meigen.findMany({
                    where: {
                        name: selectedUser,
                    },
                    orderBy:{
                        id: 'asc'
                    }
                });

                if (userQuotes.length > 0) {
                    const randomQuote = userQuotes[Math.floor(Math.random() * userQuotes.length)];
                    const embed = new EmbedBuilder()
                        .setTitle(randomQuote.name)
                        .setDescription(`${randomQuote.description} (${randomQuote.id})`) // 修正: dep -> description
                        .setImage(randomQuote.url);

                    await interaction.editReply({ embeds: [embed] });
                    console.log(`--- ${new Date()} (select)---\n${interaction.user.username} が ${randomQuote.name} の名言を選択\n${randomQuote.url}`);
                    const log_embed = new EmbedBuilder()
                        .setTitle(`${randomQuote.description} (${randomQuote.id})`) // 修正: dep -> description
                        .setColor('DarkOrange')
                        .setDescription(`${randomQuote.url}\r${new Date()}`);
                    webhook.send({
                        embeds: [log_embed]
                    });
                    return;
                } else {
                    await interaction.editReply('そのユーザーの名言は見つかりませんでした。');
                    return;
                }
            }
            const randomEmbedData = await prisma.meigen.findMany({
                where: {
                    id: randomIndex,
                },
            });

            if(randomEmbedData.length > 0){
                const embed = new EmbedBuilder()
                .setTitle(randomEmbedData[0].name)
                .setDescription(`${randomEmbedData[0].description} (${randomEmbedData[0].id})`) // 修正: dep -> description
                .setColor('Blue')
                .setImage(randomEmbedData[0].url);
                
                await interaction.editReply({ embeds: [embed] });
                console.log(`--- ${new Date()} ---\n${interaction.user.username} がランダムな名言を取得\n${randomEmbedData[0].url}\ndb_id: ${randomEmbedData[0].id}`)
                const log_embed = new EmbedBuilder()
                .setTitle(randomEmbedData[0].name)
                .setColor('DarkAqua')
                .setDescription(`db_id: ${randomEmbedData[0].id}\n${randomEmbedData[0].url}\r${new Date()}`);
                webhook.send({
                    embeds: [log_embed]
                })
            }else{
                await interaction.editReply("ランダムに取得できる名言はありませんでした。");
            }
        } catch (error) {
            console.error('コマンドの実行中にエラーが発生しました:', error);
            await interaction.editReply('コマンドの実行中にエラーが発生しました。');
        }
    },
};

const { PrismaClient } = require('@prisma/client');
const { embedMessages } = require('./meigen_list'); // 元のデータをインポート

const prisma = new PrismaClient();

async function main() {
  try {
    for (const message of embedMessages) {
      await prisma.meigen.create({
        data: {
          name: message.title,
          dep: message.description,
          url: message.url,
        },
      });
      console.log(`Migrated: ${message.title}`);
    }
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
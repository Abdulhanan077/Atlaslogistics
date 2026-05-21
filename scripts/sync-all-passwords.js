const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const oldDatabaseUrl = process.env.OLD_DATABASE_URL;
const newDatabaseUrl = process.env.DATABASE_URL;

if (!oldDatabaseUrl) {
  console.error('Error: OLD_DATABASE_URL is not set.');
  process.exit(1);
}

const prismaOld = new PrismaClient({
  datasources: {
    db: {
      url: oldDatabaseUrl,
    },
  },
});

const prismaNew = new PrismaClient({
  datasources: {
    db: {
      url: newDatabaseUrl,
    },
  },
});

async function sync() {
  console.log('Syncing all admin passwords from old database to new database...');

  const oldUsers = await prismaOld.$queryRawUnsafe(`SELECT email, password FROM "User"`);

  for (const oldUser of oldUsers) {
    const newUser = await prismaNew.user.findUnique({
      where: { email: oldUser.email }
    });

    if (newUser) {
      if (oldUser.password !== newUser.password) {
        console.log(`Updating password for ${oldUser.email} to match the old database...`);
        await prismaNew.user.update({
          where: { email: oldUser.email },
          data: { password: oldUser.password }
        });
        console.log(`Successfully updated password for ${oldUser.email}.`);
      } else {
        console.log(`Password for ${oldUser.email} is already in sync.`);
      }
    }
  }
  console.log('\nAll passwords synced successfully!');
}

sync()
  .catch(console.error)
  .finally(async () => {
    await prismaOld.$disconnect();
    await prismaNew.$disconnect();
  });

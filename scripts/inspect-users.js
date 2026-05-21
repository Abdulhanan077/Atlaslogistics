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

async function inspect() {
  console.log('Comparing User Accounts and Password Hashes:\n');

  const oldUsers = await prismaOld.$queryRawUnsafe(`SELECT email, password FROM "User"`);
  
  for (const oldUser of oldUsers) {
    const newUser = await prismaNew.user.findUnique({
      where: { email: oldUser.email }
    });

    if (newUser) {
      const passwordMatch = oldUser.password === newUser.password;
      console.log(`Email: ${oldUser.email}`);
      console.log(`  Old DB Hash: ${oldUser.password}`);
      console.log(`  New DB Hash: ${newUser.password}`);
      console.log(`  Hashes Match: ${passwordMatch ? 'YES' : 'NO (Using New DB password)'}`);
      console.log('----------------------------------------------------');
    } else {
      console.log(`Email: ${oldUser.email}`);
      console.log(`  Only exists in Old DB (Not migrated?)`);
      console.log('----------------------------------------------------');
    }
  }
}

inspect()
  .catch(console.error)
  .finally(async () => {
    await prismaOld.$disconnect();
    await prismaNew.$disconnect();
  });

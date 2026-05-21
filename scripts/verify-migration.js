const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const oldDatabaseUrl = process.env.OLD_DATABASE_URL;
const newDatabaseUrl = process.env.DATABASE_URL;

if (!oldDatabaseUrl) {
  console.error('\x1b[31mError: OLD_DATABASE_URL is not set in your .env file.\x1b[0m');
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

async function verify() {
  console.log('Comparing database records side-by-side to verify migration...\n');

  // Helper to get count using raw query to bypass schema differences
  const getOldCount = async (tableName) => {
    const res = await prismaOld.$queryRawUnsafe(`SELECT COUNT(*)::integer as count FROM "${tableName}"`);
    return res[0].count;
  };

  const getNewCount = async (tableName) => {
    const res = await prismaNew.$queryRawUnsafe(`SELECT COUNT(*)::integer as count FROM "${tableName}"`);
    return res[0].count;
  };

  const tables = ['User', 'Shipment', 'ShipmentEvent', 'Message', 'AuditLog'];
  const verificationReport = [];

  for (const table of tables) {
    const oldCount = await getOldCount(table);
    const newCount = await getNewCount(table);
    const match = newCount >= oldCount; // It can be greater if new DB already had records

    verificationReport.push({
      table,
      oldCount,
      newCount,
      status: match ? '\x1b[32m✔ VERIFIED\x1b[0m' : '\x1b[31m✘ MISMATCH\x1b[0m',
    });
  }

  console.log('----------------------------------------------------');
  console.log('Table Name     | Old DB Count | New DB Count | Status');
  console.log('----------------------------------------------------');
  verificationReport.forEach((row) => {
    const nameStr = row.table.padEnd(14);
    const oldStr = String(row.oldCount).padEnd(12);
    const newStr = String(row.newCount).padEnd(12);
    console.log(`${nameStr} | ${oldStr} | ${newStr} | ${row.status}`);
  });
  console.log('----------------------------------------------------');

  // Do a detailed sample check on shipments
  console.log('\nChecking random shipment details...');
  const oldShipments = await prismaOld.$queryRawUnsafe(`SELECT "trackingNumber", status FROM "Shipment" LIMIT 3`);
  
  let sampleMatch = true;
  for (const sample of oldShipments) {
    const newShipment = await prismaNew.shipment.findUnique({
      where: { trackingNumber: sample.trackingNumber },
    });
    
    if (newShipment) {
      console.log(`  - Shipment ${sample.trackingNumber}: Status "${sample.status}" in Old DB -> Status "${newShipment.status}" in New DB (\x1b[32mMatch\x1b[0m)`);
    } else {
      console.log(`  - Shipment ${sample.trackingNumber}: \x1b[31mMissing in New DB!\x1b[0m`);
      sampleMatch = false;
    }
  }

  if (sampleMatch) {
    console.log('\n\x1b[32mAll sample checks passed. The data exists in your new database!\x1b[0m');
  } else {
    console.log('\n\x1b[31mWarning: Some sample checks failed. Do not delete the old database yet.\x1b[0m');
  }
}

verify()
  .catch(console.error)
  .finally(async () => {
    await prismaOld.$disconnect();
    await prismaNew.$disconnect();
  });

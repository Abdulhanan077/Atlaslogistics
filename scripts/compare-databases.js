const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const oldDatabaseUrl = process.env.OLD_DATABASE_URL;
const newDatabaseUrl = process.env.DATABASE_URL;

if (!oldDatabaseUrl) {
  console.error('\x1b[31mError: OLD_DATABASE_URL is not set in your .env file.\x1b[0m');
  console.log('Please add your old database connection URL to your .env file like this:');
  console.log('OLD_DATABASE_URL="postgresql://username:password@host:port/database"');
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

async function getDatabaseSchema(prismaClient) {
  try {
    // Query columns in the 'public' schema
    const columns = await prismaClient.$queryRawUnsafe(`
      SELECT table_name, column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, column_name;
    `);

    // Group columns by table
    const schema = {};
    columns.forEach((col) => {
      const tableName = col.table_name;
      if (!schema[tableName]) {
        schema[tableName] = {};
      }
      schema[tableName][col.column_name] = {
        type: col.data_type,
        nullable: col.is_nullable === 'YES',
      };
    });

    return schema;
  } catch (error) {
    console.error('Error fetching schema:', error.message);
    throw error;
  }
}

async function main() {
  console.log('Connecting to databases and fetching schemas...');
  
  console.log('\n--- Old Database Schema ---');
  const oldSchema = await getDatabaseSchema(prismaOld);
  
  console.log('--- New Database Schema ---');
  const newSchema = await getDatabaseSchema(prismaNew);

  console.log('\n--- Comparing Database Schemas ---');
  
  const oldTables = Object.keys(oldSchema);
  const newTables = Object.keys(newSchema);

  // 1. Check for missing tables
  const missingInNew = oldTables.filter((t) => !newTables.includes(t));
  const missingInOld = newTables.filter((t) => !oldTables.includes(t));

  if (missingInNew.length > 0) {
    console.log('\x1b[33mWarning: Tables present in Old DB but missing in New DB:\x1b[0m');
    missingInNew.forEach((t) => console.log(`  - ${t}`));
  }

  if (missingInOld.length > 0) {
    console.log('\x1b[36mInfo: Tables present in New DB but missing in Old DB (will not have data migrated):\x1b[0m');
    missingInOld.forEach((t) => console.log(`  - ${t}`));
  }

  // 2. Compare matching tables
  const commonTables = oldTables.filter((t) => newTables.includes(t));
  let schemaMismatches = 0;

  commonTables.forEach((table) => {
    const oldCols = oldSchema[table];
    const newCols = newSchema[table];

    const oldColNames = Object.keys(oldCols);
    const newColNames = Object.keys(newCols);

    const missingColsInNew = oldColNames.filter((c) => !newColNames.includes(c));
    const missingColsInOld = newColNames.filter((c) => !oldColNames.includes(c));

    const columnTypeMismatches = [];
    oldColNames.forEach((colName) => {
      if (newCols[colName] && oldCols[colName].type !== newCols[colName].type) {
        columnTypeMismatches.push({
          column: colName,
          oldType: oldCols[colName].type,
          newType: newCols[colName].type,
        });
      }
    });

    if (missingColsInNew.length > 0 || missingColsInOld.length > 0 || columnTypeMismatches.length > 0) {
      schemaMismatches++;
      console.log(`\n\x1b[33mDifferences in Table: "${table}":\x1b[0m`);
      
      if (missingColsInNew.length > 0) {
        console.log(`  Missing in New DB: ${missingColsInNew.join(', ')}`);
      }
      if (missingColsInOld.length > 0) {
        console.log(`  New columns added (will use default values or be null): ${missingColsInOld.join(', ')}`);
      }
      columnTypeMismatches.forEach((m) => {
        console.log(`  Type mismatch on "${m.column}": Old (${m.oldType}) vs New (${m.newType})`);
      });
    }
  });

  if (schemaMismatches === 0 && missingInNew.length === 0) {
    console.log('\x1b[32mSuccess! The schemas match perfectly. We can safely migrate all table data directly.\x1b[0m');
  } else {
    console.log('\n\x1b[33mNote: There are differences between the database schemas. A custom migration script is recommended to map the data safely.\x1b[0m');
  }
}

main()
  .catch((e) => {
    console.error('\x1b[31mFatal error running comparison:\x1b[0m', e);
    process.exit(1);
  })
  .finally(async () => {
    await prismaOld.$disconnect();
    await prismaNew.$disconnect();
  });

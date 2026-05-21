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

async function migrate() {
  console.log('Starting data migration using raw queries for old database...\n');

  // Helper to safely execute SELECT * using raw query to bypass schema validation
  const fetchAllFromOld = async (tableName) => {
    // Quote table name for safety with mixed-case Postgres table names (e.g. "User", "Shipment")
    return await prismaOld.$queryRawUnsafe(`SELECT * FROM "${tableName}"`);
  };

  // --- 1. Migrate Users ---
  console.log('Fetching users from old database...');
  const oldUsers = await fetchAllFromOld('User');
  console.log(`Found ${oldUsers.length} users in old database.`);

  const userIdMap = new Map(); // Maps old user ID -> new user ID

  for (const user of oldUsers) {
    // Check if user already exists by email in the new database
    const existingUser = await prismaNew.user.findUnique({
      where: { email: user.email },
    });

    if (existingUser) {
      console.log(`User ${user.email} already exists in new database. Mapping ID: ${user.id} -> ${existingUser.id}`);
      userIdMap.set(user.id, existingUser.id);
    } else {
      console.log(`Creating user ${user.email} in new database...`);
      const newUser = await prismaNew.user.create({
        data: {
          id: user.id, // Preserve the ID
          email: user.email,
          password: user.password,
          name: user.name,
          role: user.role,
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt),
          isDeleted: user.isDeleted ?? false,
          deletedAt: user.deletedAt ? new Date(user.deletedAt) : null,
        },
      });
      userIdMap.set(user.id, newUser.id);
    }
  }
  console.log('User migration completed.\n');

  // --- 2. Migrate Shipments ---
  console.log('Fetching shipments from old database...');
  const oldShipments = await fetchAllFromOld('Shipment');
  console.log(`Found ${oldShipments.length} shipments in old database.`);

  const shipmentIdMap = new Set();

  for (const shipment of oldShipments) {
    // Find if shipment already exists
    const existingShipment = await prismaNew.shipment.findUnique({
      where: { trackingNumber: shipment.trackingNumber },
    });

    // Check if the admin exists in the map
    const newAdminId = userIdMap.get(shipment.adminId);
    if (!newAdminId) {
      console.warn(`Skipping shipment ${shipment.trackingNumber}: Admin with ID ${shipment.adminId} not found in migrated users.`);
      continue;
    }

    if (existingShipment) {
      console.log(`Shipment ${shipment.trackingNumber} already exists in new database. Skipping.`);
      shipmentIdMap.add(existingShipment.id);
    } else {
      console.log(`Migrating shipment ${shipment.trackingNumber}...`);
      
      const newShipment = await prismaNew.shipment.create({
        data: {
          id: shipment.id, // Preserve ID
          trackingNumber: shipment.trackingNumber,
          senderInfo: shipment.senderInfo,
          receiverInfo: shipment.receiverInfo,
          status: shipment.status,
          origin: shipment.origin,
          destination: shipment.destination,
          customerEmail: shipment.customerEmail,
          estimatedDelivery: shipment.estimatedDelivery ? new Date(shipment.estimatedDelivery) : null,
          productDescription: shipment.productDescription,
          imageUrls: shipment.imageUrls || '[]',
          videoUrls: shipment.videoUrls || '[]',
          adminId: newAdminId,
          createdAt: new Date(shipment.createdAt),
          updatedAt: new Date(shipment.updatedAt),
          isDeleted: shipment.isDeleted ?? false,
          deletedAt: shipment.deletedAt ? new Date(shipment.deletedAt) : null,
          showRoute: shipment.showRoute ?? true,
        },
      });
      shipmentIdMap.add(newShipment.id);
    }
  }
  console.log('Shipment migration completed.\n');

  // --- 3. Migrate Shipment Events ---
  console.log('Fetching shipment events from old database...');
  const oldEvents = await fetchAllFromOld('ShipmentEvent');
  console.log(`Found ${oldEvents.length} events in old database.`);

  let eventsMigrated = 0;
  for (const event of oldEvents) {
    if (!shipmentIdMap.has(event.shipmentId)) {
      continue;
    }

    const existingEvent = await prismaNew.shipmentEvent.findUnique({
      where: { id: event.id },
    });

    if (existingEvent) {
      continue;
    }

    await prismaNew.shipmentEvent.create({
      data: {
        id: event.id,
        shipmentId: event.shipmentId,
        status: event.status,
        location: event.location,
        latitude: event.latitude !== null ? parseFloat(event.latitude) : null,
        longitude: event.longitude !== null ? parseFloat(event.longitude) : null,
        description: event.description,
        timestamp: new Date(event.timestamp),
        createdAt: new Date(event.createdAt),
        isDeleted: event.isDeleted ?? false,
        deletedAt: event.deletedAt ? new Date(event.deletedAt) : null,
      },
    });
    eventsMigrated++;
  }
  console.log(`Migrated ${eventsMigrated} shipment events.\n`);

  // --- 4. Migrate Messages ---
  console.log('Fetching messages from old database...');
  const oldMessages = await fetchAllFromOld('Message');
  console.log(`Found ${oldMessages.length} messages in old database.`);

  let messagesMigrated = 0;
  for (const msg of oldMessages) {
    if (!shipmentIdMap.has(msg.shipmentId)) {
      continue;
    }

    const existingMsg = await prismaNew.message.findUnique({
      where: { id: msg.id },
    });

    if (existingMsg) {
      continue;
    }

    await prismaNew.message.create({
      data: {
        id: msg.id,
        content: msg.content,
        sender: msg.sender,
        imageUrl: msg.imageUrl || null,
        isRead: msg.isRead,
        createdAt: new Date(msg.createdAt),
        shipmentId: msg.shipmentId,
      },
    });
    messagesMigrated++;
  }
  console.log(`Migrated ${messagesMigrated} messages.\n`);

  // --- 5. Migrate Audit Logs ---
  console.log('Fetching audit logs from old database...');
  const oldLogs = await fetchAllFromOld('AuditLog');
  console.log(`Found ${oldLogs.length} audit logs in old database.`);

  let logsMigrated = 0;
  for (const log of oldLogs) {
    const newAdminId = userIdMap.get(log.adminId);
    if (!newAdminId) {
      continue;
    }

    const existingLog = await prismaNew.auditLog.findUnique({
      where: { id: log.id },
    });

    if (existingLog) {
      continue;
    }

    await prismaNew.auditLog.create({
      data: {
        id: log.id,
        action: log.action,
        entityId: log.entityId,
        details: log.details,
        adminId: newAdminId,
        createdAt: new Date(log.createdAt),
      },
    });
    logsMigrated++;
  }
  console.log(`Migrated ${logsMigrated} audit logs.\n`);

  console.log('\x1b[32mAll data migration completed successfully!\x1b[0m');
}

migrate()
  .catch((e) => {
    console.error('\x1b[31mMigration failed:\x1b[0m', e);
    process.exit(1);
  })
  .finally(async () => {
    await prismaOld.$disconnect();
    await prismaNew.$disconnect();
  });

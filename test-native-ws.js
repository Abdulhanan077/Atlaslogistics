require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool, neonConfig } = require('@neondatabase/serverless');
const { PrismaNeon } = require('@prisma/adapter-neon');

neonConfig.webSocketConstructor = globalThis.WebSocket;

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaNeon(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    try {
        const settings = await prisma.siteSettings.findUnique({ where: { id: 'default' } });
        console.log("SUCCESS NATIVE WS:", settings);
    } catch (e) {
        console.error("ERROR NATIVE WS:", e);
    } finally {
        await prisma.$disconnect();
    }
}
main();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const shipments = await prisma.shipment.findMany({
        include: {
            events: true
        }
    });

    shipments.forEach(s => {
        console.log(`Shipment: ${s.trackingNumber}`);
        s.events.forEach(e => {
            console.log(`  - Event: ${e.status}, Timestamp: ${e.timestamp}, CreatedAt: ${e.createdAt}`);
        });
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

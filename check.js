const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const shipment = await prisma.shipment.findUnique({
    where: { trackingNumber: 'TRK22373072' },
    include: { admin: true }
  });
  console.log("Admin Email:", shipment.admin.email);
  console.log("Customer Email:", shipment.customerEmail);
}
main().catch(console.error).finally(() => prisma.$disconnect());

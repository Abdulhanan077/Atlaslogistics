const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('password123', 10);

    console.log("Seeding super admin...");
    const user = await prisma.user.upsert({
        where: { email: 'super@admin.com' },
        update: { password: hashedPassword },
        create: {
            email: 'super@admin.com',
            name: 'Super Admin',
            password: hashedPassword,
            role: 'SUPER_ADMIN',
        },
    });

    console.log("Success! You can now log in with super@admin.com and password123");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

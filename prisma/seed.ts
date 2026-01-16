import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'


const prisma = new PrismaClient()

async function main() {
    const hashedPassword = await bcrypt.hash('password', 10)

    const superAdmin = await prisma.user.upsert({
        where: { email: 'super@admin.com' },
        update: {},
        create: {
            email: 'super@admin.com',
            name: 'Super Admin',
            password: hashedPassword,
            role: 'SUPER_ADMIN',
        },
    })

    const adminA = await prisma.user.upsert({
        where: { email: 'adminA@logistics.com' },
        update: {},
        create: {
            email: 'adminA@logistics.com',
            name: 'Admin A',
            password: hashedPassword,
            role: 'ADMIN',
        },
    })

    const adminB = await prisma.user.upsert({
        where: { email: 'adminB@logistics.com' },
        update: {},
        create: {
            email: 'adminB@logistics.com',
            name: 'Admin B',
            password: hashedPassword,
            role: 'ADMIN',
        },
    })

    console.log({ superAdmin, adminA, adminB })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })

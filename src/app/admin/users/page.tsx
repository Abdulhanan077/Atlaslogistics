import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import UsersClient from "./components/UsersClient"

export default async function UsersPage() {
    const session = await getServerSession(authOptions)
    console.log("UsersPage Session Check:", {
        hasSession: !!session,
        role: session?.user?.role,
        userId: session?.user?.id
    });

    if (!session || session.user.role !== 'SUPER_ADMIN') {
        console.log("UsersPage: Redirecting to /admin");
        redirect('/admin')
    }

    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true
        }
    })

    return <UsersClient initialUsers={users} />
}

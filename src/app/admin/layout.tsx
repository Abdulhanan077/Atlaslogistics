import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import AdminLayoutClient from "./AdminLayoutClient";
import prisma from "@/lib/prisma"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/login")
    }

    const settings = await prisma.siteSettings.findFirst();

    return (
        <AdminLayoutClient user={session.user} settings={settings}>
            {children}
        </AdminLayoutClient>
    )
}

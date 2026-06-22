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
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/login");
    }

    const settings = await prisma.siteSettings.findFirst().catch(() => null);
    const serializedUser = session.user ? JSON.parse(JSON.stringify(session.user)) : null;
    const serializedSettings = settings ? JSON.parse(JSON.stringify(settings)) : null;

    return (
        <div className="min-h-screen bg-brand-bg">
            <AdminLayoutClient user={serializedUser} settings={serializedSettings}>
                {children}
            </AdminLayoutClient>
        </div>
    )
}

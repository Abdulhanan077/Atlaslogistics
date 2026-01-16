import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import AdminSidebar from "@/components/admin/Sidebar"
import AdminHeader from "@/components/admin/Header"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/login")
    }

    return (
        <div className="flex h-screen bg-slate-900 text-white overflow-hidden print:h-auto print:overflow-visible">
            <div className="print:hidden">
                <AdminSidebar role={session.user.role} />
            </div>
            <div className="flex-1 flex flex-col h-full overflow-hidden print:h-auto print:overflow-visible print:block">
                <div className="print:hidden">
                    <AdminHeader user={session.user} />
                </div>
                <main className="flex-1 overflow-y-auto p-6 bg-slate-950/50 print:p-0 print:overflow-visible print:bg-white print:text-black">
                    {children}
                </main>
            </div>
        </div>
    )
}

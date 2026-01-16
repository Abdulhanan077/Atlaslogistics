import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Package, Truck, CheckCircle, Clock } from "lucide-react"

async function getStats(userId: string) {
    const where = { adminId: userId };
    const [total, pending, inTransit, delivered] = await Promise.all([
        prisma.shipment.count({ where }),
        prisma.shipment.count({ where: { ...where, status: "PENDING" } }),
        prisma.shipment.count({ where: { ...where, status: "IN_TRANSIT" } }),
        prisma.shipment.count({ where: { ...where, status: "DELIVERED" } })
    ]);
    return { total, pending, inTransit, delivered };
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ viewAs?: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) return null;

    const { viewAs } = await searchParams;
    const targetUserId = (session.user.role === 'SUPER_ADMIN' && viewAs) ? viewAs : session.user.id;

    const stats = await getStats(targetUserId);

    const statCards = [
        { label: "Total Shipments", value: stats.total, icon: Package, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
        { label: "Pending", value: stats.pending, icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
        { label: "In Transit", value: stats.inTransit, icon: Truck, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
        { label: "Delivered", value: stats.delivered, icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
    ];

    return (
        <div className="space-y-6">
            {targetUserId !== session.user.id && (
                <div className="bg-purple-500/10 border border-purple-500/20 text-purple-400 px-4 py-3 rounded-xl mb-6 flex items-center">
                    <span className="font-semibold mr-2">Viewing as Admin:</span> {targetUserId}
                </div>
            )}
            <h1 className="text-2xl font-bold text-white mb-6">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => (
                    <div key={stat.label} className={`p-6 rounded-2xl border ${stat.border} ${stat.bg} backdrop-blur-sm`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                                <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} border ${stat.border}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
                <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Add buttons here later to link to create shipment etc */}
                    <div className="p-4 border border-slate-700/50 rounded-xl bg-slate-800/20 text-slate-400 text-sm">
                        Use the sidebar to manage shipments.
                    </div>
                </div>
            </div>
        </div>
    );
}

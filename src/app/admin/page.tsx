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

    // Recent Inquiries (Unread)
    // Super Admin sees ALL unread messages. Regular Admins only see their own.
    const unreadWhere: any = {
        messages: {
            some: {
                sender: 'CLIENT',
                isRead: false
            }
        }
    };

    if (session.user.role !== 'SUPER_ADMIN') {
        unreadWhere.adminId = session.user.id;
    }

    const unreadShipments: any[] = await prisma.shipment.findMany({
        where: unreadWhere,
        include: {
            messages: {
                where: { sender: 'CLIENT', isRead: false },
                select: { id: true, createdAt: true, content: true },
                orderBy: { createdAt: 'desc' },
                take: 1
            }
        } as any
    });

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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                {/* Quick Actions */}
                <div className="lg:col-span-2 p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
                    <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <a href="/admin/shipments" className="hover:no-underline block p-4 border border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/20 rounded-xl transition-colors">
                            <h3 className="font-semibold text-blue-400 mb-1">Manage Shipments</h3>
                            <p className="text-slate-400 text-xs text-sm">View and update all shipments</p>
                        </a>
                        {session.user.role === 'SUPER_ADMIN' && (
                            <a href="/admin/users" className="hover:no-underline block p-4 border border-purple-500/20 bg-purple-500/10 hover:bg-purple-500/20 rounded-xl transition-colors">
                                <h3 className="font-semibold text-purple-400 mb-1">Manage Admins</h3>
                                <p className="text-slate-400 text-xs text-sm">Create and modify admin accounts</p>
                            </a>
                        )}
                    </div>
                </div>

                {/* Recent Inquiries */}
                <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        Recent Inquiries
                        {unreadShipments.length > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{unreadShipments.length}</span>
                        )}
                    </h2>
                    <div className="space-y-3">
                        {unreadShipments.length === 0 ? (
                            <p className="text-slate-500 text-sm">No new messages.</p>
                        ) : (
                            unreadShipments.map(shipment => (
                                <a
                                    key={shipment.id}
                                    href={`/admin/shipments/${shipment.id}`}
                                    className="block p-3 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-blue-500/50 transition-colors"
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-mono text-blue-400 font-semibold">{shipment.trackingNumber}</span>
                                        <span className="text-xs text-slate-500" suppressHydrationWarning>
                                            {shipment.messages[0] ? new Date(shipment.messages[0].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </span>
                                    </div>
                                    <p className="text-slate-300 text-sm truncate">
                                        {shipment.messages[0]?.content || 'New message'}
                                    </p>
                                </a>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

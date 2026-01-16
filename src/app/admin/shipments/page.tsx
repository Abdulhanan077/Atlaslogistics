import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import ShipmentsClient from "./components/ShipmentsClient"
import DashboardStats from "./components/DashboardStats"

export default async function ShipmentsPage({ searchParams }: { searchParams: Promise<{ viewAs?: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session) return null

    const { viewAs } = await searchParams;
    const targetUserId = (session.user.role === 'SUPER_ADMIN' && viewAs) ? viewAs : session.user.id;

    const shipments = await prisma.shipment.findMany({
        where: { adminId: targetUserId },
        orderBy: { createdAt: 'desc' },
        include: {
            events: {
                orderBy: { timestamp: 'desc' },
                take: 1
            }
        }
    })

    const stats = {
        total: shipments.length,
        inTransit: shipments.filter(s => s.status === 'IN_TRANSIT').length,
        delivered: shipments.filter(s => s.status === 'DELIVERED').length,
        exceptions: shipments.filter(s => ['PAUSED', 'RETURNED'].includes(s.status)).length
    };

    return (
        <div>

            {targetUserId !== session.user.id && (
                <div className="bg-purple-500/10 border border-purple-500/20 text-purple-400 px-4 py-3 rounded-xl mb-6 flex items-center">
                    <span className="font-semibold mr-2">Viewing Shipments for Admin:</span> {targetUserId}
                </div>
            )}
            <DashboardStats stats={stats} />
            <ShipmentsClient initialShipments={shipments} />
        </div>
    )
}

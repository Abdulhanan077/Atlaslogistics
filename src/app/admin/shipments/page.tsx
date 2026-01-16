import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import ShipmentsClient from "./components/ShipmentsClient"
import DashboardStats from "./components/DashboardStats"

export default async function ShipmentsPage() {
    const session = await getServerSession(authOptions)
    if (!session) return null

    const shipments = await prisma.shipment.findMany({
        where: { adminId: session.user.id },
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
            <DashboardStats stats={stats} />
            <ShipmentsClient initialShipments={shipments} />
        </div>
    )
}

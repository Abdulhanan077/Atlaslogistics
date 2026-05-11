import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import ShipmentsClient from "./components/ShipmentsClient"
import DashboardStats from "./components/DashboardStats"

export default async function ShipmentsPage({ searchParams }: { searchParams: Promise<{ viewAs?: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session) return null

    const { viewAs } = await searchParams;
    let targetUserId: string | null = session.user.id;

    if (session.user.role === 'SUPER_ADMIN') {
        if (viewAs) {
            targetUserId = viewAs;
        } else {
            targetUserId = null;
        }
    }

    const whereClause: any = { isDeleted: false };
    if (targetUserId) {
        whereClause.adminId = targetUserId;
    }

    const shipments = await prisma.shipment.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            trackingNumber: true,
            status: true,
            origin: true,
            destination: true,
            receiverInfo: true,
            senderInfo: true,
            customerEmail: true,
            estimatedDelivery: true,
            productDescription: true,
            imageUrls: true,
            videoUrls: true,
            createdAt: true,
            events: {
                orderBy: [
                    { timestamp: 'desc' },
                    { createdAt: 'desc' }
                ],
                take: 1,
                select: {
                    description: true,
                    status: true,
                    timestamp: true
                }
            }
        }
    })

    const stats = {
        total: shipments.length,
        inTransit: shipments.filter(s => s.status === 'IN_TRANSIT').length,
        delivered: shipments.filter(s => s.status === 'DELIVERED').length,
        exceptions: shipments.filter(s => ['ON_HOLD', 'RETURNED'].includes(s.status)).length
    };

    const serializedShipments = JSON.parse(JSON.stringify(shipments));

    return (
        <div>

            {targetUserId !== session.user.id && (
                <div className="bg-purple-500/10 border border-purple-500/20 text-purple-400 px-4 py-3 rounded-xl mb-6 flex items-center">
                    <span className="font-semibold mr-2">Viewing Shipments for Admin:</span> {targetUserId}
                </div>
            )}
            <DashboardStats stats={stats} />
            <ShipmentsClient initialShipments={serializedShipments} />
        </div>
    )
}

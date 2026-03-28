import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import RecycleBinClient from "./components/RecycleBinClient"

export default async function RecycleBinPage({ searchParams }: { searchParams: Promise<{ viewAs?: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session) return null

    const { viewAs } = await searchParams;
    let targetUserId: string | null = session.user.id;

    if (session.user.role === 'SUPER_ADMIN') {
        if (viewAs) {
            targetUserId = viewAs;
        } else {
            targetUserId = null; // null means 'fetch everything'
        }
    }

    const whereClause: any = { isDeleted: true };
    if (targetUserId) {
        whereClause.adminId = targetUserId;
    }

    // Fetch ONLY deleted shipments
    const deletedShipments = await prisma.shipment.findMany({
        where: whereClause,
        orderBy: { deletedAt: 'desc' },
        include: {
            events: {
                orderBy: { timestamp: 'desc' },
                take: 1
            }
        }
    })

    return (
        <div>
            {targetUserId && targetUserId !== session.user.id && (
                <div className="bg-purple-500/10 border border-purple-500/20 text-purple-400 px-4 py-3 rounded-xl mb-6 flex items-center">
                    <span className="font-semibold mr-2">Viewing Recycle Bin for Admin:</span> {targetUserId}
                </div>
            )}
            {!targetUserId && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 flex items-center">
                    <span className="font-semibold mr-2">System Wide Recycle Bin:</span> Viewing all deleted shipments across all admins.
                </div>
            )}

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white mb-2">Recycle Bin</h1>
                <p className="text-brand-text-muted text-sm">Shipments that have been deleted. You can restore them or permanently delete them here.</p>
            </div>

            <RecycleBinClient initialShipments={deletedShipments} />
        </div>
    )
}

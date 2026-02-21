import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import RecycleBinClient from "./components/RecycleBinClient"

export default async function RecycleBinPage({ searchParams }: { searchParams: Promise<{ viewAs?: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session) return null

    const { viewAs } = await searchParams;
    const targetUserId = (session.user.role === 'SUPER_ADMIN' && viewAs) ? viewAs : session.user.id;

    // Fetch ONLY deleted shipments
    const deletedShipments = await prisma.shipment.findMany({
        where: { adminId: targetUserId, isDeleted: true },
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
            {targetUserId !== session.user.id && (
                <div className="bg-purple-500/10 border border-purple-500/20 text-purple-400 px-4 py-3 rounded-xl mb-6 flex items-center">
                    <span className="font-semibold mr-2">Viewing Recycle Bin for Admin:</span> {targetUserId}
                </div>
            )}

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white mb-2">Recycle Bin</h1>
                <p className="text-slate-400 text-sm">Shipments that have been deleted. You can restore them or permanently delete them here.</p>
            </div>

            <RecycleBinClient initialShipments={deletedShipments} />
        </div>
    )
}

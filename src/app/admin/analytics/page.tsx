import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import AnalyticsClient from "./components/AnalyticsClient"

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ viewAs?: string }> }) {
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

    // Fetch all relevant shipments
    const shipments = await prisma.shipment.findMany({
        where: whereClause,
        select: {
            id: true,
            status: true,
            createdAt: true,
            origin: true,
            destination: true,
        }
    });

    // --- Data Aggregation ---

    // 1. Volume over time (Last 30 days)
    const last30Days = [...Array(30)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
    }).reverse();

    const volumeData = last30Days.map(dateStr => {
        const count = shipments.filter(s => {
            const sDate = new Date(s.createdAt).toISOString().split('T')[0];
            return sDate === dateStr;
        }).length;

        // Format for display (e.g. Feb 21)
        const d = new Date(dateStr);
        const displayDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        return { date: displayDate, count, fullDate: dateStr };
    });

    // 2. Status Distribution
    const statusCounts = shipments.reduce((acc, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Map to recharts format and include safe UI colors
    const COLORS: Record<string, string> = {
        'DELIVERED': '#22c55e', // text-green-500
        'PENDING': '#eab308',   // text-yellow-500
        'ON_HOLD': '#f97316',   // text-orange-500
        'RETURNED': '#ef4444',  // text-red-500
        'OUT_FOR_DELIVERY': '#a855f7', // text-purple-500
        'IN_TRANSIT': '#3b82f6', // text-blue-500
    };

    const statusData = Object.entries(statusCounts).map(([name, value]) => ({
        name: name.replace(/_/g, ' '),
        value,
        fill: COLORS[name] || '#64748b' // fallback slate
    }));

    // 3. Top Locations (Destinations)
    const destinationCounts = shipments.reduce((acc, curr) => {
        const dest = curr.destination || 'Unknown';
        acc[dest] = (acc[dest] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const locationData = Object.entries(destinationCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5); // top 5

    return (
        <div className="space-y-6">
            {session.user.role === 'SUPER_ADMIN' && viewAs && (
                <div className="bg-purple-500/10 border border-purple-500/20 text-purple-400 px-4 py-3 rounded-xl mb-6 flex items-center">
                    <span className="font-semibold mr-2">Analytics for Admin:</span> {targetUserId}
                </div>
            )}
            {session.user.role === 'SUPER_ADMIN' && !viewAs && (
                <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-3 rounded-xl mb-6 flex items-center">
                    <span className="font-semibold mr-2">System Wide Analytics:</span> Viewing all shipments across all admins.
                </div>
            )}

            <AnalyticsClient
                volumeData={volumeData}
                statusData={statusData}
                locationData={locationData}
                totalShipments={shipments.length}
            />
        </div>
    )
}

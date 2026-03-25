import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { notFound, redirect } from "next/navigation"
import ShipmentDetailsClient from "./components/ShipmentDetailsClient"

export default async function ShipmentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) redirect('/login');

    const shipment = await prisma.shipment.findUnique({
        where: { id },
        include: {
            events: {
                orderBy: [
                    { timestamp: 'desc' },
                    { createdAt: 'desc' }
                ]
            }
        }
    });

    const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });

    if (!shipment) notFound();

    // Enforce isolation
    if (shipment.adminId !== session.user.id && session.user.role !== 'SUPER_ADMIN') {
        return (
            <div className="p-8 text-center text-red-500">
                Unauthorized: You do not have permission to view this shipment.
            </div>
        );
    }

    // Parse imageUrls for client
    let parsedImageUrls = [];
    try {
        const rawUrl = (shipment as any).imageUrls;
        parsedImageUrls = rawUrl ? JSON.parse(rawUrl) : [];
        if (!Array.isArray(parsedImageUrls)) parsedImageUrls = [];
    } catch (e) {
        console.error("Failed to parse imageUrls", e);
        parsedImageUrls = [];
    }

    // Sort events: latest by timestamp/createdAt first, but "CREATED" always last
    const sortedEvents = [...shipment.events].sort((a, b) => {
        if (a.status === 'CREATED' && b.status !== 'CREATED') return 1;
        if (a.status !== 'CREATED' && b.status === 'CREATED') return -1;
        
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        if (timeB !== timeA) return timeB - timeA;
        
        const createdA = new Date(a.createdAt).getTime();
        const createdB = new Date(b.createdAt).getTime();
        return createdB - createdA;
    });

    const parsedShipment = {
        ...shipment,
        events: sortedEvents,
        imageUrls: parsedImageUrls
    };

    return <ShipmentDetailsClient shipment={parsedShipment} settings={settings} />
}

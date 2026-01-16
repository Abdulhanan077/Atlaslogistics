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
                orderBy: { createdAt: 'desc' }
            }
        }
    });

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
        parsedImageUrls = shipment.imageUrls ? JSON.parse(shipment.imageUrls) : [];
        if (!Array.isArray(parsedImageUrls)) parsedImageUrls = [];
    } catch (e) {
        console.error("Failed to parse imageUrls", e);
        parsedImageUrls = [];
    }

    const parsedShipment = {
        ...shipment,
        imageUrls: parsedImageUrls
    };

    return <ShipmentDetailsClient shipment={parsedShipment} />
}

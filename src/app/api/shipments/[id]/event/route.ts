import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendShipmentEmail } from "@/lib/email";
import { logAction } from "@/lib/logger";
import { parseShipmentInfo } from "@/lib/utils";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const body = await req.json();
        const { status, location, description, timestamp, latitude, longitude } = body;

        // Verify ownership first
        const shipment = await prisma.shipment.findUnique({ where: { id } });
        if (!shipment || (shipment.adminId !== session.user.id && session.user.role !== 'SUPER_ADMIN')) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Add the event
        const newEvent = await prisma.shipmentEvent.create({
            data: {
                shipmentId: id,
                status,
                location,
                description,
                latitude: latitude ? parseFloat(latitude) : null,
                longitude: longitude ? parseFloat(longitude) : null,
                timestamp: timestamp ? new Date(timestamp) : undefined
            }
        });

        // Sync the main shipment status with the actually latest event (handles backdating)
        // Prioritize non-CREATED events to ensure "Created" doesn't override manual updates
        let latestEvent = await prisma.shipmentEvent.findFirst({
            where: { shipmentId: id, status: { not: 'CREATED' } },
            orderBy: [
                { timestamp: 'desc' },
                { createdAt: 'desc' }
            ]
        });

        if (!latestEvent) {
            latestEvent = await prisma.shipmentEvent.findFirst({
                where: { shipmentId: id },
                orderBy: [
                    { timestamp: 'desc' },
                    { createdAt: 'desc' }
                ]
            });
        }

        if (latestEvent) {
            await prisma.shipment.update({
                where: { id },
                data: { status: latestEvent.status }
            });
        }

        await logAction(session.user.id, "UPDATE_STATUS", id, { status, location });

        if (shipment.customerEmail) {
            const receiver = parseShipmentInfo(shipment.receiverInfo);
            
            const truncatedDesc = description 
                ? (description.length > 150 ? description.substring(0, 147) + '...' : description)
                : "Status updated";

            await sendShipmentEmail({
                to: shipment.customerEmail,
                trackingNumber: shipment.trackingNumber,
                status,
                location: location || "In Transit",
                description: truncatedDesc,
                receiverName: receiver.name
            });
        }

        return NextResponse.json(newEvent);
    } catch (err) {
        console.error(err);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

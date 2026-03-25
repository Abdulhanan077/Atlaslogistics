import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendShipmentEmail } from "@/lib/email";
import { logAction } from "@/lib/logger";
import { parseShipmentInfo } from "@/lib/utils";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string; eventId: string }> }
) {
    const { id, eventId } = await params;
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    try {
        // Fetch the shipment and the specific event
        const shipment = await prisma.shipment.findUnique({
            where: { id },
            include: {
                events: {
                    where: { id: eventId }
                }
            }
        });

        if (!shipment || (shipment.adminId !== session.user.id && session.user.role !== 'SUPER_ADMIN')) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const event = shipment.events[0];
        if (!event) {
            return new NextResponse("Event Not Found", { status: 404 });
        }

        if (!shipment.customerEmail) {
            return new NextResponse("Customer email not set for this shipment", { status: 400 });
        }

        const receiver = parseShipmentInfo(shipment.receiverInfo);
        
        const description = event.description || "Status updated";
        const truncatedDesc = description.length > 150 
            ? description.substring(0, 147) + '...' 
            : description;

        await sendShipmentEmail({
            to: shipment.customerEmail,
            trackingNumber: shipment.trackingNumber,
            status: event.status,
            location: event.location || "In Transit",
            description: truncatedDesc,
            receiverName: receiver.name
        });

        await logAction(session.user.id, "RESEND_EMAIL", id, { 
            eventId, 
            status: event.status, 
            customerEmail: shipment.customerEmail 
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Resend email error:", err);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

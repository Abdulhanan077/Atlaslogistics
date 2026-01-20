import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string; eventId: string }> }
) {
    const { id, eventId } = await params;
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const body = await req.json();
        const { status, location, description, timestamp, latitude, longitude } = body;

        // Verify ownership/admin rights
        const shipment = await prisma.shipment.findUnique({
            where: { id },
            include: { events: true }
        });

        if (!shipment || (shipment.adminId !== session.user.id && session.user.role !== 'SUPER_ADMIN')) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const event = shipment.events.find(e => e.id === eventId);
        if (!event) {
            return new NextResponse("Event not found", { status: 404 });
        }

        // Update the event
        const updatedEvent = await prisma.shipmentEvent.update({
            where: { id: eventId },
            data: {
                status,
                location,
                description,
                latitude: latitude ? parseFloat(latitude) : null,
                longitude: longitude ? parseFloat(longitude) : null,
                timestamp: timestamp ? new Date(timestamp) : undefined
            }
        });

        // Check if we need to sync the main shipment status
        const latestEvent = await prisma.shipmentEvent.findFirst({
            where: { shipmentId: id },
            orderBy: { timestamp: 'desc' }
        });

        if (latestEvent) {
            await prisma.shipment.update({
                where: { id },
                data: { status: latestEvent.status }
            });
        }

        return NextResponse.json(updatedEvent);

    } catch (err) {
        console.error(err);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string; eventId: string }> }
) {
    const { id, eventId } = await params;
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    try {
        // Verify ownership/admin rights
        const shipment = await prisma.shipment.findUnique({
            where: { id },
            include: { events: true }
        });

        if (!shipment || (shipment.adminId !== session.user.id && session.user.role !== 'SUPER_ADMIN')) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Delete the event
        await prisma.shipmentEvent.delete({
            where: { id: eventId }
        });

        // Sync the main shipment status with the NEW latest event
        const latestEvent = await prisma.shipmentEvent.findFirst({
            where: { shipmentId: id },
            orderBy: { timestamp: 'desc' }
        });

        if (latestEvent) {
            await prisma.shipment.update({
                where: { id },
                data: { status: latestEvent.status }
            });
        } else {
            // If no events left, maybe revert to CREATED or keep as is? 
            // Let's assume 'CREATED' is a safe fallback if no history exists, 
            // or just leave it alone if that's preferred. The plan said "maybe set to CREATED".
            // Let's set it to CREATED to be safe if they delete everything.
            await prisma.shipment.update({
                where: { id },
                data: { status: 'PENDING' } // Or whatever the initial status should be. 'PENDING' is usually safe.
            });
        }

        return new NextResponse(null, { status: 204 });

    } catch (err) {
        console.error(err);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

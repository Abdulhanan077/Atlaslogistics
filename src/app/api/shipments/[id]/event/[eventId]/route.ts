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
        let latestEvent = await prisma.shipmentEvent.findFirst({
            where: { shipmentId: id, status: { not: 'CREATED' } },
            orderBy: [
                { timestamp: 'desc' },
                { createdAt: 'desc' }
            ]
        });

        // Fallback to ANY latest event (like CREATED) if no other events exist
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
    console.log(`DELETE request for shipment ${id}, event ${eventId}`);

    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    try {
        // Verify ownership/admin rights
        const shipment = await prisma.shipment.findUnique({
            where: { id },
            include: { events: true }
        });

        if (!shipment) return new NextResponse("Shipment not found", { status: 404 });

        if (shipment.adminId !== session.user.id && session.user.role !== 'SUPER_ADMIN') {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Verify if the event exists and belongs to this shipment
        const eventToDelete = await prisma.shipmentEvent.findUnique({
            where: { id: eventId }
        });

        if (!eventToDelete) {
            return new NextResponse("Event not found", { status: 404 });
        }

        if (eventToDelete.shipmentId !== id) {
            return new NextResponse("Event does not belong to this shipment", { status: 400 });
        }

        // Delete the event
        await prisma.shipmentEvent.delete({
            where: { id: eventId }
        });

        // Sync the main shipment status with the NEW latest event
        let latestEvent = await prisma.shipmentEvent.findFirst({
            where: { shipmentId: id, status: { not: 'CREATED' } },
            orderBy: [
                { timestamp: 'desc' },
                { createdAt: 'desc' }
            ]
        });

        // Fallback to ANY latest event (like CREATED) if no other updates exist
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
        } else {
            await prisma.shipment.update({
                where: { id },
                data: { status: 'PENDING' }
            });
        }

        return new NextResponse(null, { status: 204 });

    } catch (err) {
        console.error("DELETE event error:", err);
        return new NextResponse(err instanceof Error ? err.message : "Internal Error", { status: 500 });
    }
}

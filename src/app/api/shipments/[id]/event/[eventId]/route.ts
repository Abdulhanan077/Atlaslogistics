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
        const { status, location, description, timestamp, latitude, longitude, isDeleted, holdFee, holdReason } = body;

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
                latitude: latitude !== undefined ? (latitude ? parseFloat(latitude) : null) : undefined,
                longitude: longitude !== undefined ? (longitude ? parseFloat(longitude) : null) : undefined,
                timestamp: timestamp ? new Date(timestamp) : undefined,
                isDeleted: isDeleted !== undefined ? isDeleted : undefined,
                deletedAt: isDeleted ? new Date() : (isDeleted === false ? null : undefined),
                holdFee: status !== undefined ? (status === 'ON_HOLD' ? (holdFee !== undefined && holdFee !== null && holdFee !== '' ? parseFloat(holdFee.toString()) : 0) : 0) : undefined,
                holdReason: status !== undefined ? (status === 'ON_HOLD' ? holdReason || null : null) : undefined
            }
        });

        // Check if we need to sync the main shipment status
        let latestEvent = await prisma.shipmentEvent.findFirst({
            where: { shipmentId: id, isDeleted: false, status: { not: 'CREATED' } },
            orderBy: [
                { timestamp: 'desc' },
                { createdAt: 'desc' }
            ]
        });

        // Fallback to ANY latest event (like CREATED) if no other events exist
        if (!latestEvent) {
            latestEvent = await prisma.shipmentEvent.findFirst({
                where: { shipmentId: id, isDeleted: false },
                orderBy: [
                    { timestamp: 'desc' },
                    { createdAt: 'desc' }
                ]
            });
        }

        if (latestEvent) {
            await prisma.shipment.update({
                where: { id },
                data: {
                    status: latestEvent.status,
                    holdFee: latestEvent.status === 'ON_HOLD' ? latestEvent.holdFee : 0,
                    holdReason: latestEvent.status === 'ON_HOLD' ? latestEvent.holdReason : null
                }
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

        const url = new URL(req.url);
        const isPermanent = url.searchParams.get('permanent') === 'true';

        if (isPermanent) {
            // Hard delete the event
            await prisma.shipmentEvent.delete({
                where: { id: eventId }
            });
        } else {
            // Soft delete the event
            await prisma.shipmentEvent.update({
                where: { id: eventId },
                data: { isDeleted: true, deletedAt: new Date() }
            });
        }

        // Sync the main shipment status with the NEW latest event
        let latestEvent = await prisma.shipmentEvent.findFirst({
            where: { shipmentId: id, isDeleted: false, status: { not: 'CREATED' } },
            orderBy: [
                { timestamp: 'desc' },
                { createdAt: 'desc' }
            ]
        });

        // Fallback to ANY latest event (like CREATED) if no other updates exist
        if (!latestEvent) {
            latestEvent = await prisma.shipmentEvent.findFirst({
                where: { shipmentId: id, isDeleted: false },
                orderBy: [
                    { timestamp: 'desc' },
                    { createdAt: 'desc' }
                ]
            });
        }

        if (latestEvent) {
            await prisma.shipment.update({
                where: { id },
                data: {
                    status: latestEvent.status,
                    holdFee: latestEvent.status === 'ON_HOLD' ? latestEvent.holdFee : 0,
                    holdReason: latestEvent.status === 'ON_HOLD' ? latestEvent.holdReason : null
                }
            });
        } else {
            await prisma.shipment.update({
                where: { id },
                data: {
                    status: 'PENDING',
                    holdFee: 0,
                    holdReason: null
                }
            });
        }

        return new NextResponse(null, { status: 204 });

    } catch (err) {
        console.error("DELETE event error:", err);
        return new NextResponse(err instanceof Error ? err.message : "Internal Error", { status: 500 });
    }
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const body = await req.json();

        // Allowed fields to update
        const { createdAt, status, origin, destination, trackingNumber, productDescription, imageUrls } = body;

        // Verify ownership
        const existingShipment = await prisma.shipment.findUnique({ where: { id } });
        if (!existingShipment || (existingShipment.adminId !== session.user.id && session.user.role !== 'SUPER_ADMIN')) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const updateData: any = {};
        if (createdAt) updateData.createdAt = new Date(createdAt);
        if (status) updateData.status = status;
        if (origin) updateData.origin = origin;
        if (destination) updateData.destination = destination;
        if (trackingNumber) updateData.trackingNumber = trackingNumber;
        if (productDescription !== undefined) updateData.productDescription = productDescription;
        if (imageUrls !== undefined) updateData.imageUrls = imageUrls;

        const updatedShipment = await prisma.shipment.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json(updatedShipment);
    } catch (err) {
        console.error("Error updating shipment:", err);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    try {
        // Verify ownership
        const existingShipment = await prisma.shipment.findUnique({ where: { id } });
        if (!existingShipment || (existingShipment.adminId !== session.user.id && session.user.role !== 'SUPER_ADMIN')) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        await prisma.shipment.delete({
            where: { id }
        });

        return new NextResponse(null, { status: 204 });
    } catch (err) {
        console.error("Error deleting shipment:", err);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

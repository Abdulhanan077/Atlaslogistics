import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { logAction } from "@/lib/logger";

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

        await logAction(session.user.id, "DELETE_SHIPMENT_PERMANENT", id, { trackingNumber: existingShipment.trackingNumber });

        return new NextResponse(null, { status: 204 });
    } catch (err) {
        console.error("Error permanently deleting shipment:", err);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

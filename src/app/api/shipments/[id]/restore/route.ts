import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { logAction } from "@/lib/logger";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    try {
        // Verify ownership
        const existingShipment = await prisma.shipment.findUnique({ where: { id } });
        if (!existingShipment || (existingShipment.adminId !== session.user.id && session.user.role !== 'SUPER_ADMIN')) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const restoredShipment = await prisma.shipment.update({
            where: { id },
            data: {
                isDeleted: false,
                deletedAt: null
            }
        });

        await logAction(session.user.id, "RESTORE_SHIPMENT", id, { trackingNumber: existingShipment.trackingNumber });

        const parsedShipment = {
            ...restoredShipment,
            imageUrls: restoredShipment.imageUrls ? JSON.parse(restoredShipment.imageUrls) : []
        };

        return NextResponse.json(parsedShipment);
    } catch (err) {
        console.error("Error restoring shipment:", err);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

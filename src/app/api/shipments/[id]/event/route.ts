import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

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

        // Transaction: Add event + Update shipment status
        // Using interactive transaction to ensure consistency
        const result = await prisma.$transaction([
            prisma.shipmentEvent.create({
                data: {
                    shipmentId: id,
                    status,
                    location,
                    description,
                    latitude: latitude ? parseFloat(latitude) : null,
                    longitude: longitude ? parseFloat(longitude) : null,
                    timestamp: timestamp ? new Date(timestamp) : undefined // Use provided timestamp or default to now()
                }
            }),
            prisma.shipment.update({
                where: { id },
                data: { status }
            })
        ]);

        return NextResponse.json(result);
    } catch (err) {
        console.error(err);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

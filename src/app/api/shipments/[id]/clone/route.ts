import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;

        // 1. Fetch the original shipment
        const originalShipment = await prisma.shipment.findUnique({
            where: { id }
        });

        if (!originalShipment) {
            return new NextResponse("Shipment Not Found", { status: 404 });
        }

        // 2. Generate a new, unique Tracking Number
        const trackingNumber = `TRK${Math.floor(10000000 + Math.random() * 90000000)}`;

        // 3. Create the cloned shipment
        const clonedShipment = await prisma.shipment.create({
            data: {
                trackingNumber,
                senderInfo: originalShipment.senderInfo,
                receiverInfo: originalShipment.receiverInfo,
                status: 'PENDING', // Reset status
                origin: originalShipment.origin,
                destination: originalShipment.destination,
                customerEmail: originalShipment.customerEmail,
                estimatedDelivery: originalShipment.estimatedDelivery,
                productDescription: originalShipment.productDescription,
                imageUrls: '[]', // Reset attachments
                adminId: session.user.id, // Assign to the admin who clicked 'Clone'
                events: {
                    create: {
                        status: 'CREATED',
                        location: originalShipment.origin || 'System',
                        description: 'Shipment created',
                    }
                }
            }
        });

        return NextResponse.json(clonedShipment);

    } catch (error) {
        console.error("CLONE SHIPMENT ERROR:", error);
        return new NextResponse("Internal server error", { status: 500 });
    }
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        const { senderInfo, receiverInfo, origin, destination, estimatedDelivery } = body;

        // Generate random tracking number (e.g., TRK-12345678)
        const trackingNumber = `TRK-${Math.floor(10000000 + Math.random() * 90000000)}`;

        const shipment = await prisma.shipment.create({
            data: {
                trackingNumber,
                senderInfo,
                receiverInfo,
                origin,
                destination,
                estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null,
                createdAt: body.createdAt ? new Date(body.createdAt) : undefined,
                status: "PENDING",
                adminId: session.user.id,
                events: {
                    create: {
                        status: "CREATED",
                        location: origin || "System",
                        description: "Shipment created",
                        timestamp: body.createdAt ? new Date(body.createdAt) : undefined
                    }
                }
            }
        });

        return NextResponse.json(shipment);
    } catch (error) {
        console.error("[SHIPMENTS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const shipments = await prisma.shipment.findMany({
            where: {
                adminId: session.user.id
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(shipments);
    } catch (error) {
        console.error("[SHIPMENTS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendShipmentEmail } from "@/lib/email";
import { logAction } from "@/lib/logger";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        const { senderInfo, receiverInfo, origin, destination, estimatedDelivery, customerEmail } = body;

        // Generate random tracking number (e.g., TRK12345678)
        const trackingNumber = `TRK${Math.floor(10000000 + Math.random() * 90000000)}`;

        const shipment = await prisma.shipment.create({
            data: {
                trackingNumber,
                senderInfo,
                receiverInfo,
                origin,
                destination,
                customerEmail,
                estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null,
                imageUrls: JSON.stringify(body.imageUrls || []), // SQLite fix
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

        // Log action
        await logAction(session.user.id, "CREATE_SHIPMENT", shipment.id, { trackingNumber });

        // Send Email
        if (customerEmail) {
            // Must await in serverless/Vercel to avoid early termination
            await sendShipmentEmail({
                to: customerEmail,
                trackingNumber,
                status: "CREATED",
                location: origin || "System",
                description: "Your shipment has been created."
            });
        }

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
        const { searchParams } = new URL(req.url);
        const viewAs = searchParams.get('viewAs');

        // Only enforce adminId if the user is NOT a SUPER_ADMIN,
        // OR if they are a SUPER_ADMIN requesting to view a specific admin.
        // If a SUPER_ADMIN requests without viewAs, they get all shipments.
        const whereClause: any = { isDeleted: false };
        if (session.user.role === 'SUPER_ADMIN' && viewAs) {
            whereClause.adminId = viewAs;
        } else if (session.user.role !== 'SUPER_ADMIN') {
            whereClause.adminId = session.user.id;
        }

        const shipments = await prisma.shipment.findMany({
            where: whereClause,
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                events: {
                    orderBy: {
                        timestamp: 'desc'
                    },
                    take: 1
                }
            }
        });

        const parsedShipments = shipments.map(s => {
            let parsedImageUrls = [];
            try {
                parsedImageUrls = s.imageUrls ? JSON.parse(s.imageUrls) : [];
            } catch (e) {
                console.error("Failed to parse imageUrls for shipment", s.id, e);
            }
            return {
                ...s,
                imageUrls: parsedImageUrls
            };
        });

        return NextResponse.json(parsedShipments);
    } catch (error) {
        console.error("[SHIPMENTS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

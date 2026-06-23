import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { logAction } from "@/lib/logger";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const body = await req.json();

        // Allowed fields to update
        const { createdAt, status, origin, destination, trackingNumber, productDescription, imageUrls, videoUrls, senderInfo, receiverInfo, customerEmail, holdFee, holdReason, holdHidden, trackerUsername, trackerPassword } = body;

        // Verify ownership
        const existingShipment = await prisma.shipment.findUnique({ where: { id } });
        if (!existingShipment) {
            return new NextResponse("Not Found", { status: 404 });
        }

        const isTracker = (session.user as any).role === 'TRACKER';
        if (isTracker) {
            if ((session.user as any).id !== id) {
                return new NextResponse("Forbidden", { status: 403 });
            }
        } else if (existingShipment.adminId !== session.user.id && session.user.role !== 'SUPER_ADMIN') {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const updateData: any = {};
        if (createdAt) updateData.createdAt = new Date(createdAt);
        if (status) updateData.status = status;
        if (origin) updateData.origin = origin;
        if (destination) updateData.destination = destination;
        if (trackingNumber) updateData.trackingNumber = trackingNumber;
        if (productDescription !== undefined) updateData.productDescription = productDescription;
        if (imageUrls !== undefined) updateData.imageUrls = JSON.stringify(imageUrls); // SQLite fix
        if (videoUrls !== undefined) updateData.videoUrls = JSON.stringify(videoUrls);
        if (body.estimatedDelivery !== undefined) updateData.estimatedDelivery = body.estimatedDelivery ? new Date(body.estimatedDelivery) : null;
        if (senderInfo !== undefined) updateData.senderInfo = senderInfo;
        if (receiverInfo !== undefined) updateData.receiverInfo = receiverInfo;
        if (customerEmail !== undefined) updateData.customerEmail = customerEmail;
        if (body.showRoute !== undefined) updateData.showRoute = body.showRoute;
        if (holdFee !== undefined) updateData.holdFee = holdFee !== null ? parseFloat(holdFee) : 0;
        if (holdReason !== undefined) updateData.holdReason = holdReason;
        if (holdHidden !== undefined) updateData.holdHidden = holdHidden;
        if (body.holdBaseCharge !== undefined) updateData.holdBaseCharge = body.holdBaseCharge !== null ? parseFloat(body.holdBaseCharge) : 0;

        if (trackerUsername !== undefined) {
            const trimmedUsername = trackerUsername ? trackerUsername.trim() : "";
            if (trimmedUsername) {
                if (trimmedUsername.toLowerCase() !== existingShipment.trackerUsername?.toLowerCase()) {
                    const existingUser = await prisma.user.findFirst({
                        where: { email: { equals: trimmedUsername, mode: 'insensitive' } }
                    });
                    const existingShipmentWithUsername = await prisma.shipment.findFirst({
                        where: { trackerUsername: { equals: trimmedUsername, mode: 'insensitive' } }
                    });
                    if (existingUser || existingShipmentWithUsername) {
                        return new NextResponse("Username already taken", { status: 400 });
                    }
                }
                updateData.trackerUsername = trimmedUsername;
            } else {
                updateData.trackerUsername = null;
                updateData.trackerPassword = null;
            }
        }

        if (trackerPassword !== undefined && trackerPassword !== null && trackerPassword.trim() !== "") {
            updateData.trackerPassword = await bcrypt.hash(trackerPassword.trim(), 10);
        }

        // Handle newInstallment, deleteInstallmentId or restoreInstallmentId
        let installmentsChanged = false;
        if (body.newInstallment !== undefined || body.deleteInstallmentId !== undefined || body.restoreInstallmentId !== undefined) {
            let list: any[] = [];
            try {
                list = JSON.parse(existingShipment.holdInstallments || "[]");
                if (!Array.isArray(list)) list = [];
            } catch (e) {
                list = [];
            }

            if (body.newInstallment !== undefined && parseFloat(body.newInstallment.toString()) > 0) {
                const amount = parseFloat(body.newInstallment.toString());
                const instId = 'inst_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
                list.push({
                    id: instId,
                    amount,
                    timestamp: new Date().toISOString()
                });
                installmentsChanged = true;
            }

            if (body.deleteInstallmentId !== undefined && body.deleteInstallmentId) {
                const targetId = body.deleteInstallmentId.toString();
                list = list.map(item => {
                    if (item.id === targetId) {
                        return { ...item, isDeleted: true };
                    }
                    return item;
                });
                installmentsChanged = true;
            }

            if (body.restoreInstallmentId !== undefined && body.restoreInstallmentId) {
                const targetId = body.restoreInstallmentId.toString();
                list = list.map(item => {
                    if (item.id === targetId) {
                        return { ...item, isDeleted: false };
                    }
                    return item;
                });
                installmentsChanged = true;
            }

            if (installmentsChanged) {
                updateData.holdInstallments = JSON.stringify(list);
                
                const activeHoldEvent = await prisma.shipmentEvent.findFirst({
                    where: { shipmentId: id, status: 'ON_HOLD', isDeleted: false },
                    orderBy: [
                        { timestamp: 'desc' },
                        { createdAt: 'desc' }
                    ]
                });

                if (activeHoldEvent) {
                    const holdStart = new Date(activeHoldEvent.timestamp);
                    updateData.holdPaid = list
                        .filter(item => !item.isDeleted && new Date(item.timestamp) >= holdStart)
                        .reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
                } else {
                    updateData.holdPaid = 0;
                }
            }
        }

        if (body.holdPaid !== undefined && !installmentsChanged) {
            updateData.holdPaid = body.holdPaid !== null ? parseFloat(body.holdPaid) : 0;
        }

        const updatedShipment = await prisma.shipment.update({
            where: { id },
            data: updateData
        });

        await logAction(session.user.id, "UPDATE_SHIPMENT", id, updateData);

        const parsedShipment = {
            ...updatedShipment,
            imageUrls: (updatedShipment as any).imageUrls ? JSON.parse((updatedShipment as any).imageUrls) : [],
            videoUrls: (updatedShipment as any).videoUrls ? JSON.parse((updatedShipment as any).videoUrls) : []
        };

        return NextResponse.json(parsedShipment);
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
        if (!existingShipment) return new NextResponse("Not Found", { status: 404 });

        if ((session.user as any).role === 'TRACKER') {
            return new NextResponse("Forbidden", { status: 403 });
        }

        if (existingShipment.adminId !== session.user.id && session.user.role !== 'SUPER_ADMIN') {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Soft Delete
        await prisma.shipment.update({
            where: { id },
            data: {
                isDeleted: true,
                deletedAt: new Date()
            }
        });

        await logAction(session.user.id, "TRASH_SHIPMENT", id, { trackingNumber: existingShipment.trackingNumber });

        return new NextResponse(null, { status: 204 });
    } catch (err) {
        console.error("Error trashing shipment:", err);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

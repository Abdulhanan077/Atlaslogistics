
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendChatNotification } from "@/lib/email";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    // Public endpoint for tracking page (fetching messages for a shipment)
    // In a real app, you might want to protect this with a token, but for now it's public if you know the ID/Tracking Number.
    // However, the ID (UUID) is hard to guess.

    try {
        if (!id) {
            return new NextResponse("Missing Shipment ID", { status: 400 });
        }

        const messages = await prisma.message.findMany({
            where: { shipmentId: id },
            orderBy: { createdAt: 'asc' }
        });
        return NextResponse.json(messages);
    } catch (e: any) {
        console.error(`[API_MESSAGES_GET] Error for shipment ${id}:`, e.message);
        return new NextResponse(`Error fetching messages: ${e.message}`, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    try {
        const { content, sender, imageUrl } = await req.json();

        // Validation
        if (!content && !imageUrl) return new NextResponse("Content or Image required", { status: 400 });

        // Determine role:
        // If session exists and user is admin/super_admin, they can be "ADMIN".
        // Otherwise, it's a "CLIENT".

        const actualSender = sender === 'CLIENT' ? 'CLIENT' : 'ADMIN';

        // If trying to send as ADMIN, verify they actually have an admin session
        if (actualSender === 'ADMIN') {
            if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
                return new NextResponse("Unauthorized", { status: 401 });
            }
        }

        const message = await prisma.message.create({
            data: {
                content: content || "",
                imageUrl: imageUrl || null,
                sender: actualSender,
                shipmentId: id
            }
        });

        // Fire email notification synchronously to prevent Next.js from aggressively killing the background worker
        try {
            const shipment = await prisma.shipment.findUnique({
                where: { id },
                include: { admin: true }
            });

            if (shipment) {
                if (actualSender === 'ADMIN') {
                    // Admin replied. Notify Customer if email exists.
                    if (shipment.customerEmail) {
                        await sendChatNotification(
                            shipment.customerEmail, 
                            shipment.trackingNumber, 
                            shipment.id, 
                            content || "[Image attachment]", 
                            false
                        );
                    }
                } else {
                    // Customer replied. Notify Admin.
                    const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } }).catch(() => null);
                    const adminEmail = (settings?.chatNotificationEmail && settings.chatNotificationEmail.trim()) || shipment.admin?.email;
                    if (adminEmail) {
                        await sendChatNotification(
                            adminEmail, 
                            shipment.trackingNumber, 
                            shipment.id, 
                            content || "[Image attachment]", 
                            true
                        );
                    }
                }
            }
        } catch (err) {
            console.error("Background chat email error:", err);
        }

        return NextResponse.json(message);
    } catch (e: any) {
        console.error(`[API_MESSAGES_POST] Error:`, e.message);
        return new NextResponse(`Error sending message: ${e.message}`, { status: 500 });
    }
}

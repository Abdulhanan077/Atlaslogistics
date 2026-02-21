
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    // Public endpoint for tracking page (fetching messages for a shipment)
    // In a real app, you might want to protect this with a token, but for now it's public if you know the ID/Tracking Number.
    // However, the ID (UUID) is hard to guess.

    try {
        const messages = await (prisma as any).message.findMany({
            where: { shipmentId: id },
            orderBy: { createdAt: 'asc' }
        });
        return NextResponse.json(messages);
    } catch (e) {
        return new NextResponse("Error fetching messages", { status: 500 });
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

        let actualSender = sender === 'CLIENT' ? 'CLIENT' : 'ADMIN';

        // If trying to send as ADMIN, verify they actually have an admin session
        if (actualSender === 'ADMIN') {
            if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
                return new NextResponse("Unauthorized", { status: 401 });
            }
        }

        const message = await (prisma as any).message.create({
            data: {
                content: content || "",
                imageUrl: imageUrl || null,
                sender: actualSender,
                shipmentId: id
            }
        });

        return NextResponse.json(message);
    } catch (e) {
        console.error(e);
        return new NextResponse("Error sending message", { status: 500 });
    }
}

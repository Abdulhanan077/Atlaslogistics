import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN') {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;

        // Verify the message exists
        const message = await prisma.message.findUnique({
            where: { id }
        });

        if (!message) {
            return new NextResponse("Not Found", { status: 404 });
        }

        // Hard delete the message
        await prisma.message.delete({
            where: { id }
        });

        return new NextResponse("Message deleted", { status: 200 });

    } catch (error) {
        console.error("DELETE MESSAGE ERROR:", error);
        return new NextResponse("Internal server error", { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN') {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { content } = body;

        if (!content || typeof content !== 'string') {
            return new NextResponse("Invalid content", { status: 400 });
        }

        // Verify the message exists
        const message = await prisma.message.findUnique({
            where: { id }
        });

        if (!message) {
            return new NextResponse("Not Found", { status: 404 });
        }

        // Update the message content
        const updatedMessage = await prisma.message.update({
            where: { id },
            data: {
                content
            }
        });

        return NextResponse.json(updatedMessage);

    } catch (error) {
        console.error("PATCH MESSAGE ERROR:", error);
        return new NextResponse("Internal server error", { status: 500 });
    }
}

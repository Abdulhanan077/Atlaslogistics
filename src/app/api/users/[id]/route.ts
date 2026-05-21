import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'SUPER_ADMIN') {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    if (id === session.user.id) {
        return new NextResponse("Cannot delete yourself", { status: 400 });
    }

    try {
        await prisma.user.update({
            where: { id },
            data: {
                isDeleted: true,
                deletedAt: new Date()
            }
        });
        return new NextResponse("Deleted", { status: 200 });
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'SUPER_ADMIN') {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        let body = null;
        const contentType = req.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            body = await req.json();
        }

        if (body && body.password) {
            if (body.password.length < 6) {
                return new NextResponse("Password must be at least 6 characters", { status: 400 });
            }
            const hashedPassword = await hash(body.password, 12);
            await prisma.user.update({
                where: { id },
                data: { password: hashedPassword }
            });
            return new NextResponse("Password reset successfully", { status: 200 });
        }

        // Default behavior (no body / restore)
        await prisma.user.update({
            where: { id },
            data: {
                isDeleted: false,
                deletedAt: null
            }
        });
        return new NextResponse("Restored", { status: 200 });
    } catch (error) {
        console.error("Error updating user:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}


import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

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
        await prisma.user.delete({
            where: { id }
        });
        return new NextResponse("Deleted", { status: 200 });
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

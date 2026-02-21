import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'SUPER_ADMIN') {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { email, password, name } = await req.json();

        if (!email || !password) {
            return new NextResponse("Missing fields", { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: "ADMIN"
            }
        });

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json(userWithoutPassword);
    } catch (error) {
        console.error(error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'SUPER_ADMIN') {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const deleted = searchParams.get("deleted") === "true";

    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        where: {
            isDeleted: deleted
        },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            isDeleted: true,
            deletedAt: true
        }
    });

    return NextResponse.json(users);
}

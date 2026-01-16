import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const { password } = await req.json();

        if (!password || password.length < 6) {
            return new NextResponse("Password must be at least 6 characters", { status: 400 });
        }

        const hashedPassword = await hash(password, 12);

        await prisma.user.update({
            where: { id: session.user.id },
            data: { password: hashedPassword }
        });

        return new NextResponse("Password updated successfully", { status: 200 });
    } catch (error) {
        console.error("Error updating password:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

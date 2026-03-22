import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const { email, password, name, secret } = await req.json();
        
        if (!email || !password || !secret) {
            return new NextResponse("Missing fields", { status: 400 });
        }

        if (secret !== process.env.ADMIN_SECRET) {
            return new NextResponse("Invalid Admin Secret Key", { status: 403 });
        }

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return new NextResponse("Email already registered", { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: name || "New Administrator",
                role: "SUPER_ADMIN"
            }
        });

        return NextResponse.json({ success: true, message: "Admin registered successfully." });
    } catch (e) {
        console.error(e);
        return new NextResponse("Internal server error", { status: 500 });
    }
}

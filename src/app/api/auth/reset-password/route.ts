import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const { token, newPassword } = await req.json();
        const cleanToken = token?.trim();
        
        console.log("Attempting password reset with token:", cleanToken);

        if (!cleanToken || !newPassword) {
            console.log("Missing fields.");
            return new NextResponse("Token and new password required", { status: 400 });
        }

        const user = await (prisma as any).user.findFirst({
            where: { 
                resetToken: cleanToken,
                resetTokenExpiry: { gt: new Date() }
            }
        });

        if (!user) {
            console.log("Token invalid or expired for:", cleanToken);
            return new NextResponse("Invalid or expired reset token. Please request a new code.", { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await (prisma as any).user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null
            }
        });

        return NextResponse.json({ success: true, message: "Password successfully reset." });
    } catch (e) {
        console.error("Reset password error", e);
        return new NextResponse("Internal error", { status: 500 });
    }
}

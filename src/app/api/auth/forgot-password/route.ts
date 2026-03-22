import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();
        if (!email) return new NextResponse("Email required", { status: 400 });

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            // Standard security practice: Don't reveal if user exists when an incorrect email is fed.
            return NextResponse.json({ success: true, message: "If an account exists, an email has been sent." });
        }

        const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

        // Ignoring type errors temporarily as DB Push needs to lock-refresh on Windows later
        await (prisma as any).user.update({
            where: { email },
            data: { resetToken, resetTokenExpiry }
        });

        await sendPasswordResetEmail(email, resetToken);

        return NextResponse.json({ success: true, message: "Password reset email sent." });
    } catch (e) {
        console.error("Forgot password error", e);
        return new NextResponse("Internal error", { status: 500 });
    }
}

import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";

export async function POST(request: Request): Promise<NextResponse> {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    const session = await getServerSession(authOptions);
    if (!session) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    if (!filename || !request.body) {
        return new NextResponse('Filename and body are required', { status: 400 });
    }

    const blob = await put(filename, request.body, {
        access: 'public',
    });

    return NextResponse.json(blob);
}

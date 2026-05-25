import { PutObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from '@/lib/r2';

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

    try {
        const body = await request.arrayBuffer();
        const randomSuffix = Math.random().toString(36).substring(2, 15);
        const fileExtension = filename.split('.').pop() || '';
        const baseName = filename.substring(0, filename.lastIndexOf('.')).replace(/[^a-zA-Z0-9]/g, '_');
        const key = `uploads/${session.user.id}/${baseName}-${randomSuffix}.${fileExtension}`;

        const contentType = request.headers.get('content-type') || 'application/octet-stream';

        const command = new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
            Body: Buffer.from(body),
            ContentType: contentType,
        });

        await r2Client.send(command);

        return NextResponse.json({
            url: `${R2_PUBLIC_URL}/${key}`,
            key,
        });
    } catch (error: any) {
        console.error("UPLOAD ERROR:", error);
        return new NextResponse(`Server Error: ${error.message}`, { status: 500 });
    }
}

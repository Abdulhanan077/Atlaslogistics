import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from '@/lib/r2';

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { filename, contentType } = await request.json();
        if (!filename) {
            return new NextResponse('Filename is required', { status: 400 });
        }

        // Generate a unique path/key for the file to prevent collisions
        const randomSuffix = Math.random().toString(36).substring(2, 15);
        const fileExtension = filename.split('.').pop() || '';
        const baseName = filename.substring(0, filename.lastIndexOf('.')).replace(/[^a-zA-Z0-9]/g, '_');
        const key = `uploads/${session.user.id}/${baseName}-${randomSuffix}.${fileExtension}`;

        const command = new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
            ContentType: contentType || 'application/octet-stream',
        });

        // Generate the presigned PUT URL (valid for 1 hour)
        const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
        
        // Construct the final public URL
        const publicUrl = `${R2_PUBLIC_URL}/${key}`;

        return NextResponse.json({
            uploadUrl,
            publicUrl,
            key,
        });
    } catch (error: any) {
        console.error("TOKEN GENERATION ERROR:", error);
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 }
        );
    }
}

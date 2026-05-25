import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import { ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from "@/lib/r2";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'SUPER_ADMIN') {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        // List objects from R2
        let totalSize = 0;
        try {
            const listCommand = new ListObjectsV2Command({
                Bucket: R2_BUCKET_NAME,
            });
            const s3List = await r2Client.send(listCommand);
            totalSize = (s3List.Contents || []).reduce((acc, obj) => acc + (obj.Size || 0), 0);
        } catch (s3Error) {
            console.error("Failed to list objects from R2:", s3Error);
        }

        const shipments = (await prisma.shipment.findMany({
            where: { isDeleted: false },
            select: {
                id: true,
                trackingNumber: true,
                imageUrls: true,
                videoUrls: true,
                createdAt: true,
            } as any
        })) as any[];

        const allMedia: any[] = [];
        shipments.forEach(s => {
            let images = [];
            let videos = [];
            try {
                images = JSON.parse(s.imageUrls);
                videos = JSON.parse(s.videoUrls);
            } catch (e) {}

            images.forEach((url: string) => {
                allMedia.push({
                    url,
                    type: 'image',
                    shipmentId: s.id,
                    trackingNumber: s.trackingNumber,
                    createdAt: s.createdAt
                });
            });

            videos.forEach((url: string) => {
                allMedia.push({
                    url,
                    type: 'video',
                    shipmentId: s.id,
                    trackingNumber: s.trackingNumber,
                    createdAt: s.createdAt
                });
            });
        });

        // Sort by date desc
        allMedia.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return NextResponse.json({
            media: allMedia,
            totalSize
        });
    } catch (error) {
        console.error(error);
        return new NextResponse('Server Error', { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'SUPER_ADMIN') {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const { url, shipmentId, type } = await request.json();
        if (!url || !shipmentId) {
            return new NextResponse('Missing required fields', { status: 400 });
        }

        // Fetch shipment to verify age and current URLs
        const shipment = await prisma.shipment.findUnique({
            where: { id: shipmentId }
        });

        if (!shipment) {
            return new NextResponse('Shipment not found', { status: 404 });
        }

        // Check age (1 month = 30 days)
        const oneMonthAgo = new Date();
        oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
        if (new Date(shipment.createdAt) > oneMonthAgo) {
            return new NextResponse('Cannot delete media less than a month old', { status: 403 });
        }

        // Delete from storage provider
        try {
            if (url.includes('vercel-storage.com')) {
                const { del } = await import('@vercel/blob');
                await del(url);
            } else {
                let key = url;
                if (url.startsWith(R2_PUBLIC_URL)) {
                    key = url.substring(R2_PUBLIC_URL.length + 1); // remove leading slash
                } else {
                    try {
                        const parsedUrl = new URL(url);
                        key = parsedUrl.pathname.substring(1); // remove leading slash
                    } catch (e) {}
                }

                const deleteCommand = new DeleteObjectCommand({
                    Bucket: R2_BUCKET_NAME,
                    Key: key,
                });
                await r2Client.send(deleteCommand);
            }
        } catch (storageError) {
            console.error("Storage deletion error:", storageError);
            // Continue anyway to sync DB if file is already gone or other error
        }

        // Update Shipment in DB
        if (type === 'image') {
            const currentImages = JSON.parse(shipment.imageUrls);
            const updatedImages = currentImages.filter((u: string) => u !== url);
            await prisma.shipment.update({
                where: { id: shipmentId },
                data: { imageUrls: JSON.stringify(updatedImages) }
            });
        } else if (type === 'video') {
            const currentVideos = JSON.parse((shipment as any).videoUrls || "[]");
            const updatedVideos = currentVideos.filter((u: string) => u !== url);
            await prisma.shipment.update({
                where: { id: shipmentId },
                data: { videoUrls: JSON.stringify(updatedVideos) } as any
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return new NextResponse('Server Error', { status: 500 });
    }
}

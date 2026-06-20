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
            select: {
                id: true,
                trackingNumber: true,
                imageUrls: true,
                videoUrls: true,
                createdAt: true,
                isDeleted: true,
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
                    createdAt: s.createdAt,
                    isDeleted: s.isDeleted
                });
            });

            videos.forEach((url: string) => {
                allMedia.push({
                    url,
                    type: 'video',
                    shipmentId: s.id,
                    trackingNumber: s.trackingNumber,
                    createdAt: s.createdAt,
                    isDeleted: s.isDeleted
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
        const body = await request.json();
        
        // Normalize single vs bulk deletions
        const items = body.items || [{ url: body.url, shipmentId: body.shipmentId, type: body.type }];
        
        if (!items || items.length === 0) {
            return new NextResponse('Missing required fields', { status: 400 });
        }

        // Group items by shipmentId to optimize database updates
        const itemsByShipment: Record<string, Array<{ url: string; type: 'image' | 'video' }>> = {};
        for (const item of items) {
            if (!item.url || !item.shipmentId) continue;
            if (!itemsByShipment[item.shipmentId]) {
                itemsByShipment[item.shipmentId] = [];
            }
            itemsByShipment[item.shipmentId].push({ url: item.url, type: item.type });
        }

        // Process deletion per shipment group
        for (const [shipmentId, shipmentItems] of Object.entries(itemsByShipment)) {
            const shipment = await prisma.shipment.findUnique({
                where: { id: shipmentId }
            });

            if (!shipment) continue;

            // Check age constraint (30 days retention policy)
            const oneMonthAgo = new Date();
            oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
            if (new Date(shipment.createdAt) > oneMonthAgo) {
                return new NextResponse('Cannot delete media less than a month old', { status: 403 });
            }

            // Delete storage provider files
            for (const item of shipmentItems) {
                try {
                    const url = item.url;
                    if (url.includes('vercel-storage.com')) {
                        const { del } = await import('@vercel/blob');
                        await del(url);
                    } else {
                        let key = url;
                        if (url.startsWith(R2_PUBLIC_URL)) {
                            key = url.substring(R2_PUBLIC_URL.length + 1);
                        } else {
                            try {
                                const parsedUrl = new URL(url);
                                key = parsedUrl.pathname.substring(1);
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
                }
            }

            // Update database records
            let currentImages = [];
            let currentVideos = [];
            try {
                currentImages = JSON.parse(shipment.imageUrls || "[]");
                currentVideos = JSON.parse((shipment as any).videoUrls || "[]");
            } catch (e) {}

            const urlsToDelete = shipmentItems.map(item => item.url);
            const updatedImages = currentImages.filter((u: string) => !urlsToDelete.includes(u));
            const updatedVideos = currentVideos.filter((u: string) => !urlsToDelete.includes(u));

            await prisma.shipment.update({
                where: { id: shipmentId },
                data: {
                    imageUrls: JSON.stringify(updatedImages),
                    videoUrls: JSON.stringify(updatedVideos)
                } as any
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return new NextResponse('Server Error', { status: 500 });
    }
}

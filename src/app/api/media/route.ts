import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import { del, list } from '@vercel/blob';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'SUPER_ADMIN') {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const { blobs } = await list();
        const totalSize = blobs.reduce((acc, blob) => acc + blob.size, 0);

        const shipments = await prisma.shipment.findMany({
            where: { isDeleted: false },
            select: {
                id: true,
                trackingNumber: true,
                imageUrls: true,
                videoUrls: true,
                createdAt: true,
            }
        });

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

        // Delete from Vercel Blob
        try {
            await del(url);
        } catch (blobError) {
            console.error("Blob deletion error:", blobError);
            // Continue anyway to sync DB if blob is already gone or other error
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
            const currentVideos = JSON.parse(shipment.videoUrls);
            const updatedVideos = currentVideos.filter((u: string) => u !== url);
            await prisma.shipment.update({
                where: { id: shipmentId },
                data: { videoUrls: JSON.stringify(updatedVideos) }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return new NextResponse('Server Error', { status: 500 });
    }
}

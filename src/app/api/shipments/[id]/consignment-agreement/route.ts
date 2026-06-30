import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import ConsignmentAgreementPDF from '@/components/pdf/ConsignmentAgreementPDF';
import path from 'path';
import fs from 'fs';

export const dynamic = 'force-dynamic';

async function fetchImageAsBase64(url: string, origin: string): Promise<string> {
    if (!url) return '';
    try {
        if (!url.startsWith('http')) {
            // Local path resolution
            let localPath = path.join(process.cwd(), 'public', url);
            if (!fs.existsSync(localPath)) {
                localPath = path.join(process.cwd(), 'Atlaslogistics-main', 'public', url);
            }
            if (!fs.existsSync(localPath)) {
                localPath = path.join('c:\\Users\\Admin\\Desktop\\Atlaslogistics-main\\Atlaslogistics-main\\public', url);
            }
            if (fs.existsSync(localPath)) {
                const buffer = fs.readFileSync(localPath);
                const ext = path.extname(localPath).substring(1);
                return `data:image/${ext === 'svg' ? 'svg+xml' : ext};base64,${buffer.toString('base64')}`;
            }
            // Fallback to origin url
            url = `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
        }
        
        const res = await fetch(url);
        if (!res.ok) return '';
        const buffer = await res.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        const contentType = res.headers.get('content-type') || 'image/png';
        return `data:${contentType};base64,${base64}`;
    } catch (e) {
        console.error("Failed to fetch image as base64:", e);
        return '';
    }
}

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    
    try {
        const shipment = await prisma.shipment.findUnique({
            where: { id }
        });

        if (!shipment) {
            return new NextResponse("Shipment Not Found", { status: 404 });
        }

        const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });

        // Get origin dynamic URL from request headers
        const host = req.headers.get("host") || "localhost:3000";
        const protocol = host.includes("localhost") ? "http" : "https";
        const origin = `${protocol}://${host}`;

        // Fetch company logo as base64 to ensure it loads in the PDF background watermark
        const companyLogoBase64 = settings?.logoUrl ? await fetchImageAsBase64(settings.logoUrl, origin) : '';

        // Generate Consignment Agreement PDF
        const pdfBuffer = await renderToBuffer(
            React.createElement(ConsignmentAgreementPDF, { shipment, settings, origin, companyLogoBase64 }) as any
        );

        return new NextResponse(pdfBuffer as any, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename=CONSIGNMENT-AGREEMENT-${shipment.trackingNumber}.pdf`,
                "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
                "Pragma": "no-cache",
                "Expires": "0"
            }
        });
    } catch (err) {
        console.error("Consignment agreement PDF generation error:", err);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

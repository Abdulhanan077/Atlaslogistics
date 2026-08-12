import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import ConsignmentAgreementPDF from '@/components/pdf/ConsignmentAgreementPDF';
import path from 'path';
import fs from 'fs';

export const dynamic = 'force-dynamic';

async function resolveImagePath(url: string, origin: string): Promise<string> {
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
                return localPath.replace(/\\/g, '/');
            }
            // Fallback to origin url
            url = `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
        }
        
        // If localhost URL, resolve local path directly
        if (url.includes('localhost') || url.includes('127.0.0.1')) {
            try {
                const urlPath = new URL(url).pathname;
                let localPath = path.join(process.cwd(), 'public', urlPath);
                if (!fs.existsSync(localPath)) {
                    localPath = path.join(process.cwd(), 'Atlaslogistics-main', 'public', urlPath);
                }
                if (fs.existsSync(localPath)) {
                    return localPath.replace(/\\/g, '/');
                }
            } catch (err) {
                // Ignore URL parsing errors
            }
        }
        
        // Try to fetch external URL with a short timeout.
        // Fallback to empty string on error/timeout so the PDF uses local seal assets.
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        try {
            const res = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);
            
            if (res.ok) {
                const buffer = await res.arrayBuffer();
                const base64 = Buffer.from(buffer).toString('base64');
                const contentType = res.headers.get('content-type') || 'image/png';
                return `data:${contentType};base64,${base64}`;
            }
        } catch (fetchErr: any) {
            clearTimeout(timeoutId);
            console.warn("External logo fetch failed, using local PDF assets fallback:", fetchErr.message);
        }
        
        return '';
    } catch (e) {
        console.error("Failed to resolve image path:", e);
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

        // Fetch company logo path (local path preferred to avoid react-pdf deadlocks)
        const companyLogoBase64 = settings?.logoUrl ? await resolveImagePath(settings.logoUrl, origin) : '';

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

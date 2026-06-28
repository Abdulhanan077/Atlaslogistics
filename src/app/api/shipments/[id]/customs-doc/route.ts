import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import CustomsPDF from '@/components/pdf/CustomsPDF';

export const dynamic = 'force-dynamic';

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

        // Generate Customs PDF
        const pdfBuffer = await renderToBuffer(
            React.createElement(CustomsPDF, { shipment, settings, origin }) as any
        );

        return new NextResponse(pdfBuffer as any, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename=CUSTOMS-DOC-${shipment.trackingNumber}.pdf`,
                "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
                "Pragma": "no-cache",
                "Expires": "0"
            }
        });
    } catch (err) {
        console.error("Customs document generation error:", err);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

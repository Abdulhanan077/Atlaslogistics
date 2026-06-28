import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import ReceiptPDF from '@/components/pdf/ReceiptPDF';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    
    try {
        const shipment = await prisma.shipment.findUnique({
            where: { id },
            include: {
                events: {
                    where: { isDeleted: false },
                    orderBy: [
                        { timestamp: 'desc' },
                        { createdAt: 'desc' }
                    ]
                }
            }
        });

        if (!shipment) {
            return new NextResponse("Shipment Not Found", { status: 404 });
        }

        const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });

        // Generate Receipt PDF
        const pdfBuffer = await renderToBuffer(
            React.createElement(ReceiptPDF, { shipment, settings }) as any
        );

        return new NextResponse(pdfBuffer as any, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename=RECEIPT-${shipment.trackingNumber}.pdf`
            }
        });
    } catch (err) {
        console.error("Receipt generation error:", err);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

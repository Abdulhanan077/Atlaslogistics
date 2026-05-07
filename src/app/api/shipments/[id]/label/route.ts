import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import ShipmentDetailsPDF from '@/components/pdf/ShipmentDetailsPDF';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const shipment = await prisma.shipment.findUnique({
            where: { id }
        });

        if (!shipment) {
            return new NextResponse("Shipment Not Found", { status: 404 });
        }

        const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });

        // Generate PDF
        const pdfBuffer = await renderToBuffer(React.createElement(ShipmentDetailsPDF, { shipment, settings }) as any);

        return new NextResponse(pdfBuffer as any, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename=WAYBILL-${shipment.trackingNumber}.pdf`
            }
        });
    } catch (err) {
        console.error("Label generation error:", err);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

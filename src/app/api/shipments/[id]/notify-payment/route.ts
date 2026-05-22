import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendPaymentNotificationEmail } from "@/lib/email";
import { logAction } from "@/lib/logger";
import { parseShipmentInfo } from "@/lib/utils";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

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

        if (!shipment || (shipment.adminId !== session.user.id && session.user.role !== 'SUPER_ADMIN')) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!shipment.customerEmail) {
            return new NextResponse("Customer email not set for this shipment", { status: 400 });
        }

        // Parse optional body inputs (useful to autosave typed settings upon notify trigger)
        let body: any = {};
        try {
            if (req.headers.get("content-type")?.includes("application/json")) {
                body = await req.json();
            }
        } catch (e) {
            // Ignore if body is empty or not JSON
        }

        const inputHoldFee = body.holdFee !== undefined ? parseFloat(body.holdFee) : undefined;
        const inputHoldReason = body.holdReason !== undefined ? body.holdReason : undefined;
        const inputHoldBaseCharge = body.holdBaseCharge !== undefined ? parseFloat(body.holdBaseCharge) : undefined;
        const inputHoldPaid = body.holdPaid !== undefined ? parseFloat(body.holdPaid) : undefined;
        const inputNewInstallment = body.newInstallment !== undefined ? parseFloat(body.newInstallment.toString()) : undefined;

        let finalShipment = shipment;

        // Perform update before fetching if we have changes
        const updateData: any = {};
        if (inputHoldFee !== undefined) updateData.holdFee = inputHoldFee;
        if (inputHoldReason !== undefined) updateData.holdReason = inputHoldReason;
        if (inputHoldBaseCharge !== undefined) updateData.holdBaseCharge = inputHoldBaseCharge;

        let installmentsChanged = false;
        let list: any[] = [];
        try {
            list = JSON.parse(shipment.holdInstallments || "[]");
            if (!Array.isArray(list)) list = [];
        } catch (e) {
            list = [];
        }

        if (inputNewInstallment !== undefined && inputNewInstallment > 0) {
            const instId = 'inst_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
            list.push({
                id: instId,
                amount: inputNewInstallment,
                timestamp: new Date().toISOString()
            });
            installmentsChanged = true;
        }

        if (installmentsChanged) {
            updateData.holdInstallments = JSON.stringify(list);
            updateData.holdPaid = list
                .filter(item => !item.isDeleted)
                .reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
        } else if (inputHoldPaid !== undefined) {
            updateData.holdPaid = inputHoldPaid;
        }

        if (Object.keys(updateData).length > 0) {
            await prisma.shipment.update({
                where: { id },
                data: updateData
            });

            // Find the active ON_HOLD event to update
            const activeHoldEvent = shipment.events.find(e => e.status === 'ON_HOLD');
            if (activeHoldEvent) {
                const eventUpdateData: any = {};
                if (inputHoldFee !== undefined) eventUpdateData.holdFee = inputHoldFee;
                if (inputHoldReason !== undefined) eventUpdateData.holdReason = inputHoldReason;

                if (Object.keys(eventUpdateData).length > 0) {
                    await prisma.shipmentEvent.update({
                        where: { id: activeHoldEvent.id },
                        data: eventUpdateData
                    });
                }
            }

            // Re-fetch final shipment state
            const refreshed = await prisma.shipment.findUnique({
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
            if (refreshed) {
                finalShipment = refreshed;
            }
        }

        const receiver = parseShipmentInfo(finalShipment.receiverInfo);

        // Calculate hold values
        const activeHoldEvent = finalShipment.events.find(e => e.status === 'ON_HOLD');
        const holdStart = activeHoldEvent ? new Date(activeHoldEvent.timestamp) : new Date(finalShipment.updatedAt);
        const now = new Date();
        const diffTime = Math.max(0, now.getTime() - holdStart.getTime());
        const daysElapsed = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

        const dailyFee = activeHoldEvent?.holdFee ?? finalShipment.holdFee ?? 0;
        const holdBaseCharge = finalShipment.holdBaseCharge ?? 0;
        const totalStorageAccrued = daysElapsed * dailyFee;
        const totalDue = holdBaseCharge + totalStorageAccrued;
        const amountPaid = finalShipment.holdPaid ?? 0;
        const remainingBalance = totalDue - amountPaid;
        const holdReason = activeHoldEvent?.holdReason || finalShipment.holdReason || "";

        let newPaymentAmount = inputNewInstallment;
        if (newPaymentAmount === undefined || newPaymentAmount <= 0) {
            let list: any[] = [];
            try {
                list = JSON.parse(finalShipment.holdInstallments || "[]");
                if (!Array.isArray(list)) list = [];
            } catch (e) {
                list = [];
            }

            const activeInstallments = list.filter(item => !item.isDeleted);
            if (activeInstallments.length > 0) {
                const latest = activeInstallments[activeInstallments.length - 1];
                const latestTime = new Date(latest.timestamp).getTime();
                const diffMs = Date.now() - latestTime;
                // If the latest installment was added in the last 5 minutes (300,000 ms),
                // treat it as the new/current payment amount for the email.
                if (diffMs < 5 * 60 * 1000) {
                    newPaymentAmount = parseFloat(latest.amount) || 0;
                }
            }
        }

        await sendPaymentNotificationEmail({
            to: finalShipment.customerEmail!,
            trackingNumber: finalShipment.trackingNumber,
            receiverName: receiver.name,
            holdBaseCharge,
            dailyFee,
            daysElapsed,
            totalStorageAccrued,
            totalDue,
            amountPaid,
            remainingBalance,
            holdReason,
            newPaymentAmount
        });

        await logAction(session.user.id, "NOTIFY_PAYMENT", id, {
            customerEmail: finalShipment.customerEmail,
            holdBaseCharge,
            dailyFee,
            daysElapsed,
            totalStorageAccrued,
            totalDue,
            amountPaid,
            remainingBalance
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Notify payment error:", err);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

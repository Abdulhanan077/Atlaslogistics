import prisma from "@/lib/prisma";
import Link from "next/link";
import { Package, ArrowLeft } from "lucide-react";
import PaymentPageClient from "./components/PaymentPageClient";

async function getShipmentAndSettings(trackingNumber: string) {
    const normalizedTracking = trackingNumber.toUpperCase().replace(/-/g, '');
    const legacyTracking = normalizedTracking.startsWith('TRK') ? normalizedTracking.replace('TRK', 'TRK-') : normalizedTracking;

    const shipment = await prisma.shipment.findFirst({
        where: {
            OR: [
                { trackingNumber: normalizedTracking },
                { trackingNumber: legacyTracking }
            ],
            isDeleted: false
        },
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

    const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });

    return { shipment, settings };
}

export default async function PaymentPage({ params }: { params: Promise<{ number: string }> }) {
    const { number } = await params;
    const { shipment, settings } = await getShipmentAndSettings(number);

    if (!shipment) {
        return (
            <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col items-center justify-center p-6 text-center">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="relative z-10 bg-white border border-slate-200 p-12 rounded-3xl shadow-xl max-w-md w-full">
                    <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-slate-100">
                        <Package className="w-10 h-10 text-slate-400" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Not Found</h1>
                    <p className="text-slate-500 mb-8 leading-relaxed">
                        We couldn't locate a shipment with tracking ID: <br />
                        <span className="text-slate-900 font-mono bg-slate-100 border border-slate-200 px-2 py-1 rounded mt-2 inline-block tracking-widest">{number}</span>
                    </p>
                    <Link href="/" className="inline-flex items-center justify-center w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                        Back to Search
                    </Link>
                </div>
            </div>
        );
    }

    // Verify if shipment is strictly ON_HOLD to permit payment access
    if (shipment.status !== 'ON_HOLD') {
        return (
            <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col items-center justify-center p-6 text-center">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="relative z-10 bg-white border border-slate-200 p-12 rounded-3xl shadow-xl max-w-md w-full">
                    <div className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-amber-100">
                        <Package className="w-10 h-10 text-amber-500" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Payment Not Required</h1>
                    <p className="text-slate-500 mb-8 leading-relaxed">
                        Shipment <span className="font-bold text-slate-900">{shipment.trackingNumber}</span> is currently in <span className="font-semibold text-slate-900">{shipment.status.replace(/_/g, ' ')}</span> status and does not require immediate hold storage fee payments.
                    </p>
                    <Link href={`/track/${shipment.trackingNumber}`} className="inline-flex items-center justify-center w-full px-6 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tracking Page
                    </Link>
                </div>
            </div>
        );
    }

    // Calculate accrued and due balances
    const activeHoldEvent = shipment.events.find((e: any) => e.status === 'ON_HOLD');
    const holdStart = activeHoldEvent ? new Date(activeHoldEvent.timestamp) : new Date(shipment.createdAt);
    const now = new Date();
    const diffTime = Math.max(0, now.getTime() - holdStart.getTime());
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const dailyFee = activeHoldEvent?.holdFee || shipment.holdFee || 0;
    const totalAccumulatedFee = diffDays * dailyFee;
    const holdBaseCharge = shipment.holdBaseCharge || 0;
    const holdPaid = shipment.holdPaid || 0;
    const totalDue = holdBaseCharge + totalAccumulatedFee;
    const remainingBalance = totalDue - holdPaid;

    const plainSettings = settings ? {
        companyName: settings.companyName,
        supportEmail: settings.supportEmail,
        supportPhone: settings.supportPhone,
        usdtTrc20Address: settings.usdtTrc20Address,
        usdtTrc20Enabled: settings.usdtTrc20Enabled,
        usdtBep20Address: settings.usdtBep20Address,
        usdtBep20Enabled: settings.usdtBep20Enabled,
        btcAddress: settings.btcAddress,
        btcEnabled: settings.btcEnabled,
        logoUrl: settings.logoUrl,
        paypalEmail: settings.paypalEmail,
        paypalEnabled: settings.paypalEnabled,
        paypalName: settings.paypalName,
        cashappTag: settings.cashappTag,
        cashappEnabled: settings.cashappEnabled,
        cashappName: settings.cashappName,
        venmoTag: settings.venmoTag,
        venmoEnabled: settings.venmoEnabled,
        venmoName: settings.venmoName,
        zelleEmail: settings.zelleEmail,
        zelleEnabled: settings.zelleEnabled,
        zelleName: settings.zelleName,
        customCryptoMethods: settings.customCryptoMethods,
        customStandardMethods: settings.customStandardMethods
    } : null;

    const plainShipment = {
        id: shipment.id,
        trackingNumber: shipment.trackingNumber,
        origin: shipment.origin || "",
        destination: shipment.destination || "",
        status: shipment.status,
        holdFee: dailyFee,
        holdBaseCharge: holdBaseCharge,
        holdPaid: holdPaid,
        diffDays: diffDays,
        totalAccumulatedFee: totalAccumulatedFee,
        totalDue: totalDue,
        remainingBalance: remainingBalance,
        holdReason: activeHoldEvent?.holdReason || shipment.holdReason || ""
    };

    return (
        <PaymentPageClient 
            shipment={plainShipment}
            settings={plainSettings}
        />
    );
}

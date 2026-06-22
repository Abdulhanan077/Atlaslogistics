import prisma from "@/lib/prisma"

import Link from "next/link"
import { MapPin, Package, Clock, ArrowLeft, Building2, Calendar, Truck, CheckCircle2, Navigation, Download, ShieldCheck, AlertTriangle, Coins } from "lucide-react"
import TrackingMapWrapper from '@/components/TrackingMapWrapper';
import TrackingChat from "@/components/TrackingChat";
import PayFeesButton from "@/components/PayFeesButton";
import FormattedDate from "@/components/FormattedDate";
import { parseShipmentInfo } from '@/lib/utils';

async function getShipment(trackingNumber: string) {
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
            admin: { select: { name: true, email: true } },
            events: {
                where: { isDeleted: false },
                orderBy: [
                    { timestamp: 'desc' },
                    { createdAt: 'desc' }
                ]
            }
        }
    });

    if (!shipment) return null;

    let parsedImageUrls = [];
    let parsedVideoUrls = [];
    try {
        const rawImageUrl = (shipment as any).imageUrls;
        parsedImageUrls = rawImageUrl ? JSON.parse(rawImageUrl) : [];
        if (!Array.isArray(parsedImageUrls)) parsedImageUrls = [];

        const rawVideoUrl = (shipment as any).videoUrls;
        parsedVideoUrls = rawVideoUrl ? JSON.parse(rawVideoUrl) : [];
        if (!Array.isArray(parsedVideoUrls)) parsedVideoUrls = [];
    } catch (e) {
        console.error("Failed to parse media URLs", e);
    }

    const sortedEvents = [...shipment.events].sort((a, b) => {
        if (a.status === 'CREATED' && b.status !== 'CREATED') return 1;
        if (a.status !== 'CREATED' && b.status === 'CREATED') return -1;

        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        if (timeB !== timeA) return timeB - timeA;

        const createdA = new Date(a.createdAt).getTime();
        const createdB = new Date(b.createdAt).getTime();
        return createdB - createdA;
    });

    const plainShipment = JSON.parse(JSON.stringify(shipment));

    return {
        ...plainShipment,
        events: sortedEvents,
        imageUrls: parsedImageUrls,
        videoUrls: parsedVideoUrls,
        parsedSender: parseShipmentInfo(shipment.senderInfo),
        parsedReceiver: parseShipmentInfo(shipment.receiverInfo)
    };
}

function getStatusProgress(status: string) {
    switch (status) {
        case 'CREATED': return 5;
        case 'PENDING': return 15;
        case 'ON_HOLD': return 30;
        case 'IN_TRANSIT': return 60;
        case 'OUT_FOR_DELIVERY': return 85;
        case 'DELIVERED': return 100;
        case 'RETURNED': return 100;
        default: return 0;
    }
}

function getStatusColor(status: string) {
    switch (status) {
        case 'CREATED': return 'text-amber-600';
        case 'PENDING': return 'text-indigo-600';
        case 'IN_TRANSIT': return 'text-blue-600';
        case 'ON_HOLD': return 'text-orange-600';
        case 'OUT_FOR_DELIVERY': return 'text-fuchsia-600';
        case 'DELIVERED': return 'text-emerald-600';
        case 'RETURNED': return 'text-rose-600';
        default: return 'text-slate-600';
    }
}

function getStatusBg(status: string) {
    switch (status) {
        case 'CREATED': return 'bg-amber-50 border-amber-100';
        case 'PENDING': return 'bg-indigo-50 border-indigo-100';
        case 'IN_TRANSIT': return 'bg-blue-50 border-blue-100';
        case 'ON_HOLD': return 'bg-orange-50 border-orange-100';
        case 'OUT_FOR_DELIVERY': return 'bg-fuchsia-50 border-fuchsia-100';
        case 'DELIVERED': return 'bg-emerald-50 border-emerald-100';
        case 'RETURNED': return 'bg-rose-50 border-rose-100';
        default: return 'bg-slate-50 border-slate-100';
    }
}

function getTimelineDotColor(status: string) {
    switch (status) {
        case 'CREATED': return 'bg-amber-500 border-amber-200 ring-4 ring-amber-50';
        case 'PENDING': return 'bg-indigo-500 border-indigo-200 ring-4 ring-indigo-50';
        case 'IN_TRANSIT': return 'bg-blue-500 border-blue-200 ring-4 ring-blue-50';
        case 'ON_HOLD': return 'bg-orange-500 border-orange-200 ring-4 ring-orange-50';
        case 'OUT_FOR_DELIVERY': return 'bg-fuchsia-500 border-fuchsia-200 ring-4 ring-fuchsia-50';
        case 'DELIVERED': return 'bg-emerald-500 border-emerald-200 ring-4 ring-emerald-50';
        case 'RETURNED': return 'bg-rose-500 border-rose-200 ring-4 ring-rose-50';
        default: return 'bg-slate-500 border-slate-200 ring-4 ring-slate-50';
    }
}

function getPingColor(status: string) {
    switch (status) {
        case 'CREATED': return 'bg-amber-400';
        case 'PENDING': return 'bg-indigo-400';
        case 'IN_TRANSIT': return 'bg-blue-400';
        case 'ON_HOLD': return 'bg-orange-400';
        case 'OUT_FOR_DELIVERY': return 'bg-fuchsia-400';
        case 'DELIVERED': return 'bg-emerald-400';
        case 'RETURNED': return 'bg-rose-400';
        default: return 'bg-slate-400';
    }
}

function generateConsignmentRef(origin: string | null | undefined, destination: string | null | undefined, trackingNumber: string): string {
    const getCountryCode = (locationStr: string | null | undefined): string => {
        if (!locationStr) return 'XX';
        const s = locationStr.toUpperCase();
        
        // Match standard country abbreviations in parentheses: (US), (UK), (GH), (ACC), etc.
        const parenMatch = s.match(/\(([^)]+)\)/);
        if (parenMatch) {
            const code = parenMatch[1].trim();
            if (code.length === 2) return code;
            if (code === 'ACC') return 'GH';
            if (code === 'USA') return 'US';
            if (code === 'UK') return 'UK';
        }
        
        // Common matches
        if (s.includes('GHANA')) return 'GH';
        if (s.includes('UNITED STATES') || s.includes('USA') || s.includes('AMERICA')) return 'US';
        if (s.includes('UNITED KINGDOM') || s.includes('UK') || s.includes('GREAT BRITAIN')) return 'UK';
        if (s.includes('CANADA')) return 'CA';
        if (s.includes('GERMANY')) return 'DE';
        if (s.includes('FRANCE')) return 'FR';
        if (s.includes('CHINA')) return 'CN';
        if (s.includes('SPAIN')) return 'ES';
        if (s.includes('ITALY')) return 'IT';
        if (s.includes('TURKEY')) return 'TR';
        if (s.includes('NIGERIA')) return 'NG';
        if (s.includes('SOUTH AFRICA')) return 'ZA';
        if (s.includes('UNITED ARAB EMIRATES') || s.includes('UAE')) return 'AE';
        if (s.includes('SINGAPORE')) return 'SG';
        if (s.includes('AUSTRALIA')) return 'AU';
        
        // Fallback: search for last word or comma separated parts
        const parts = s.split(',');
        const lastPart = parts[parts.length - 1].trim().replace(/[^A-Z]/g, '');
        if (lastPart.length >= 2) {
            return lastPart.substring(0, 2);
        }
        
        const firstTwoLetters = s.replace(/[^A-Z]/g, '').substring(0, 2);
        return firstTwoLetters.length === 2 ? firstTwoLetters : 'XX';
    };

    const originCode = getCountryCode(origin);
    const destCode = getCountryCode(destination);
    
    // Deterministic 2-digit number from trackingNumber
    let charSum = 0;
    const cleanTrack = trackingNumber || '33';
    for (let i = 0; i < cleanTrack.length; i++) {
        charSum += cleanTrack.charCodeAt(i);
    }
    const numCode = (charSum % 90).toString().padStart(2, '0');

    return `${originCode}-${destCode}-${numCode}-SCM`;
}

export default async function TrackingResultPage({ params }: { params: Promise<{ number: string }> }) {
    const { number } = await params;
    const shipment: any = await getShipment(number);
    const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
    const plainSettings = settings ? {
        companyName: settings.companyName,
        usdtTrc20Address: settings.usdtTrc20Address,
        usdtBep20Address: settings.usdtBep20Address,
        btcAddress: settings.btcAddress,
        supportEmail: settings.supportEmail,
        supportPhone: settings.supportPhone,
    } : null;

    if (!shipment) {
        return (
            <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col items-center justify-center p-6 text-center">
                {/* Background effects */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="relative z-10 bg-white border border-slate-200 backdrop-blur-3xl p-12 rounded-3xl shadow-xl max-w-md w-full">
                    <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-slate-100">
                        <Package className="w-10 h-10 text-slate-400" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Not Found</h1>
                    <p className="text-slate-500 mb-8 leading-relaxed">We couldn't locate a shipment with tracking ID: <br /><span className="text-slate-900 font-mono bg-slate-100 border border-slate-200 px-2 py-1 rounded mt-2 inline-block tracking-widest">{number}</span></p>
                    <Link href="/" className="inline-flex items-center justify-center w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]">
                        Track Another Shipment
                    </Link>
                </div>
            </div>
        );
    }

    const allProgress = shipment.events.map((e: any) => getStatusProgress(e.status));
    const currentStatusProgress = getStatusProgress(shipment.status);
    const progress = Math.max(...allProgress, currentStatusProgress, 0);
    const latestLocation = shipment.events.find((e: any) => e.latitude && e.longitude);
    const mapLat = Number(latestLocation?.latitude) || Number(shipment.parsedSender.originLat) || 0;
    const mapLng = Number(latestLocation?.longitude) || Number(shipment.parsedSender.originLng) || 0;
    const mapLocName = latestLocation?.location || shipment.origin || 'Origin';
    const hasCoordinates = !!(latestLocation || shipment.parsedSender.originLat || shipment.parsedReceiver.destLat);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-600 relative overflow-x-hidden selection:bg-blue-500/30 font-sans">
            {/* Ultra-modern ambient background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[150px] mix-blend-multiply animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[150px] mix-blend-multiply animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            {/* Navigation Header */}
            <nav className="relative z-20 w-full border-b border-slate-200 bg-white/80 backdrop-blur-xl shadow-sm">
                <div className="max-w-[1400px] mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
                    <Link href="/" className="group flex items-center text-slate-500 hover:text-blue-600 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mr-3 group-hover:bg-slate-100 transition-colors border border-slate-200">
                            <ArrowLeft className="w-5 h-5" />
                        </div>
                        <span className="font-medium tracking-wide">Back to Search</span>
                    </Link>
                    <div className="flex items-center gap-3 text-right">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <div className="hidden sm:block">
                            <p className="text-slate-900 font-bold text-sm tracking-wide">{settings?.companyName || 'Atlas Logistics'}</p>
                            <p className="text-slate-500 text-xs">Official Tracking Portal</p>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 max-w-[1400px] mx-auto px-4 lg:px-8 py-8 lg:py-12 space-y-8">

                {/* Hold / Outstanding Fee Warning Banner */}
                {((shipment.holdFee && shipment.holdFee > 0) || shipment.status === 'ON_HOLD') && !shipment.holdHidden && (() => {
                    const activeHoldEvent = shipment.events.find((e: any) => e.status === 'ON_HOLD');
                    const holdStart = activeHoldEvent ? new Date(activeHoldEvent.timestamp) : new Date(shipment.createdAt);
                    const now = new Date();
                    const diffTime = Math.max(0, now.getTime() - holdStart.getTime());
                    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
                    const dailyFee = activeHoldEvent?.holdFee || shipment.holdFee || 0;
                    const totalAccumulatedFee = diffDays * dailyFee;
                    const holdReason = activeHoldEvent?.holdReason || shipment.holdReason || "";
                    
                    const holdBaseCharge = shipment.holdBaseCharge || 0;
                    const holdPaid = shipment.holdPaid || 0;
                    const totalDue = holdBaseCharge + totalAccumulatedFee;
                    const remainingBalance = totalDue - holdPaid;

                    return (
                        <div className="relative z-10 overflow-hidden rounded-[2rem] border-2 border-[#ea580c] bg-[#fff7ed] p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            {/* Glow effect */}
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#ea580c]/5 blur-[50px] rounded-full pointer-events-none" />
                            
                            <div className="flex gap-4 items-start flex-1 w-full">
                                <div className="space-y-3 w-full">
                                    <h2 className="text-xl font-black text-[#c2410c] tracking-tight flex items-center gap-2">
                                        ⚠️ ACTION REQUIRED: PACKAGE ON HOLD
                                    </h2>
                                    <p className="text-[#7c2d12] text-sm leading-relaxed max-w-2xl">
                                        Your package is currently on hold. Please note that a daily storage charge of <span className="font-bold">${dailyFee}</span> will be applied for each day the package remains on hold.
                                    </p>
                                    {holdReason && (
                                        <div className="border border-dashed border-[#ea580c] rounded-xl p-4 bg-orange-50/50 text-[#7c2d12] text-xs">
                                            <span className="font-bold block mb-1">Reason:</span>
                                            {holdReason}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {shipment.status === 'ON_HOLD' ? (
                                <div className="shrink-0 w-full md:w-80 flex flex-col items-stretch gap-4 bg-white/70 backdrop-blur-md border border-[#ea580c]/30 p-5 rounded-2xl shadow-sm">
                                    <div className="text-left space-y-2">
                                        <p className="text-xs font-bold text-[#c2410c] uppercase tracking-widest border-b border-[#ea580c]/20 pb-2">
                                            Hold Payment Ledger
                                        </p>
                                        <div className="space-y-1.5 text-xs text-[#7c2d12]">
                                            <div className="flex justify-between">
                                                <span className="opacity-80">Base Hold Charge:</span>
                                                <span className="font-semibold text-slate-900">${holdBaseCharge.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="opacity-80">Daily Storage Rate:</span>
                                                <span className="font-semibold text-slate-900">${dailyFee.toFixed(2)} / day</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="opacity-80">Days Elapsed:</span>
                                                <span className="font-semibold text-slate-900">{diffDays} {diffDays === 1 ? 'day' : 'days'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="opacity-80">Storage Accrued:</span>
                                                <span className="font-semibold text-slate-900">+${totalAccumulatedFee.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between font-bold border-t border-dashed border-[#ea580c]/20 pt-1.5 mt-1 text-slate-900">
                                                <span>Total Amount Due:</span>
                                                <span>${totalDue.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-emerald-800 font-semibold">
                                                <span>Amount Paid:</span>
                                                <span>-${holdPaid.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between font-black border-t border-[#ea580c]/30 pt-2 mt-1 text-sm text-slate-900">
                                                <span className="text-[#c2410c]">Remaining Balance:</span>
                                                <span className="text-[#ea580c]">${remainingBalance.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <PayFeesButton trackingNumber={shipment.trackingNumber} />
                                </div>
                            ) : shipment.holdFee && shipment.holdFee > 0 ? (
                                <div className="shrink-0 w-full md:w-80 flex flex-col items-stretch gap-4 bg-white/70 backdrop-blur-md border border-[#ea580c]/30 p-5 rounded-2xl shadow-sm">
                                    <div className="text-left space-y-2">
                                        <p className="text-xs font-bold text-[#c2410c] uppercase tracking-widest border-b border-[#ea580c]/20 pb-2">
                                            Hold Payment Ledger
                                        </p>
                                        <div className="space-y-1.5 text-xs text-[#7c2d12]">
                                            <div className="flex justify-between">
                                                <span className="opacity-80">Base Hold Charge:</span>
                                                <span className="font-semibold text-slate-900">${holdBaseCharge.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between font-bold border-t border-dashed border-[#ea580c]/20 pt-1.5 mt-1 text-slate-900">
                                                <span>Total Amount Due:</span>
                                                <span>${holdBaseCharge.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-emerald-800 font-semibold">
                                                <span>Amount Paid:</span>
                                                <span>-${holdPaid.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between font-black border-t border-[#ea580c]/30 pt-2 mt-1 text-sm text-slate-900">
                                                <span className="text-[#c2410c]">Remaining Balance:</span>
                                                <span className="text-[#ea580c]">${(holdBaseCharge - holdPaid).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="shrink-0 w-full md:w-auto bg-white/45 backdrop-blur-md border border-[#ea580c]/30 p-4 rounded-2xl text-center md:text-right">
                                    <p className="text-xs font-bold text-[#c2410c] uppercase tracking-widest">Status</p>
                                    <p className="text-lg font-black text-[#c2410c] tracking-tight mt-0.5 uppercase">AWAITING RESOLUTION</p>
                                </div>
                            )}
                        </div>
                    );
                })()}

                {/* Hero Tracking Card */}
                <div className="bg-white backdrop-blur-2xl border border-slate-200 rounded-[2rem] p-6 lg:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none" />

                    <div className="flex flex-col xl:flex-row justify-between gap-10">
                        {/* Left: Tracking Number & Status */}
                        <div className="flex-1 space-y-8">
                            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                                <div>
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-500 text-xs font-semibold uppercase tracking-widest mb-4">
                                        <Navigation className="w-3.5 h-3.5 text-blue-500" />
                                        Tracking ID
                                    </div>
                                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter break-all">
                                        {shipment.trackingNumber}
                                    </h1>
                                </div>

                                <div className="flex sm:flex-col gap-3 shrink-0 lg:min-w-[200px]">
                                    {/* CSS Simulated Barcode */}
                                    <div className="flex h-12 bg-slate-50 rounded items-center justify-center px-4 overflow-hidden border border-slate-200" title="Digital Scan Code">
                                        <div className="w-1 shrink-0 h-full bg-slate-800 mx-[1px] opacity-90"></div>
                                        <div className="w-2 shrink-0 h-full bg-slate-800 mx-[1px] opacity-90"></div>
                                        <div className="w-1 shrink-0 h-full bg-slate-800 mx-[2px] opacity-90"></div>
                                        <div className="w-3 shrink-0 h-full bg-slate-800 mx-[1px] opacity-90"></div>
                                        <div className="w-1 shrink-0 h-full bg-slate-800 mx-[1px] opacity-90"></div>
                                        <div className="w-2 shrink-0 h-full bg-slate-800 mx-[2px] opacity-90"></div>
                                        <div className="w-1 shrink-0 h-full bg-slate-800 mx-[1px] opacity-90"></div>
                                        <div className="w-4 shrink-0 h-full bg-slate-800 mx-[1px] opacity-90"></div>
                                        <div className="w-1 shrink-0 h-full bg-slate-800 mx-[2px] opacity-90"></div>
                                        <div className="w-2 shrink-0 h-full bg-slate-800 mx-[1px] opacity-90"></div>
                                        <div className="w-1 shrink-0 h-full bg-slate-800 mx-[1px] opacity-90"></div>
                                    </div>

                                    <a href={`/api/shipments/${shipment.id}/label`} download className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 font-bold transition-all hover:scale-105 shadow-sm">
                                        <Download className="w-4 h-4" />
                                        Download Waybill
                                    </a>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className={`p-5 rounded-2xl border backdrop-blur-md ${getStatusBg(shipment.status)}`}>
                                    <p className="text-xs uppercase tracking-widest font-bold opacity-70 mb-1 text-slate-600">Current Status</p>
                                    <p className={`text-2xl font-black tracking-tight ${getStatusColor(shipment.status)}`}>
                                        {shipment.status.replace(/_/g, ' ')}
                                    </p>
                                </div>

                                {shipment.estimatedDelivery && (
                                    <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 backdrop-blur-md">
                                        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Est. Delivery</p>
                                        <p className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                            <Calendar className="w-5 h-5 text-blue-500" />
                                            <FormattedDate date={shipment.estimatedDelivery} mode="date" />
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Ultra-modern Progress Bar */}
                            <div className="pt-4">
                                <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                                    <span>Created</span>
                                    <span>Delivered</span>
                                </div>
                                <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200">
                                    <div
                                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 rounded-full shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-all duration-1000 ease-out"
                                        style={{
                                            width: `${progress}%`,
                                            backgroundSize: '200% 100%',
                                            animation: 'gradientMove 3s linear infinite'
                                        }}
                                    />
                                </div>
                                <style dangerouslySetInnerHTML={{
                                    __html: `
                                    @keyframes gradientMove {
                                        0% { background-position: 100% 0; }
                                        100% { background-position: -100% 0; }
                                    }
                                `}} />
                            </div>
                        </div>

                        {/* Right: Origin / Dest Connectors */}
                        <div className="xl:w-1/3 flex flex-col justify-center gap-6 relative">
                            {/* Vertical connecting line */}
                            <div className="absolute left-[2.25rem] top-[4rem] bottom-[4rem] w-[2px] bg-gradient-to-b from-blue-300 via-slate-300 to-emerald-300 hidden md:block" />

                            <div className="relative flex items-center gap-6 group cursor-default">
                                <div className="w-[4.5rem] h-[4.5rem] rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 group-hover:bg-blue-100 transition-all duration-300">
                                    <Package className="w-8 h-8 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-blue-600 font-bold uppercase tracking-widest mb-1">Origin</p>
                                    <p className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{shipment.origin}</p>
                                    {shipment.parsedSender.name && <p className="text-sm text-slate-500 mt-1">{shipment.parsedSender.name}</p>}
                                </div>
                            </div>

                            <div className="relative flex items-center gap-6 group cursor-default">
                                <div className="w-[4.5rem] h-[4.5rem] rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 group-hover:bg-emerald-100 transition-all duration-300">
                                    <MapPin className="w-8 h-8 text-emerald-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-emerald-600 font-bold uppercase tracking-widest mb-1">Destination</p>
                                    <p className="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{shipment.destination}</p>
                                    {shipment.parsedReceiver.name && <p className="text-sm text-slate-500 mt-1">{shipment.parsedReceiver.name}</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Map & Timeline Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

                    {/* Left: Map & Media */}
                    <div className="xl:col-span-7 space-y-8">
                        {hasCoordinates && (
                            <div className="bg-white backdrop-blur-xl border border-slate-200 rounded-[2rem] p-2 shadow-xl relative overflow-hidden h-[500px]">
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent z-10 pointer-events-none" />
                                <div className="absolute bottom-6 left-6 z-20">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 text-slate-900 font-bold shadow-lg">
                                        <span className="relative flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                                        </span>
                                        {latestLocation ? 'Live GPS Tracking' : 'Route Visualization'}
                                    </div>
                                </div>
                                <div className="w-full h-full rounded-[1.5rem] overflow-hidden">
                                    <TrackingMapWrapper
                                        lat={mapLat}
                                        lng={mapLng}
                                        locationName={mapLocName}
                                        events={shipment.events}
                                        vehicleType={shipment.parsedSender.vehicleType}
                                        originLat={shipment.parsedSender.originLat}
                                        originLng={shipment.parsedSender.originLng}
                                        destLat={shipment.parsedReceiver.destLat}
                                        destLng={shipment.parsedReceiver.destLng}
                                        destinationName={shipment.destination}
                                        destinationAddress={shipment.parsedReceiver.address}
                                        showToggle={false}
                                        isRouteVisible={shipment.showRoute}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Product / Media Gallery */}
                        {shipment && (() => {
                            const consignmentRef = generateConsignmentRef(shipment.origin, shipment.destination, shipment.trackingNumber);
                            return (
                                <div className="bg-white backdrop-blur-xl border border-slate-200 rounded-[2rem] p-8 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                                    <h3 className="text-xl font-black text-slate-900 flex items-center mb-6 uppercase tracking-tight">
                                        <ShieldCheck className="w-6 h-6 mr-3 text-blue-500" />
                                        Product Details
                                    </h3>

                                    <div className="mb-6">
                                        <p className="text-sm text-slate-500 font-medium">Description</p>
                                        <p className="text-base font-bold text-black mt-0.5" style={{ fontFamily: "'Times New Roman', Times, serif" }}>Shipment Summary — {settings?.companyName || 'Atlas Logistics'}</p>
                                    </div>

                                    {/* Product Details Table */}
                                    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm divide-y divide-slate-200 mb-8">
                                        <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
                                            <div className="w-full sm:w-1/3 bg-slate-50/50 px-6 py-4 text-sm font-bold text-slate-900 flex items-center">
                                                Consignment Reference
                                            </div>
                                            <div className="w-full sm:w-2/3 px-6 py-4 text-sm text-black font-mono font-bold break-all flex items-center uppercase">
                                                {consignmentRef}
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
                                            <div className="w-full sm:w-1/3 bg-slate-50/50 px-6 py-4 text-sm font-bold text-slate-900 flex items-center">
                                                Tracking Number
                                            </div>
                                            <div className="w-full sm:w-2/3 px-6 py-4 text-sm text-black font-mono font-bold break-all flex items-center uppercase">
                                                {shipment.trackingNumber}
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
                                            <div className="w-full sm:w-1/3 bg-slate-50/50 px-6 py-4 text-sm font-bold text-slate-900 flex items-center">
                                                Carrier
                                            </div>
                                            <div className="w-full sm:w-2/3 px-6 py-4 text-sm text-black font-bold flex items-center uppercase">
                                                {settings?.companyName || 'Atlas Logistics'}
                                            </div>
                                        </div>
                                        {shipment.parsedSender.vehicleType && shipment.parsedSender.vehicleType !== 'NONE' && (
                                            <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
                                                <div className="w-full sm:w-1/3 bg-slate-50/50 px-6 py-4 text-sm font-bold text-slate-900 flex items-center">
                                                    Transit Mode
                                                </div>
                                                <div className="w-full sm:w-2/3 px-6 py-4 text-sm text-black font-bold flex items-center uppercase">
                                                    {(() => {
                                                        const vt = shipment.parsedSender.vehicleType;
                                                        if (vt === 'TRUCK') return '🚚 TRUCK';
                                                        if (vt === 'SHIP') return '🚢 SHIP';
                                                        if (vt === 'PLANE') return '✈️ AIRPLANE';
                                                        if (vt === 'VAN') return '🚐 VAN';
                                                        if (vt === 'TRAIN') return '🚆 TRAIN';
                                                        return vt;
                                                    })()}
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
                                            <div className="w-full sm:w-1/3 bg-slate-50/50 px-6 py-4 text-sm font-bold text-slate-900 flex items-center">
                                                Origin Hub
                                            </div>
                                            <div className="w-full sm:w-2/3 px-6 py-4 text-sm text-black font-bold flex items-center uppercase">
                                                {shipment.origin || 'N/A'}
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
                                            <div className="w-full sm:w-1/3 bg-slate-50/50 px-6 py-4 text-sm font-bold text-slate-900 flex items-center">
                                                Destination Hub
                                            </div>
                                            <div className="w-full sm:w-2/3 px-6 py-4 text-sm text-black font-bold flex items-center uppercase">
                                                {shipment.destination || 'N/A'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Shipping Description */}
                                    {shipment.productDescription && (
                                        <div className="mb-8">
                                            <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-4">Shipping Description</p>
                                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                                <p className="text-black leading-relaxed text-lg whitespace-pre-wrap" style={{ fontFamily: "'Times New Roman', Times, serif" }}>{shipment.productDescription}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Recipient Information Section */}
                                    <div className="mb-4 mt-8">
                                        <p className="text-base font-bold text-black flex items-center gap-2" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                                            📦 Recipient Information (Final Delivery Point – {shipment.destination || 'Destination'})
                                        </p>
                                    </div>

                                    {/* Recipient Info Table */}
                                    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm divide-y divide-slate-200 mb-8">
                                        <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
                                            <div className="w-full sm:w-1/3 bg-slate-50/50 px-6 py-4 text-sm font-bold text-slate-900 flex items-center">
                                                Name
                                            </div>
                                            <div className="w-full sm:w-2/3 px-6 py-4 text-sm text-black font-bold flex items-center uppercase">
                                                {shipment.parsedReceiver.name || 'N/A'}
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
                                            <div className="w-full sm:w-1/3 bg-slate-50/50 px-6 py-4 text-sm font-bold text-slate-900 flex items-center">
                                                Address
                                            </div>
                                            <div className="w-full sm:w-2/3 px-6 py-4 text-sm text-black font-bold flex items-center uppercase">
                                                {shipment.parsedReceiver.address || 'N/A'}
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
                                            <div className="w-full sm:w-1/3 bg-slate-50/50 px-6 py-4 text-sm font-bold text-slate-900 flex items-center">
                                                Contact
                                            </div>
                                            <div className="w-full sm:w-2/3 px-6 py-4 text-sm text-black font-bold flex items-center uppercase">
                                                {shipment.parsedReceiver.phone || 'N/A'}
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
                                            <div className="w-full sm:w-1/3 bg-slate-50/50 px-6 py-4 text-sm font-bold text-slate-900 flex items-center">
                                                Email
                                            </div>
                                            <div className="w-full sm:w-2/3 px-6 py-4 text-sm text-black font-bold flex items-center break-all">
                                                {shipment.customerEmail || shipment.parsedReceiver.email || 'N/A'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Media Gallery */}
                                    {shipment.imageUrls && shipment.imageUrls.length > 0 && (
                                        <div className="mb-8">
                                            <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-4">Attached Images</p>
                                            <div className="grid grid-cols-2 gap-3 sm:gap-6">
                                                {shipment.imageUrls.map((url: string, index: number) => (
                                                    <a
                                                        key={index}
                                                        href={url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-full relative rounded-2xl overflow-hidden border border-slate-200 hover:border-blue-300 transition-all group aspect-video shadow-sm"
                                                    >
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img src={url} alt={`Proof ${index}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                                                            <span className="text-white text-sm font-medium tracking-wide">Secure Asset Viewer — Parcel Item #{index + 1}</span>
                                                        </div>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {shipment.videoUrls && shipment.videoUrls.length > 0 && (
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-4">Attached Videos</p>
                                            <div className="grid grid-cols-1 gap-6">
                                                {shipment.videoUrls.map((url: string, index: number) => (
                                                    <div key={index} className="w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 shadow-md relative">
                                                        <video src={url} controls controlsList="nodownload" className="w-full h-full object-contain" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </div>

                    {/* Right: Activity Log */}
                    <div className="xl:col-span-5">
                        <div className="bg-white backdrop-blur-xl border border-slate-200 rounded-[2rem] p-8 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sticky top-8">
                            <h3 className="text-xl font-bold text-slate-900 flex items-center mb-8">
                                <Clock className="w-6 h-6 mr-3 text-blue-500" />
                                Activity Timeline
                            </h3>

                            <div className="relative pl-6 space-y-8 before:absolute before:left-[11px] before:top-4 before:bottom-4 before:w-[2px] before:bg-gradient-to-b before:from-blue-400 before:via-slate-200 before:to-transparent">
                                {shipment.events.map((event: any, index: number) => {
                                    const isLatest = index === 0;
                                    const showWarningBox = event.status === 'ON_HOLD' && !shipment.holdHidden && isLatest;
                                    const dailyFee = event.holdFee || shipment.holdFee || 0;
                                    const holdReason = event.holdReason || shipment.holdReason || "";
                                    
                                    return (
                                        <div key={event.id} className="relative group">
                                            {/* Dot */}
                                            <div className="absolute -left-[2.1rem] top-6 w-4 h-4 z-10">
                                                {isLatest && (
                                                    <div className={`absolute inset-0 rounded-full animate-ping opacity-75 ${getPingColor(event.status)}`} />
                                                )}
                                                <div className={`relative w-full h-full rounded-full border-2 transition-transform duration-300 group-hover:scale-125 ${getTimelineDotColor(event.status)}`} />
                                            </div>

                                            <div className={`p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${
                                                showWarningBox 
                                                    ? 'bg-[#fff7ed] border-[#ea580c] border-2 shadow-md' 
                                                    : isLatest 
                                                        ? 'bg-slate-50 border-slate-200 shadow-md' 
                                                        : 'bg-transparent border-transparent hover:bg-slate-50 hover:border-slate-200'
                                            }`}>
                                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 mb-2">
                                                    <p className={`font-bold text-lg tracking-tight ${showWarningBox ? 'text-[#c2410c]' : getStatusColor(event.status)}`}>
                                                        {showWarningBox ? '⚠️ ACTION REQUIRED: PACKAGE ON HOLD' : event.status.replace(/_/g, ' ')}
                                                    </p>
                                                    <span className={`text-sm font-medium whitespace-nowrap ${showWarningBox ? 'text-[#7c2d12]' : 'text-slate-500'}`}>
                                                        <FormattedDate date={event.timestamp} />
                                                    </span>
                                                </div>
                                                <p className={`font-medium mb-2 flex items-center gap-2 ${showWarningBox ? 'text-[#7c2d12]' : 'text-slate-900'}`}>
                                                    <MapPin className={`w-4 h-4 animate-bounce ${showWarningBox ? 'text-[#ea580c]' : getStatusColor(event.status)}`} />
                                                    {event.location || 'Location Pending'}
                                                </p>
                                                {showWarningBox ? (
                                                    <div className="mt-3 space-y-3">
                                                        <p className="text-[#7c2d12] text-sm leading-relaxed">
                                                            Your package is currently on hold. Please note that a daily storage charge of <span className="font-bold">${dailyFee}</span> will be applied for each day the package remains on hold.
                                                        </p>
                                                        {holdReason && (
                                                            <div className="border border-dashed border-[#ea580c] rounded-xl p-3 bg-orange-50/50 text-[#7c2d12] text-xs">
                                                                <span className="font-bold block mb-1">Reason:</span>
                                                                {holdReason}
                                                            </div>
                                                        )}
                                                        {event.description && (
                                                            <p className="text-slate-600 text-sm leading-relaxed bg-white/70 p-3 rounded-xl border border-orange-200 mt-2">
                                                                {event.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    event.description && (
                                                        <p className="text-slate-600 text-sm leading-relaxed bg-slate-100 p-3 rounded-xl border border-slate-200 mt-3">
                                                            {event.description}
                                                        </p>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center text-slate-600 text-sm py-10">
                    <Link href="/login" className="hover:text-slate-400 transition-colors cursor-default" title="System Management">&copy;</Link> {new Date().getFullYear()} {settings?.companyName || 'Atlas Logistics'}. All rights reserved. <br />
                    Powered by advanced logistics tracking.
                </div>
            </main>

            {/* Chat Widget overlay */}
            <TrackingChat shipmentId={shipment.id} />

            <style dangerouslySetInnerHTML={{
                __html: `
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}} />
        </div>
    );
}

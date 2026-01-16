import prisma from "@/lib/prisma"

import Link from "next/link"
import { MapPin, Package, Clock, ArrowLeft, Building2 } from "lucide-react"
import TrackingMapWrapper from '@/components/TrackingMapWrapper';

async function getShipment(trackingNumber: string) {
    return await prisma.shipment.findUnique({
        where: { trackingNumber },
        include: {
            admin: {
                select: { name: true, email: true } // Only expose needed public info
            },
            events: {
                orderBy: { createdAt: 'desc' }
            }
        }
    });
}

function getStatusProgress(status: string) {
    switch (status) {
        case 'PENDING': return 10;
        case 'CREATED': return 10;
        case 'IN_TRANSIT': return 50;
        case 'OUT_FOR_DELIVERY': return 80;
        case 'DELIVERED': return 100;
        case 'RETURNED': return 100;
        default: return 0;
    }
}

function getStatusColor(status: string) {
    switch (status) {
        case 'PENDING': return 'text-yellow-500';
        case 'IN_TRANSIT': return 'text-blue-400';
        case 'PAUSED': return 'text-orange-500';
        case 'OUT_FOR_DELIVERY': return 'text-purple-400';
        case 'DELIVERED': return 'text-emerald-400';
        case 'RETURNED': return 'text-red-500';
        default: return 'text-slate-400';
    }
}

function getTimelineDotColor(status: string) {
    switch (status) {
        case 'PENDING': return 'bg-yellow-500 shadow-[0_0_0_4px_rgba(234,179,8,0.2)]';
        case 'IN_TRANSIT': return 'bg-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.2)]';
        case 'PAUSED': return 'bg-orange-500 shadow-[0_0_0_4px_rgba(249,115,22,0.2)]';
        case 'OUT_FOR_DELIVERY': return 'bg-purple-500 shadow-[0_0_0_4px_rgba(168,85,247,0.2)]';
        case 'DELIVERED': return 'bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.2)]';
        case 'RETURNED': return 'bg-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.2)]';
        default: return 'bg-slate-500 shadow-[0_0_0_4px_rgba(100,116,139,0.2)]';
    }
}

export default async function TrackingResultPage({ params }: { params: Promise<{ number: string }> }) {
    const { number } = await params;
    const shipment = await getShipment(number);

    if (!shipment) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
                <Package className="w-16 h-16 text-slate-700 mb-6" />
                <h1 className="text-2xl font-bold text-white mb-2">Shipment Not Found</h1>
                <p className="text-slate-400 mb-8">We couldn't find a shipment with tracking ID: <span className="text-white font-mono">{number}</span></p>
                <Link href="/" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors">
                    Track Another
                </Link>
            </div>
        );
    }

    const progress = getStatusProgress(shipment.status);
    const latestLocation = shipment.events.find((e: any) => e.latitude && e.longitude);

    return (
        <div className="min-h-screen bg-slate-950 p-6 lg:p-12">
            <div className="max-w-4xl mx-auto space-y-8">
                <Link href="/" className="inline-flex items-center text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Search
                </Link>

                {/* Main Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                    {/* Header with Admin Branding */}
                    <div className="bg-slate-950/50 p-8 border-b border-slate-800 flex flex-col md:flex-row justify-between md:items-center gap-6">
                        <div>
                            <p className="text-slate-400 text-sm font-medium mb-1">Tracking Number</p>
                            <h1 className="text-3xl md:text-4xl font-mono font-bold text-white tracking-tight">{shipment.trackingNumber}</h1>
                        </div>
                        <div className="flex items-center bg-slate-800/50 px-5 py-3 rounded-xl border border-slate-700/50">
                            <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold mr-3">
                                <Building2 className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Service Provider</p>
                                <p className="text-slate-200 font-medium">Atlas Logistics</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-12">
                        {/* Status Bar */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-slate-400 text-sm mb-1">Current Status</p>
                                    <p className={`text-2xl font-bold ${getStatusColor(shipment.status)}`}>{shipment.status.replace('_', ' ')}</p>
                                </div>
                                {shipment.estimatedDelivery && (
                                    <div className="text-right">
                                        <p className="text-slate-400 text-sm mb-1">Estimated Delivery</p>
                                        <p className="text-white font-medium">{new Date(shipment.estimatedDelivery).toLocaleDateString()}</p>
                                    </div>
                                )}
                            </div>

                            <div className="h-4 bg-slate-800 rounded-full overflow-hidden relative">
                                <div
                                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-1000 ease-out rounded-full"
                                    style={{ width: `${progress}%` }}
                                />
                                {/* Stripes animation */}
                                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.1)_50%,rgba(255,255,255,.1)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[progress-bar-stripes_1s_linear_infinite] opacity-30 w-[progress]%" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>

                        {/* Route Map (Visual) */}
                        {latestLocation ? (
                            <div className="w-full mb-8">
                                <h3 className="text-white text-lg font-bold mb-4 flex items-center">
                                    <MapPin className="w-5 h-5 mr-3 text-slate-500" />
                                    Live Location
                                </h3>
                                <TrackingMapWrapper
                                    lat={latestLocation.latitude ?? 0}
                                    lng={latestLocation.longitude ?? 0}
                                    locationName={latestLocation.location || 'Current Location'}
                                />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-800">
                                    <div className="flex items-start mb-4">
                                        <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mr-3 mt-1">
                                            <Package className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-slate-500 text-xs uppercase mb-1">Origin</p>
                                            <p className="text-white text-lg font-semibold">{shipment.origin}</p>
                                            <p className="text-slate-400 text-sm mt-1">{shipment.senderInfo}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-800">
                                    <div className="flex items-start mb-4">
                                        <div className="w-8 h-8 rounded-full bg-green-500/10 text-green-400 flex items-center justify-center mr-3 mt-1">
                                            <MapPin className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-slate-500 text-xs uppercase mb-1">Destination</p>
                                            <p className="text-white text-lg font-semibold">{shipment.destination}</p>
                                            <p className="text-slate-400 text-sm mt-1">{shipment.receiverInfo}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Detailed History */}
                        <div>
                            <h3 className="text-white text-lg font-bold mb-6 flex items-center">
                                <Clock className="w-5 h-5 mr-3 text-slate-500" />
                                Activity Log
                            </h3>
                            <div className="relative pl-4 space-y-8 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                                {shipment.events.map((event: any, index: number) => (
                                    <div key={event.id} className="relative pl-10 group">
                                        <div className={`absolute left-2.5 w-4 h-4 -ml-2 rounded-full border-4 border-slate-900 ${getTimelineDotColor(event.status)
                                            }`}></div>

                                        <div className="bg-slate-800/20 border border-slate-800 p-4 rounded-xl hover:bg-slate-800/40 transition-colors">
                                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-2">
                                                <p className={`font-semibold ${getStatusColor(event.status)}`}>
                                                    {event.status} <span className="text-slate-500 font-normal mx-2">•</span> {event.location || 'Unknown Location'}
                                                </p>
                                                <span className="text-xs text-slate-500 font-mono bg-slate-900 px-2 py-1 rounded-md border border-slate-800">
                                                    {new Date(event.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                                </span>
                                            </div>
                                            {event.description && (
                                                <p className="text-slate-400 text-sm leading-relaxed">{event.description}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center text-slate-500 text-sm">
                    &copy; 2026 Atlas Logistics. All rights reserved.
                </div>
            </div>
        </div>
    );
}

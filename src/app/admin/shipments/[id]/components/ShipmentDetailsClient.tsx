/* eslint-disable */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Printer, MapPin, Loader2, Pencil, X, Check, FileText, Trash2, Mail, Search, RotateCcw, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';
import dynamic from 'next/dynamic';
// PDF components will be loaded dynamically to avoid ESM bundling issues
import ShipmentChat from './ShipmentChat';
import FormattedDate from '@/components/FormattedDate';
import TrackingMapWrapper from '@/components/TrackingMapWrapper';
import { parseShipmentInfo } from '@/lib/utils';
import { geocodeAddress, reverseGeocode } from '@/lib/geocoding';
import { upload } from '@vercel/blob/client';

// PDF rendering is now handled server-side to avoid client-side bundling issues
const ShippingLabel = null;
const DetailsPDF = null;

interface ShipmentEvent {
    id: string;
    status: string;
    location?: string | null;
    description?: string | null;
    timestamp: string | Date;
    latitude?: number | string | null;
    longitude?: number | string | null;
    isDeleted?: boolean;
    holdFee?: number | null;
    holdReason?: string | null;
}

interface Shipment {
    id: string;
    trackingNumber: string;
    createdAt: string | Date;
    estimatedDelivery?: string | Date | null;
    senderInfo: string;
    receiverInfo: string;
    origin?: string | null;
    destination?: string | null;
    customerEmail?: string | null;
    productDescription?: string | null;
    imageUrls?: string[];
    videoUrls?: string[];
    status: string;
    events: ShipmentEvent[];
    showRoute: boolean;
    holdFee?: number | null;
    holdReason?: string | null;
    holdHidden?: boolean;
}

interface ActiveUpload {
    id: string;
    fileName: string;
    progress: number;
    controller: AbortController;
}

interface Settings {
    logoUrl: string;
    companyName: string;
    supportEmail: string;
    supportPhone: string;
}

export default function ShipmentDetailsClient({ shipment, settings }: { shipment: Shipment, settings?: Settings | null }) {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);
    const [updating, setUpdating] = useState(false);
    const [liveVehicleType, setLiveVehicleType] = useState(parseShipmentInfo(shipment.senderInfo).vehicleType || 'TRUCK');
    const [geocoding, setGeocoding] = useState<string | null>(null);
    const [activeUploads, setActiveUploads] = useState<ActiveUpload[]>([]);
    const [overrideHold, setOverrideHold] = useState(false);
    const isLocked = shipment.status === 'ON_HOLD' && !shipment.holdHidden && !overrideHold;

    const cancelUpload = (id: string) => {
        const upload = activeUploads.find(u => u.id === id);
        if (upload) {
            upload.controller.abort();
            setActiveUploads(prev => prev.filter(u => u.id !== id));
            toast.error(`Upload of ${upload.fileName} cancelled`);
        }
    };

    const handleGeocode = async (type: 'event' | 'dest' | 'origin') => {
        const address = type === 'event' ? formData.location : 
                        type === 'origin' ? (editData.origin || editData.senderAddress) : 
                        (editData.destination || editData.receiverAddress);
        if (!address) {
            toast.error("Please enter an address first");
            return;
        }

        setGeocoding(type);
        const result = await geocodeAddress(address);
        setGeocoding(null);

        if (result) {
            const country = result.display_name.split(',').pop()?.trim() || '';
            if (type === 'event') {
                setFormData(prev => ({ ...prev, latitude: result.lat, longitude: result.lon }));
            } else if (type === 'origin') {
                setEditData(prev => ({ 
                    ...prev, 
                    originLat: result.lat, 
                    originLng: result.lon,
                    origin: country || prev.origin 
                }));
            } else {
                setEditData(prev => ({ 
                    ...prev, 
                    destLat: result.lat, 
                    destLng: result.lon,
                    destination: country || prev.destination
                }));
            }
            toast.success("Location found!");
        } else {
            toast.error("Could not find location coordinates");
        }
    };
    
    const handleVehicleChange = async (newVehicle: string) => {
        setLiveVehicleType(newVehicle);
        const toastId = toast.loading("Updating vehicle...");
        try {
            const parsed = parseShipmentInfo(shipment.senderInfo);
            const res = await fetch(`/api/shipments/${shipment.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    senderInfo: JSON.stringify({ ...parsed, vehicleType: newVehicle })
                })
            });
            if (res.ok) {
                toast.success("Vehicle updated!", { id: toastId });
                router.refresh();
            } else {
                toast.error("Failed to update vehicle", { id: toastId });
            }
        } catch (e) {
            toast.error("Error updating vehicle", { id: toastId });
        }
    };

    const activeHoldEvent = shipment.events.find(e => e.status === 'ON_HOLD');

    const [holdPanelFee, setHoldPanelFee] = useState('0');
    const [holdPanelReason, setHoldPanelReason] = useState('');
    const [holdPanelHidden, setHoldPanelHidden] = useState(false);

    useEffect(() => {
        if (activeHoldEvent) {
            setHoldPanelFee(activeHoldEvent.holdFee !== undefined && activeHoldEvent.holdFee !== null ? activeHoldEvent.holdFee.toString() : (shipment.holdFee?.toString() || '0'));
            setHoldPanelReason(activeHoldEvent.holdReason || shipment.holdReason || '');
            setHoldPanelHidden(shipment.holdHidden || false);
        }
    }, [shipment.holdFee, shipment.holdReason, shipment.holdHidden, activeHoldEvent]);

    const [showReleaseForm, setShowReleaseForm] = useState(false);
    const [releaseStatus, setReleaseStatus] = useState('IN_TRANSIT');
    const [releaseLocation, setReleaseLocation] = useState('');
    const [releaseDescription, setReleaseDescription] = useState('Hold cleared. Resuming transit.');

    const handleSaveHoldSettings = async () => {
        if (!activeHoldEvent) return;
        setUpdating(true);
        const toastId = toast.loading("Saving hold settings...");
        try {
            // 1. Update the latest event
            const eventRes = await fetch(`/api/shipments/${shipment.id}/event/${activeHoldEvent.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'ON_HOLD',
                    location: activeHoldEvent.location || '',
                    description: activeHoldEvent.description || '',
                    holdFee: parseFloat(holdPanelFee) || 0,
                    holdReason: holdPanelReason,
                    timestamp: activeHoldEvent.timestamp
                })
            });

            // 2. Update the shipment (including visibility)
            const shipmentRes = await fetch(`/api/shipments/${shipment.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    holdFee: parseFloat(holdPanelFee) || 0,
                    holdReason: holdPanelReason,
                    holdHidden: holdPanelHidden
                })
            });

            if (eventRes.ok && shipmentRes.ok) {
                toast.success("Hold settings updated successfully!", { id: toastId });
                router.refresh();
            } else {
                toast.error("Failed to save settings", { id: toastId });
            }
        } catch (e) {
            console.error(e);
            toast.error("Error saving hold settings", { id: toastId });
        } finally {
            setUpdating(false);
        }
    };

    const handleConfirmClearHold = async () => {
        if (!releaseLocation.trim()) {
            toast.error("Please enter a location for the release event");
            return;
        }

        setUpdating(true);
        const toastId = toast.loading("Clearing hold status...");
        try {
            const res = await fetch(`/api/shipments/${shipment.id}/event`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: releaseStatus,
                    location: releaseLocation,
                    description: releaseDescription,
                    timestamp: new Date().toISOString(),
                    holdFee: 0,
                    holdReason: null
                })
            });

            // Also make sure holdHidden is cleared or reset to false when hold is cleared!
            await fetch(`/api/shipments/${shipment.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    holdHidden: false
                })
            });

            if (res.ok) {
                toast.success("Hold cleared successfully!", { id: toastId });
                setShowReleaseForm(false);
                router.refresh();
            } else {
                toast.error("Failed to clear hold", { id: toastId });
            }
        } catch (e) {
            console.error(e);
            toast.error("Error clearing hold", { id: toastId });
        } finally {
            setUpdating(false);
        }
    };

    const [formData, setFormData] = useState({
        status: 'PENDING',
        location: '',
        description: '',
        latitude: '',
        longitude: '',
        timestamp: '',
        destLat: parseShipmentInfo(shipment.receiverInfo).destLat || '',
        destLng: parseShipmentInfo(shipment.receiverInfo).destLng || '',
        holdFee: '',
        holdReason: ''
    });

    useEffect(() => {
        setFormData(prev => ({ ...prev, timestamp: new Date().toISOString().slice(0, 16) }));
    }, []);

    const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);

    const handleResendEmail = async (eventId: string) => {
        setSendingEmailId(eventId);
        try {
            const res = await fetch(`/api/shipments/${shipment.id}/event/${eventId}/resend`, {
                method: 'POST'
            });

            if (res.ok) {
                toast.success("Email resent successfully");
            } else {
                const error = await res.text();
                toast.error(error || "Failed to resend email");
            }
        } catch (e) {
            console.error(e);
            toast.error("Error resending email");
        } finally {
            setSendingEmailId(null);
        }
    };
    const handleRestoreEvent = async (eventId: string) => {
        if (isLocked) {
            toast.error("Updates are locked. Clear hold, hide it, or override restriction first.");
            return;
        }
        try {
            const res = await fetch(`/api/shipments/${shipment.id}/event/${eventId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isDeleted: false })
            });
            if (res.ok) {
                toast.success('Event restored');
                router.refresh();
            } else {
                toast.error('Failed to restore event');
            }
        } catch (e) {
            console.error(e);
            toast.error('Error restoring event');
        }
    };

    const actuallyDeleteEvent = async (eventId: string, isPermanent = false) => {
        try {
            const url = `/api/shipments/${shipment.id}/event/${eventId}${isPermanent ? '?permanent=true' : ''}`;
            const res = await fetch(url, { method: 'DELETE' });
            if (res.ok) {
                toast.dismiss(); // Clear all toasts
                toast.success(isPermanent ? 'Event permanently deleted' : 'Event deleted', { duration: 3000 });
                router.refresh();
            } else {
                toast.dismiss(); 
                const errorText = await res.text();
                toast.error(`Failed to delete: ${errorText || res.statusText}`, { duration: 5000 });
            }
        } catch (e) {
            console.error(e);
            toast.error('Error deleting event');
        }
    };

    const handleDeleteEvent = (eventId: string, isPermanent = false) => {
        if (isLocked) {
            toast.error("Updates are locked. Clear hold, hide it, or override restriction first.");
            return;
        }
        toast.dismiss(); // Prevent stacking multiple dialogs
        toast((t) => (
            <div className="flex flex-col gap-3 p-1">
                <p className="font-semibold text-sm">{isPermanent ? 'Permanently delete this tracking event? This cannot be undone.' : 'Delete this tracking event?'}</p>
                <div className="flex gap-2 justify-end">
                    <button 
                        onClick={() => toast.dismiss(t.id)}
                        className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={() => {
                            toast.dismiss(t.id);
                            actuallyDeleteEvent(eventId, isPermanent);
                        }}
                        className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white hover:bg-red-500 rounded-lg transition-colors shadow-sm"
                    >
                        {isPermanent ? 'Permanent Delete' : 'Confirm Delete'}
                    </button>
                </div>
            </div>
        ), {
            duration: Infinity, // Keep confirmation visible until action
            position: 'top-center',
            style: {
                background: '#ffffff',
                color: '#1e293b',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
            }
        });
    };

    // Event Edit State
    const [editingEventId, setEditingEventId] = useState<string | null>(null);
    const [editEventData, setEditEventData] = useState({
        status: '',
        location: '',
        description: '',
        timestamp: '',
        latitude: '',
        longitude: '',
        holdFee: '',
        holdReason: ''
    });

    const handleEditEventClick = (event: ShipmentEvent) => {
        setEditingEventId(event.id);
        setEditEventData({
            status: event.status,
            location: event.location || '',
            description: event.description || '',
            timestamp: new Date(event.timestamp).toISOString().slice(0, 16),
            latitude: String(event.latitude || ''),
            longitude: String(event.longitude || ''),
            holdFee: event.holdFee !== undefined && event.holdFee !== null ? String(event.holdFee) : '',
            holdReason: event.holdReason || ''
        });
    };

    const handleSaveEvent = async (eventId: string) => {
        if (isLocked) {
            toast.error("Updates are locked. Clear hold, hide it, or override restriction first.");
            return;
        }
        try {
            const res = await fetch(`/api/shipments/${shipment.id}/event/${eventId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...editEventData,
                    timestamp: new Date(editEventData.timestamp + ':00Z').toISOString(),
                    holdFee: editEventData.status === 'ON_HOLD' && editEventData.holdFee !== '' ? parseFloat(editEventData.holdFee.toString()) : 0,
                    holdReason: editEventData.status === 'ON_HOLD' ? editEventData.holdReason : null
                })
            });

            if (res.ok) {
                setEditingEventId(null);
                router.refresh();
                toast.success("Event updated");
            } else {
                toast.error("Failed to update event");
            }
        } catch (e) {
            console.error(e);
            toast.error("Error updating event");
        }
    };

    // Main Shipment Edit State (existing)
    const [isEditing, setIsEditing] = useState(false);
    
    const parsedSender = parseShipmentInfo(shipment.senderInfo);
    const parsedReceiver = parseShipmentInfo(shipment.receiverInfo);
    
    const [editData, setEditData] = useState({
        createdAt: new Date(shipment.createdAt).toISOString().slice(0, 16),
        origin: shipment.origin || '',
        destination: shipment.destination || '',
        customerEmail: shipment.customerEmail || '',
        productDescription: shipment.productDescription || '',
        imageUrls: shipment.imageUrls || [],
        videoUrls: shipment.videoUrls || [],
        estimatedDelivery: shipment.estimatedDelivery ? new Date(shipment.estimatedDelivery).toISOString().slice(0, 16) : '',
        senderName: parsedSender.name,
        senderPhone: parsedSender.phone,
        senderAddress: parsedSender.address,
        vehicleType: parsedSender.vehicleType || 'TRUCK',
        receiverName: parsedReceiver.name,
        receiverPhone: parsedReceiver.phone,
        receiverAddress: parsedReceiver.address,
        destLat: parsedReceiver.destLat || '',
        destLng: parsedReceiver.destLng || '',
        originLat: parsedSender.originLat || '',
        originLng: parsedSender.originLng || ''
    });

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/shipments/${shipment.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    createdAt: new Date(editData.createdAt + ':00Z').toISOString(),
                    origin: editData.origin,
                    destination: editData.destination,
                    customerEmail: editData.customerEmail,
                    productDescription: editData.productDescription,
                    imageUrls: editData.imageUrls,
                    videoUrls: editData.videoUrls,
                    estimatedDelivery: editData.estimatedDelivery ? new Date(editData.estimatedDelivery + ':00Z').toISOString() : null,
                    senderInfo: JSON.stringify({ name: editData.senderName, phone: editData.senderPhone, address: editData.senderAddress, vehicleType: editData.vehicleType, originLat: editData.originLat, originLng: editData.originLng }),
                    receiverInfo: JSON.stringify({ name: editData.receiverName, phone: editData.receiverPhone, address: editData.receiverAddress, destLat: editData.destLat, destLng: editData.destLng })
                })
            });
            if (res.ok) {
                setIsEditing(false);
                router.refresh();
                toast.success("Shipment details updated");
            } else {
                toast.error('Failed to update shipment details');
            }
        } catch (e) {
            console.error(e);
            toast.error('Error updating');
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'CREATED': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'PENDING': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
            case 'IN_TRANSIT': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'ON_HOLD': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
            case 'OUT_FOR_DELIVERY': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            case 'DELIVERED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'RETURNED': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-slate-800 text-slate-400 border-slate-700';
        }
    };

    const getTimelineDotColor = (status: string) => {
        switch (status) {
            case 'CREATED': return 'bg-yellow-500 border-yellow-500';
            case 'PENDING': return 'bg-indigo-500 border-indigo-500';
            case 'IN_TRANSIT': return 'bg-blue-500 border-blue-500';
            case 'ON_HOLD': return 'bg-orange-500 border-orange-500';
            case 'OUT_FOR_DELIVERY': return 'bg-purple-500 border-purple-500';
            case 'DELIVERED': return 'bg-emerald-500 border-emerald-500';
            case 'RETURNED': return 'bg-red-500 border-red-500';
            default: return 'bg-slate-500 border-slate-500';
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLocked) {
            toast.error("Updates are locked. Clear hold, hide it, or override restriction first.");
            return;
        }
        setUpdating(true);
        try {
            const res = await fetch(`/api/shipments/${shipment.id}/event`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: formData.status,
                    location: formData.location,
                    description: formData.description,
                    latitude: formData.latitude,
                    longitude: formData.longitude,
                    timestamp: new Date(formData.timestamp + ':00Z').toISOString(),
                    holdFee: formData.status === 'ON_HOLD' && formData.holdFee !== '' ? parseFloat(formData.holdFee.toString()) : 0,
                    holdReason: formData.status === 'ON_HOLD' ? formData.holdReason : null
                })
            });

            // Patch shipment destination coords if changed
            const currentReceiverInfo = parseShipmentInfo(shipment.receiverInfo);
            if (formData.destLat !== (currentReceiverInfo.destLat || '') || formData.destLng !== (currentReceiverInfo.destLng || '')) {
                await fetch(`/api/shipments/${shipment.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        receiverInfo: JSON.stringify({ 
                            ...currentReceiverInfo, 
                            destLat: formData.destLat, 
                            destLng: formData.destLng 
                        })
                    })
                });
            }

            if (res.ok) {
                setFormData(prev => ({
                    ...prev,
                    status: 'IN_TRANSIT',
                    location: '',
                    description: '',
                    latitude: '',
                    longitude: '',
                    timestamp: new Date().toISOString().slice(0, 16),
                    holdFee: '',
                    holdReason: ''
                }));
                router.refresh();
                toast.success('Status updated successfully');
            } else {
                toast.error('Failed to update');
            }
        } catch (e) {
            console.error(e);
            toast.error('Error updating');
        } finally {
            setUpdating(false);
        }
    };




    const handleToggleRoute = async () => {
        const toastId = toast.loading("Updating map settings...");
        try {
            const res = await fetch(`/api/shipments/${shipment.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ showRoute: !shipment.showRoute })
            });

            if (res.ok) {
                toast.success("Map visibility updated!", { id: toastId });
                router.refresh();
            } else {
                toast.error("Failed to update map settings", { id: toastId });
            }
        } catch (e) {
            toast.error("Error updating map settings", { id: toastId });
        }
    };
    
    const handleMapDrag = async (lat: number, lng: number) => {
        setFormData(prev => ({
            ...prev,
            latitude: lat.toFixed(7),
            longitude: lng.toFixed(7)
        }));

        // Automatically find address from new coordinates
        const address = await reverseGeocode(lat, lng);
        if (address) {
            setFormData(prev => ({
                ...prev,
                location: address
            }));
            toast.success("Location updated from map", { duration: 2000, icon: '📍' });
        } else {
            toast.success("Coordinates updated from map", { duration: 2000, icon: '📍' });
        }
    };

    const latestLocation = shipment.events.find((e: ShipmentEvent) => e.latitude && e.longitude);
    
    // Preview for currently being added event
    const previewEvent = formData.latitude && formData.longitude ? {
        latitude: formData.latitude,
        longitude: formData.longitude,
        location: formData.location || 'New Event Location',
        status: formData.status,
        timestamp: formData.timestamp
    } : null;

    // Determine map center and visibility based on available data
    const mapLat = Number(previewEvent?.latitude) || Number(latestLocation?.latitude) || Number(editData.originLat) || Number(parsedSender.originLat) || 0;
    const mapLng = Number(previewEvent?.longitude) || Number(latestLocation?.longitude) || Number(editData.originLng) || Number(parsedSender.originLng) || 0;
    const mapLocName = previewEvent?.location || latestLocation?.location || (isEditing ? editData.origin : shipment.origin) || 'Origin';
    const hasCoordinates = !!(previewEvent || latestLocation || editData.originLat || editData.destLat || parsedSender.originLat || parsedReceiver.destLat);

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-brand-text-muted hover:text-brand-text transition-colors self-start"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                </button>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <a
                        href={`/track/${shipment.trackingNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-4 py-2 bg-brand-surface hover:bg-brand-border/20 text-brand-text rounded-xl transition-all border border-brand-border text-sm font-medium whitespace-nowrap"
                    >
                        <ExternalLink className="w-4 h-4 mr-2 flex-shrink-0" />
                        View Customer Page
                    </a>
                    <a
                        href={`/api/shipments/${shipment.id}/label`}
                        download={`LABEL-${shipment.trackingNumber}.pdf`}
                        className="flex items-center px-4 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-xl transition-all shadow-lg shadow-brand-primary/20 text-sm font-medium whitespace-nowrap"
                    >
                        <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
                        Download Waybill
                    </a>
                    <button
                        onClick={() => window.print()}
                        className="flex items-center px-4 py-2 bg-brand-surface hover:bg-brand-border/20 text-brand-text rounded-xl transition-all border border-brand-border text-sm font-medium whitespace-nowrap"
                    >
                        <Printer className="w-4 h-4 mr-2 flex-shrink-0" />
                        Print Details
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                {/* Left Column: Chat - Sticky */}
                <div className="xl:col-span-3 order-3 xl:order-1 print:hidden">
                    <div className="sticky top-6 space-y-6">
                        <ShipmentChat shipmentId={shipment.id} />
                        
                        {/* Hold Settings & Control Panel */}
                        {mounted && shipment.status === 'ON_HOLD' && activeHoldEvent && (
                            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 shadow-lg space-y-4">
                                <div className="flex items-center justify-between pb-3 border-b border-amber-200">
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-2.5 w-2.5 relative">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                                        </span>
                                        <h3 className="font-bold text-amber-900 text-sm tracking-tight">Active Hold Controls</h3>
                                    </div>
                                    {/* Resend notification button [M] */}
                                    <button
                                        type="button"
                                        onClick={() => handleResendEmail(activeHoldEvent.id)}
                                        disabled={sendingEmailId === activeHoldEvent.id}
                                        className="p-1.5 bg-amber-100 hover:bg-amber-200 text-amber-700 disabled:opacity-50 rounded-lg transition-all"
                                        title="Resend hold notification email to customer"
                                    >
                                        {sendingEmailId === activeHoldEvent.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Mail className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>

                                {/* Inputs */}
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
                                            Daily Fee ($)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={holdPanelFee}
                                            onChange={(e) => setHoldPanelFee(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full bg-white border border-amber-200 text-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
                                            Warning / Hold Reason
                                        </label>
                                        <textarea
                                            rows={2}
                                            value={holdPanelReason}
                                            onChange={(e) => setHoldPanelReason(e.target.value)}
                                            placeholder="Provide reason for storage warning..."
                                            className="w-full bg-white border border-amber-200 text-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all resize-none"
                                        />
                                    </div>

                                    {/* Visibility Toggle */}
                                    <div className="flex items-center justify-between py-2 border-t border-amber-200/50 border-b border-amber-200/50">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-amber-900">Hide from Customer</span>
                                            <span className="text-[10px] text-amber-700/80">Suppress alert banner on portal</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setHoldPanelHidden(!holdPanelHidden)}
                                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                                holdPanelHidden ? 'bg-amber-600' : 'bg-slate-200'
                                            }`}
                                        >
                                            <span
                                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                    holdPanelHidden ? 'translate-x-5' : 'translate-x-0'
                                                }`}
                                            />
                                        </button>
                                    </div>

                                    {/* Calculated Hold Stats */}
                                    {(() => {
                                        const holdStart = new Date(activeHoldEvent.timestamp);
                                        const now = new Date();
                                        const diffTime = Math.max(0, now.getTime() - holdStart.getTime());
                                        const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
                                        const feePerDay = parseFloat(holdPanelFee) || 0;
                                        const total = diffDays * feePerDay;

                                        return (
                                            <div className="bg-amber-100/50 rounded-xl p-3 text-xs text-amber-900 space-y-1.5">
                                                <div className="flex justify-between">
                                                    <span className="text-amber-800">Hold Date:</span>
                                                    <span className="font-semibold">
                                                        <FormattedDate date={activeHoldEvent.timestamp} mode="date" />
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-amber-800">Days Elapsed:</span>
                                                    <span className="font-semibold">{diffDays} {diffDays === 1 ? 'day' : 'days'}</span>
                                                </div>
                                                <div className="flex justify-between pt-1.5 border-t border-amber-200/50 text-sm font-bold">
                                                    <span>Total Storage Accrued:</span>
                                                    <span className="text-amber-700">${total.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* Save Button */}
                                    <button
                                        type="button"
                                        onClick={handleSaveHoldSettings}
                                        disabled={updating}
                                        className="w-full py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-amber-600/10"
                                    >
                                        {updating ? 'Saving...' : 'Save Hold Settings'}
                                    </button>
                                </div>

                                {/* Clear Hold Transition Section */}
                                <div className="pt-3 border-t border-amber-200">
                                    {!showReleaseForm ? (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setReleaseLocation(activeHoldEvent.location || '');
                                                setShowReleaseForm(true);
                                            }}
                                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-600/10 flex items-center justify-center gap-1"
                                        >
                                            <Check className="w-3.5 h-3.5" />
                                            Confirm Clear Hold
                                        </button>
                                    ) : (
                                        <div className="space-y-3 bg-white p-3 rounded-xl border border-amber-200">
                                            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                                                <span className="text-xs font-bold text-slate-800">Release Transit Status</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowReleaseForm(false)}
                                                    className="text-slate-400 hover:text-slate-600"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                    Transition Status
                                                </label>
                                                <select
                                                    value={releaseStatus}
                                                    onChange={(e) => setReleaseStatus(e.target.value)}
                                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                >
                                                    <option value="IN_TRANSIT">IN TRANSIT</option>
                                                    <option value="PENDING">PENDING</option>
                                                    <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                                                    <option value="DELIVERED">DELIVERED</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                    Current Location
                                                </label>
                                                <input
                                                    type="text"
                                                    value={releaseLocation}
                                                    onChange={(e) => setReleaseLocation(e.target.value)}
                                                    placeholder="Enter current city/hub..."
                                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                    Status Description
                                                </label>
                                                <input
                                                    type="text"
                                                    value={releaseDescription}
                                                    onChange={(e) => setReleaseDescription(e.target.value)}
                                                    placeholder="Status details..."
                                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                />
                                            </div>

                                            <button
                                                type="button"
                                                onClick={handleConfirmClearHold}
                                                disabled={updating}
                                                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all"
                                            >
                                                {updating ? 'Releasing...' : 'Confirm Release Event'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Middle Column: Details & Visual */}
                <div className="xl:col-span-6 space-y-6 order-1 xl:order-2 print:col-span-12 print:w-full">
                    {/* Print Header - Matches Screenshot */}
                    <div className="hidden print:block mb-8 pb-4">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex flex-col">
                                {settings?.logoUrl ? (
                                    <img src={settings.logoUrl} alt="Logo" className="w-48 h-20 object-contain object-left mb-2" />
                                ) : (
                                    <h1 className="text-2xl font-bold text-blue-900 leading-none mb-1">{settings?.companyName || 'ATLAS LOGISTICS'}</h1>
                                )}
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-1">Tracking Number</p>
                                <p className="text-2xl font-black text-slate-900">{shipment.trackingNumber}</p>
                            </div>
                        </div>
                        <div className="flex justify-between items-end border-b-[3px] border-black pb-2">
                            <h2 className="text-lg font-black text-slate-800 tracking-[0.2em] uppercase">Shipment Waybill</h2>
                        </div>
                    </div>

                    <div className="bg-brand-surface border border-brand-border rounded-2xl p-8 shadow-xl print:shadow-none print:border-black print:bg-white print:text-black">
                        {/* Header Section for Print Card */}
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-10">
                            <div className="w-full sm:w-auto">
                                <h1 className="text-3xl sm:text-4xl font-black text-brand-text print:text-black break-all mb-1">{shipment.trackingNumber}</h1>
                                <div className="flex flex-col gap-1 mt-1">
                                    <p className="text-brand-text-muted text-sm print:text-slate-500 font-medium">Created on <FormattedDate date={shipment.createdAt} mode="date" /></p>
                                    {shipment.estimatedDelivery && (
                                        <p className="text-blue-400 print:text-blue-600 font-bold text-sm">
                                            Est. Delivery: <FormattedDate date={shipment.estimatedDelivery} mode="date" />
                                        </p>
                                    )}
                                    {((shipment.holdFee && shipment.holdFee > 0) || shipment.holdReason) && (
                                        <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500 text-sm max-w-md">
                                            <p className="font-bold flex items-center gap-1.5">
                                                ⚠️ Hold Charge: ${shipment.holdFee || 0}
                                            </p>
                                            {shipment.holdReason && <p className="text-xs mt-1 text-brand-text-muted">{shipment.holdReason}</p>}
                                        </div>
                                    )}
                                    <button
                                        onClick={() => setIsEditing(!isEditing)}
                                        className="text-xs text-blue-400 hover:text-blue-300 print:hidden"
                                    >
                                        {isEditing ? 'Cancel Edit' : 'Edit Details'}
                                    </button>
                                </div>

                                {isEditing && (
                                    <form onSubmit={handleEditSubmit} className="mt-4 p-4 bg-brand-bg/50 rounded-lg border border-brand-border space-y-3 max-w-md print:hidden">
                                        <div>
                                            <label className="text-xs text-brand-text-muted block mb-1">Creation Date</label>
                                            <input
                                                type="datetime-local"
                                                className="w-full bg-brand-surface border border-brand-border rounded px-2 py-1 text-sm text-brand-text"
                                                value={editData.createdAt}
                                                onChange={e => setEditData({ ...editData, createdAt: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-brand-text-muted block mb-1">Estimated Delivery</label>
                                            <input
                                                type="datetime-local"
                                                className="w-full bg-brand-surface border border-brand-border rounded px-2 py-1 text-sm text-brand-text"
                                                value={editData.estimatedDelivery}
                                                onChange={e => setEditData({ ...editData, estimatedDelivery: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Sender Inputs */}
                                            <div className="space-y-3 bg-brand-bg/30 p-3 rounded border border-brand-border">
                                                <label className="text-xs font-semibold text-blue-500 uppercase tracking-wider block mb-2">Sender Info</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-brand-surface border border-brand-border rounded px-2 py-1 text-sm text-brand-text"
                                                    value={editData.senderName}
                                                    onChange={e => setEditData({ ...editData, senderName: e.target.value })}
                                                    placeholder="Sender Name"
                                                />
                                                <input
                                                    type="text"
                                                    className="w-full bg-brand-surface border border-brand-border rounded px-2 py-1 text-sm text-brand-text"
                                                    value={editData.senderPhone}
                                                    onChange={e => setEditData({ ...editData, senderPhone: e.target.value })}
                                                    placeholder="Sender Phone"
                                                />
                                                <div className="relative">
                                                    <textarea
                                                        rows={2}
                                                        className="w-full bg-brand-surface border border-brand-border rounded px-2 py-1 text-sm text-brand-text resize-none pr-10"
                                                        value={editData.senderAddress}
                                                        onChange={e => setEditData({ ...editData, senderAddress: e.target.value })}
                                                        placeholder="Sender Address"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleGeocode('origin')}
                                                        disabled={geocoding === 'origin'}
                                                        className="absolute right-2 top-2 p-1 text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50 z-10"
                                                        title="Auto-find coordinates"
                                                    >
                                                        {geocoding === 'origin' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
                                                    </button>
                                                </div>

                                                <div className="mt-2">
                                                    <label className="text-xs text-brand-text-muted block mb-1">Vehicle Type</label>
                                                    <select
                                                        className="w-full bg-brand-surface border border-brand-border rounded px-2 py-1 text-sm text-brand-text"
                                                        value={editData.vehicleType}
                                                        onChange={e => setEditData({ ...editData, vehicleType: e.target.value })}
                                                    >
                                                        <option value="TRUCK">Truck</option>
                                                        <option value="SHIP">Ship</option>
                                                        <option value="PLANE">Airplane</option>
                                                        <option value="VAN">Van</option>
                                                        <option value="TRAIN">Train</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Receiver Inputs */}
                                            <div className="space-y-3 bg-brand-bg/30 p-3 rounded border border-brand-border">
                                                <label className="text-xs font-semibold text-blue-500 uppercase tracking-wider block mb-2">Receiver Info</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-brand-surface border border-brand-border rounded px-2 py-1 text-sm text-brand-text"
                                                    value={editData.receiverName}
                                                    onChange={e => setEditData({ ...editData, receiverName: e.target.value })}
                                                    placeholder="Receiver Name"
                                                />
                                                <input
                                                    type="text"
                                                    className="w-full bg-brand-surface border border-brand-border rounded px-2 py-1 text-sm text-brand-text"
                                                    value={editData.receiverPhone}
                                                    onChange={e => setEditData({ ...editData, receiverPhone: e.target.value })}
                                                    placeholder="Receiver Phone"
                                                />
                                                <div className="relative">
                                                    <textarea
                                                        rows={2}
                                                        className="w-full bg-brand-surface border border-brand-border rounded px-2 py-1 text-sm text-brand-text resize-none pr-10"
                                                        value={editData.receiverAddress}
                                                        onChange={e => setEditData({ ...editData, receiverAddress: e.target.value })}
                                                        placeholder="Receiver Address"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleGeocode('dest')}
                                                        disabled={geocoding === 'dest'}
                                                        className="absolute right-2 top-2 p-1 text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50 z-10"
                                                        title="Auto-find coordinates"
                                                    >
                                                        {geocoding === 'dest' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs text-brand-text-muted block mb-1">Origin</label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        className="w-full bg-brand-surface border border-brand-border rounded px-2 py-1 text-sm text-brand-text mb-2 pr-8"
                                                        value={editData.origin}
                                                        onChange={e => setEditData({ ...editData, origin: e.target.value })}
                                                        placeholder="Origin location"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleGeocode('origin')}
                                                        disabled={geocoding === 'origin'}
                                                        className="absolute right-2 top-2 p-1 text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50 z-10"
                                                        title="Auto-find coordinates"
                                                    >
                                                        {geocoding === 'origin' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <input
                                                        type="number"
                                                        step="any"
                                                        className="w-full bg-brand-surface border border-brand-border rounded px-2 py-1 text-sm text-brand-text"
                                                        value={editData.originLat}
                                                        onChange={e => setEditData({ ...editData, originLat: e.target.value })}
                                                        placeholder="Orig. Latitude"
                                                    />
                                                    <input
                                                        type="number"
                                                        step="any"
                                                        className="w-full bg-brand-surface border border-brand-border rounded px-2 py-1 text-sm text-brand-text"
                                                        value={editData.originLng}
                                                        onChange={e => setEditData({ ...editData, originLng: e.target.value })}
                                                        placeholder="Orig. Longitude"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs text-brand-text-muted block mb-1">Destination</label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        className="w-full bg-brand-surface border border-brand-border rounded px-2 py-1 text-sm text-brand-text mb-2 pr-8"
                                                        value={editData.destination}
                                                        onChange={e => setEditData({ ...editData, destination: e.target.value })}
                                                        placeholder="Destination location"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleGeocode('dest')}
                                                        disabled={geocoding === 'dest'}
                                                        className="absolute right-2 top-2 p-1 text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50 z-10"
                                                        title="Auto-find coordinates"
                                                    >
                                                        {geocoding === 'dest' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <input
                                                        type="number"
                                                        step="any"
                                                        className="w-full bg-brand-surface border border-brand-border rounded px-2 py-1 text-sm text-brand-text"
                                                        value={editData.destLat}
                                                        onChange={e => setEditData({ ...editData, destLat: e.target.value })}
                                                        placeholder="Dest. Latitude"
                                                    />
                                                    <input
                                                        type="number"
                                                        step="any"
                                                        className="w-full bg-brand-surface border border-brand-border rounded px-2 py-1 text-sm text-brand-text"
                                                        value={editData.destLng}
                                                        onChange={e => setEditData({ ...editData, destLng: e.target.value })}
                                                        placeholder="Dest. Longitude"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-brand-text-muted block mb-1">Customer Email</label>
                                            <input
                                                type="email"
                                                className="w-full bg-brand-surface border border-brand-border rounded px-2 py-1 text-sm text-brand-text"
                                                value={editData.customerEmail}
                                                onChange={e => setEditData({ ...editData, customerEmail: e.target.value })}
                                                placeholder="customer@example.com"
                                            />
                                            {/* Hold Fee and Reason inputs removed - now managed via ON_HOLD tracking events */}
                                        </div>
                                        <div>
                                            <label className="text-xs text-brand-text-muted block mb-1">Product Description</label>
                                            <textarea
                                                rows={3}
                                                className="w-full bg-brand-surface border border-brand-border rounded px-2 py-1 text-sm text-brand-text resize-none"
                                                value={editData.productDescription}
                                                onChange={e => setEditData({ ...editData, productDescription: e.target.value })}
                                                placeholder="Describe the shipment contents..."
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-xs text-brand-text-muted block mb-1">Upload Images</label>
                                                <div className="space-y-3">
                                                    <input
                                                        type="file"
                                                        multiple
                                                        accept="image/*"
                                                        onChange={async (e) => {
                                                            if (!e.target.files?.length) {
                                                                return;
                                                            }
                                                             const files = Array.from(e.target.files);
                                                             
                                                             try {
                                                                 const uploadPromises = files.map(async (file) => {
                                                                     const uploadId = Math.random().toString(36).substring(7);
                                                                     const controller = new AbortController();
                                                                     
                                                                     const newActiveUpload = {
                                                                         id: uploadId,
                                                                         fileName: file.name,
                                                                         progress: 0,
                                                                         controller
                                                                     };
                                                                     
                                                                     setActiveUploads(prev => [...prev, newActiveUpload]);

                                                                     try {
                                                                        const newBlob = await upload(file.name, file, {
                                                                            access: 'public',
                                                                            handleUploadUrl: '/api/upload/token',
                                                                            abortSignal: controller.signal,
                                                                             onUploadProgress: (progressEvent) => {
                                                                                 setActiveUploads(prev => prev.map(u => 
                                                                                     u.id === uploadId ? { ...u, progress: progressEvent.percentage } : u
                                                                                 ));
                                                                             }
                                                                         });
                                                                         setActiveUploads(prev => prev.filter(u => u.id !== uploadId));
                                                                         return newBlob.url;
                                                                     } catch (err: any) {
                                                                         if (err.name === 'AbortError') {
                                                                             console.log('Upload aborted');
                                                                         } else {
                                                                             console.error(`Failed to upload ${file.name}`, err);
                                                                         }
                                                                         setActiveUploads(prev => prev.filter(u => u.id !== uploadId));
                                                                         return null;
                                                                     }
                                                                 });

                                                                 const results = await Promise.all(uploadPromises);
                                                                 const successUrls = results.filter((url): url is string => url !== null);

                                                                 if (successUrls.length > 0) {
                                                                     setEditData(prev => ({
                                                                         ...prev,
                                                                         imageUrls: [...prev.imageUrls, ...successUrls]
                                                                     }));
                                                                     toast.success(`Successfully uploaded ${successUrls.length} images`);
                                                                 }
                                                             } catch (err: unknown) {
                                                                 console.error(err instanceof Error ? err.message : err);
                                                             } finally {
                                                                 e.target.value = ''; 
                                                             }
                                                        }}
                                                        className="w-full bg-brand-surface border border-brand-border rounded px-2 py-1 text-sm text-brand-text file:mr-4 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-500/10 file:text-blue-500 hover:file:bg-blue-500/20"
                                                    />
                                                    {/* Active Uploads Progress */}
                                                    {activeUploads.map(upload => (
                                                        <div key={upload.id} className="space-y-1">
                                                            <div className="flex justify-between text-[10px] text-brand-text-muted">
                                                                <span>{upload.fileName}</span>
                                                                <button type="button" onClick={() => upload.controller.abort()} className="text-red-500 hover:underline">Cancel</button>
                                                            </div>
                                                            <div className="w-full bg-brand-surface h-1.5 rounded-full overflow-hidden">
                                                                <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${upload.progress}%` }} />
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {/* Preview / Remove List */}
                                                    {editData.imageUrls.length > 0 && (
                                                        <div className="grid grid-cols-3 gap-2">
                                                            {editData.imageUrls.map((url: string, i: number) => (
                                                                <div key={i} className="relative group aspect-square bg-brand-bg rounded-md overflow-hidden border border-brand-border">
                                                                    {/* eslint-disable-next-line @next/next-line @next/next-line @next/next/no-img-element */}
                                                                    <img src={url} alt="preview" className="w-full h-full object-cover" />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setEditData(prev => ({ ...prev, imageUrls: prev.imageUrls.filter((_: string, idx: number) => idx !== i) }))}
                                                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    >
                                                                        <div className="w-3 h-3 flex items-center justify-center">×</div>
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-xs text-brand-text-muted block mb-1">Upload Video Proof</label>
                                                <div className="space-y-3">
                                                    <input
                                                        type="file"
                                                        multiple
                                                        accept="video/*"
                                                        onChange={async (e) => {
                                                            if (!e.target.files?.length) return;
                                                            const files = Array.from(e.target.files);
                                                            e.target.value = ''; 

                                                            try {
                                                                const uploadPromises = files.map(async (file) => {
                                                                    const uploadId = Math.random().toString(36).substring(7);
                                                                    const controller = new AbortController();
                                                                    
                                                                    const newActiveUpload = {
                                                                        id: uploadId,
                                                                        fileName: file.name,
                                                                        progress: 0,
                                                                        controller
                                                                    };
                                                                    
                                                                    setActiveUploads(prev => [...prev, newActiveUpload]);

                                                                    try {
                                                                        const newBlob = await upload(file.name, file, {
                                                                            access: 'public',
                                                                            handleUploadUrl: '/api/upload/token',
                                                                            abortSignal: controller.signal,
                                                                            onUploadProgress: (progressEvent) => {
                                                                                setActiveUploads(prev => prev.map(u => 
                                                                                    u.id === uploadId ? { ...u, progress: progressEvent.percentage } : u
                                                                                ));
                                                                            }
                                                                        });
                                                                        setActiveUploads(prev => prev.filter(u => u.id !== uploadId));
                                                                        return newBlob.url;
                                                                    } catch (err: any) {
                                                                        if (err.name === 'AbortError') {
                                                                            console.log('Upload aborted');
                                                                        } else {
                                                                            console.error(`Failed to upload ${file.name}`, err);
                                                                        }
                                                                        setActiveUploads(prev => prev.filter(u => u.id !== uploadId));
                                                                        return null;
                                                                    }
                                                                });

                                                                const results = await Promise.all(uploadPromises);
                                                                const successUrls = results.filter((url): url is string => url !== null);

                                                                if (successUrls.length > 0) {
                                                                    setEditData(prev => ({
                                                                        ...prev,
                                                                        videoUrls: [...prev.videoUrls, ...successUrls]
                                                                    }));
                                                                    toast.success(`Successfully uploaded ${successUrls.length} videos`);
                                                                }
                                                            } catch (err: unknown) {
                                                                console.error(err instanceof Error ? err.message : err);
                                                            } finally {
                                                                e.target.value = ''; 
                                                            }
                                                        }}
                                                        className="w-full bg-brand-surface border border-brand-border rounded px-2 py-1 text-sm text-brand-text file:mr-4 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-500/10 file:text-blue-500 hover:file:bg-blue-500/20"
                                                    />
                                                    {editData.videoUrls && editData.videoUrls.length > 0 && (
                                                        <div className="grid grid-cols-1 gap-4">
                                                            {editData.videoUrls.map((url: string, i: number) => (
                                                                <div key={i} className="relative group w-full aspect-video bg-brand-bg rounded-xl overflow-hidden border border-brand-border shadow-lg">
                                                                    <video src={url} className="w-full h-full object-contain bg-black" />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setEditData(prev => ({ ...prev, videoUrls: prev.videoUrls.filter((_: string, idx: number) => idx !== i) }))}
                                                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all shadow-lg scale-90 group-hover:scale-100 z-20"
                                                                    >
                                                                        <X className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button type="submit" className="bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-500 shadow-lg shadow-blue-500/20">Save Changes</button>
                                        </div>
                                    </form>
                                )}
                            </div>
                            <div className={`px-6 py-2 rounded-full text-xs sm:text-sm font-black border-2 whitespace-nowrap self-start sm:self-auto uppercase tracking-wider ${getStatusStyles(shipment.status)}`}>
                                {shipment.status}
                            </div>
                        </div>

                        {/* Route Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-brand-border print:border-gray-200">
                            <div>
                                <p className="text-brand-text-muted text-sm font-medium uppercase mb-1">From</p>
                                <p className="text-brand-text text-lg font-semibold print:text-black">{shipment.origin}</p>
                                <div className="mt-2 space-y-1">
                                    {parsedSender.name && <p className="text-brand-text font-medium print:text-black">{parsedSender.name}</p>}
                                    {parsedSender.phone && <p className="text-brand-text-muted text-sm print:text-gray-600">{parsedSender.phone}</p>}
                                    {parsedSender.address && <p className="text-brand-text-muted text-sm print:text-gray-600">{parsedSender.address}</p>}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-brand-text-muted text-sm font-medium uppercase mb-1">To</p>
                                <p className="text-brand-text text-lg font-semibold print:text-black">{shipment.destination}</p>
                                <div className="mt-2 space-y-1 flex flex-col items-end">
                                    {parsedReceiver.name && <p className="text-brand-text font-medium print:text-black">{parsedReceiver.name}</p>}
                                    {parsedReceiver.phone && <p className="text-brand-text-muted text-sm print:text-gray-600">{parsedReceiver.phone}</p>}
                                    {parsedReceiver.address && <p className="text-brand-text-muted text-sm print:text-gray-600">{parsedReceiver.address}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Product Details */}
                        {(shipment.productDescription || (shipment.imageUrls && shipment.imageUrls.length > 0) || (shipment.videoUrls && shipment.videoUrls.length > 0)) && (
                            <div className="mb-8 pb-8 border-b border-brand-border print:border-none">
                                <h3 className="text-brand-text text-xl font-black mb-4 print:text-black uppercase tracking-tight">Product Details</h3>
                                <div className="grid grid-cols-1 gap-6">
                                    {shipment.productDescription && (
                                        <div className="space-y-4">
                                            <div className="print:block hidden">
                                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Description</p>
                                            </div>
                                            <p className="text-brand-text print:text-black whitespace-pre-wrap leading-relaxed text-base">{shipment.productDescription}</p>
                                        </div>
                                    )}
                                    {((shipment.imageUrls && shipment.imageUrls.length > 0) || (shipment.videoUrls && shipment.videoUrls.length > 0)) && (
                                        <div className="space-y-8">
                                            {shipment.imageUrls && shipment.imageUrls.length > 0 && (
                                                <div>
                                                    <p className="text-brand-text-muted text-sm font-medium uppercase mb-3">Attached Images</p>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                                        {shipment.imageUrls.map((url: string, i: number) => (
                                                            <a key={i} href={url} target="_blank" rel="noreferrer" className="block aspect-square bg-brand-surface rounded-xl overflow-hidden border border-brand-border hover:border-blue-500 transition-all hover:scale-[1.02] relative group shadow-sm">
                                                                {/* eslint-disable-next-line @next/next-line @next/next-line @next/next/no-img-element */}
                                                                <img src={url} alt={`Product ${i + 1}`} className="w-full h-full object-cover" />
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {shipment.videoUrls && shipment.videoUrls.length > 0 && (
                                                <div>
                                                    <p className="text-brand-text-muted text-sm font-medium uppercase mb-3">Attached Video Proof</p>
                                                    <div className="grid grid-cols-1 gap-6">
                                                        {shipment.videoUrls.map((url: string, i: number) => (
                                                            <div key={i} className="w-full aspect-video bg-brand-surface rounded-2xl overflow-hidden border border-brand-border relative group shadow-2xl">
                                                                <video src={url} controls className="w-full h-full object-contain bg-black" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Route Map (Visual) */}
                        {hasCoordinates && (
                            <div className="w-full mb-8 print:hidden">
                                <h3 className="text-brand-text text-lg font-bold mb-4 flex items-center">
                                    <MapPin className="w-5 h-5 mr-3 text-brand-text-muted" />
                                    {latestLocation ? 'Live Location' : 'Route Visualization'}
                                </h3>
                                <TrackingMapWrapper
                                    lat={mapLat}
                                    lng={mapLng}
                                    locationName={mapLocName}
                                    events={[...(previewEvent ? [previewEvent] : []), ...shipment.events]}
                                    vehicleType={isEditing ? editData.vehicleType : (liveVehicleType || parsedSender.vehicleType)}
                                    originLat={isEditing ? editData.originLat : parsedSender.originLat}
                                    originLng={isEditing ? editData.originLng : parsedSender.originLng}
                                    destLat={formData.destLat || (isEditing ? editData.destLat : parsedReceiver.destLat)}
                                    destLng={formData.destLng || (isEditing ? editData.destLng : parsedReceiver.destLng)}
                                    destinationName={isEditing ? editData.destination : (shipment.destination || undefined)}
                                    destinationAddress={isEditing ? editData.receiverAddress : parsedReceiver.address}
                                    isRouteVisible={shipment.showRoute}
                                    onToggle={handleToggleRoute}
                                    onDragEnd={handleMapDrag}
                                />
                            </div>
                        )}

                        {/* Timeline */}
                        <div>
                            <h3 className="text-brand-text font-semibold mb-6 print:text-black">Tracking History</h3>
                            <div className="relative pl-4 border-l-2 border-brand-border space-y-8 print:border-gray-300">
                                {shipment.events.map((event: ShipmentEvent) => (
                                    <div key={event.id} className="relative pl-6 group">
                                        <div className={`absolute -left-[21px] top-1 w-4 h-4 rounded-full border-2 ${getTimelineDotColor(event.status)}`}></div>

                                        {editingEventId === event.id ? (
                                            <div className="bg-brand-bg/50 p-4 rounded-lg border border-brand-border space-y-3">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="text-xs text-brand-text-muted block mb-1">Status</label>
                                                        <select
                                                            className="w-full bg-brand-surface border border-brand-border rounded px-2 py-1 text-sm text-brand-text"
                                                            value={editEventData.status}
                                                            onChange={e => setEditEventData({ ...editEventData, status: e.target.value })}
                                                        >
                                                            <option value="PENDING">PENDING</option>
                                                            <option value="IN_TRANSIT">IN TRANSIT</option>
                                                            <option value="ON_HOLD">ON HOLD</option>
                                                            <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                                                            <option value="DELIVERED">DELIVERED</option>
                                                            <option value="RETURNED">RETURNED</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-brand-text-muted block mb-1">Time</label>
                                                        <input
                                                            type="datetime-local"
                                                            className="w-full bg-brand-surface border border-brand-border rounded px-2 py-1 text-sm text-brand-text"
                                                            value={editEventData.timestamp}
                                                            onChange={e => setEditEventData({ ...editEventData, timestamp: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-xs text-brand-text-muted block mb-1">Location</label>
                                                    <input
                                                        type="text"
                                                        className="w-full bg-brand-surface border border-brand-border rounded px-2 py-1 text-sm text-brand-text"
                                                        value={editEventData.location}
                                                        onChange={e => setEditEventData({ ...editEventData, location: e.target.value })}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="text-xs text-brand-text-muted block mb-1">Latitude</label>
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            className="w-full bg-brand-surface border border-brand-border rounded px-2 py-1 text-sm text-brand-text"
                                                            value={editEventData.latitude}
                                                            onChange={e => setEditEventData({ ...editEventData, latitude: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-brand-text-muted block mb-1">Longitude</label>
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            className="w-full bg-brand-surface border border-brand-border rounded px-2 py-1 text-sm text-brand-text"
                                                            value={editEventData.longitude}
                                                            onChange={e => setEditEventData({ ...editEventData, longitude: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                                {editEventData.status === 'ON_HOLD' && (
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="text-[10px] text-brand-text-muted block mb-1">Daily Hold Fee ($)</label>
                                                            <input
                                                                type="number"
                                                                step="any"
                                                                className="w-full bg-brand-surface border border-brand-border rounded px-2 py-1 text-sm text-brand-text"
                                                                value={editEventData.holdFee}
                                                                onChange={e => setEditEventData({ ...editEventData, holdFee: e.target.value })}
                                                                placeholder="0.00"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] text-brand-text-muted block mb-1">Warning / Reason</label>
                                                            <input
                                                                type="text"
                                                                className="w-full bg-brand-surface border border-brand-border rounded px-2 py-1 text-sm text-brand-text"
                                                                value={editEventData.holdReason}
                                                                onChange={e => setEditEventData({ ...editEventData, holdReason: e.target.value })}
                                                                placeholder="Reason"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                                <div>
                                                    <label className="text-xs text-brand-text-muted block mb-1">Description</label>
                                                    <textarea
                                                        rows={2}
                                                        className="w-full bg-brand-surface border border-brand-border rounded px-2 py-1 text-sm text-brand-text resize-none"
                                                        value={editEventData.description}
                                                        onChange={e => setEditEventData({ ...editEventData, description: e.target.value })}
                                                    />
                                                </div>
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => setEditingEventId(null)}
                                                        className="p-1 hover:bg-brand-border rounded text-brand-text-muted hover:text-brand-text"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleSaveEvent(event.id)}
                                                        className="p-1 hover:bg-blue-500/20 rounded text-blue-500 hover:text-blue-400"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className={`space-y-1 relative ${event.isDeleted ? 'opacity-50 grayscale' : ''}`}>
                                                <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`font-semibold text-sm sm:text-base break-words ${event.isDeleted ? 'line-through text-slate-500' : getStatusStyles(event.status).replace('bg-', 'data-').split(' ')[1]}`}>
                                                            {event.status} - {event.location || 'No Location'}
                                                            {event.isDeleted && <span className="ml-2 text-xs font-bold text-red-500 uppercase">Deleted</span>}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-1 sm:opacity-40 sm:group-hover:opacity-100 sm:focus-within:opacity-100 transition-opacity print:hidden shrink-0 bg-brand-bg/50 rounded-lg p-0.5 sm:bg-transparent">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleResendEmail(event.id); }}
                                                            disabled={sendingEmailId === event.id}
                                                            className="p-2 hover:bg-brand-bg rounded-lg text-brand-text-muted hover:text-green-500 disabled:opacity-50 transition-colors"
                                                            title="Resend Email"
                                                        >
                                                            {sendingEmailId === event.id ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <Mail className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleEditEventClick(event); }}
                                                            disabled={isLocked}
                                                            className={`p-2 hover:bg-brand-bg rounded-lg text-brand-text-muted hover:text-blue-500 transition-colors ${isLocked ? 'opacity-40 cursor-not-allowed' : ''}`}
                                                            title="Edit Event"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        {event.isDeleted ? (
                                                            <>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleRestoreEvent(event.id); }}
                                                                    disabled={isLocked}
                                                                    className={`p-2 hover:bg-brand-bg rounded-lg text-brand-text-muted hover:text-green-500 transition-colors ${isLocked ? 'opacity-40 cursor-not-allowed' : ''}`}
                                                                    title="Restore Event"
                                                                >
                                                                    <RotateCcw className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleDeleteEvent(event.id, true); }}
                                                                    disabled={isLocked}
                                                                    className={`p-2 hover:bg-brand-bg rounded-lg text-brand-text-muted hover:text-red-700 transition-colors ${isLocked ? 'opacity-40 cursor-not-allowed' : ''}`}
                                                                    title="Permanently Delete"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleDeleteEvent(event.id); }}
                                                                disabled={isLocked}
                                                                className={`p-2 hover:bg-brand-bg rounded-lg text-brand-text-muted hover:text-red-500 transition-colors ${isLocked ? 'opacity-40 cursor-not-allowed' : ''}`}
                                                                title="Delete Event"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                {event.status === 'ON_HOLD' && ((event.holdFee && event.holdFee > 0) || event.holdReason) && (
                                                    <div className="mt-1.5 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-500 text-xs max-w-sm">
                                                        <p className="font-bold flex items-center gap-1">
                                                            ⚠️ Hold Charge: ${event.holdFee || 0}/day
                                                        </p>
                                                        {event.holdReason && <p className="mt-0.5 text-brand-text-muted">{event.holdReason}</p>}
                                                    </div>
                                                )}
                                                <p className="text-brand-text-muted text-sm print:text-gray-500">{event.description}</p>
                                                <p className="text-brand-text-muted/60 text-xs print:text-gray-400"><FormattedDate date={event.timestamp} /></p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="xl:col-span-3 order-2 xl:order-3 print:hidden space-y-6">
                    {/* Vehicle Selection Box */}
                    <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-xl">
                        <h3 className="text-lg font-bold text-brand-text mb-4">Vehicle Type</h3>
                        <select
                            className="w-full bg-brand-surface border border-brand-border rounded-lg px-3 py-2 text-brand-text outline-none focus:ring-1 focus:ring-blue-500"
                            value={liveVehicleType}
                            onChange={e => handleVehicleChange(e.target.value)}
                        >
                            <option value="TRUCK">🚚 Truck</option>
                            <option value="SHIP">🚢 Ship</option>
                            <option value="PLANE">✈️ Airplane</option>
                            <option value="VAN">🚐 Van</option>
                            <option value="TRAIN">🚆 Train</option>
                        </select>
                    </div>

                    {/* Update Event Form */}
                    <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-xl sticky top-6">
                        <h3 className="text-lg font-bold text-brand-text mb-4">Add Tracking Event</h3>
                        
                        {shipment.status === 'ON_HOLD' && !shipment.holdHidden && (
                            <div className="mb-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl space-y-2">
                                <p className="text-xs text-orange-400 font-medium">
                                    ⚠️ Updates are locked because the package is currently on hold. Clear the hold, hide it, or override to proceed.
                                </p>
                                <label className="flex items-center gap-2 cursor-pointer text-xs text-brand-text font-semibold select-none">
                                    <input
                                        type="checkbox"
                                        checked={overrideHold}
                                        onChange={(e) => setOverrideHold(e.target.checked)}
                                        className="rounded border-brand-border bg-brand-surface text-orange-500 focus:ring-orange-500 focus:ring-offset-0 focus:ring-0"
                                    />
                                    Override hold restriction
                                </label>
                            </div>
                        )}

                        <form onSubmit={handleUpdate} className="space-y-4">
                            <fieldset disabled={isLocked} className="space-y-4 disabled:opacity-50">
                                <div className="space-y-2">
                                    <label className="text-sm text-brand-text-muted">New Status</label>
                                    <select
                                        className="w-full bg-brand-surface border border-brand-border rounded-lg px-3 py-2 text-brand-text outline-none focus:ring-1 focus:ring-blue-500"
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="PENDING">PENDING</option>
                                        <option value="IN_TRANSIT">IN TRANSIT</option>
                                        <option value="ON_HOLD">ON HOLD</option>
                                        <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                                        <option value="DELIVERED">DELIVERED</option>
                                        <option value="RETURNED">RETURNED</option>
                                    </select>
                                </div>

                                {formData.status === 'ON_HOLD' && (
                                    <div className="grid grid-cols-2 gap-3 p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                                        <div className="space-y-1">
                                            <label className="text-xs text-brand-text-muted">Daily Hold Fee ($)</label>
                                            <input
                                                type="number"
                                                step="any"
                                                className="w-full bg-brand-surface border border-brand-border rounded px-2.5 py-1.5 text-sm text-brand-text outline-none focus:ring-1 focus:ring-blue-500"
                                                value={formData.holdFee}
                                                onChange={e => setFormData({ ...formData, holdFee: e.target.value })}
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs text-brand-text-muted">Warning Reason</label>
                                            <input
                                                type="text"
                                                className="w-full bg-brand-surface border border-brand-border rounded px-2.5 py-1.5 text-sm text-brand-text outline-none focus:ring-1 focus:ring-blue-500"
                                                value={formData.holdReason}
                                                onChange={e => setFormData({ ...formData, holdReason: e.target.value })}
                                                placeholder="Hold reason"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-sm text-brand-text-muted">Date/Time</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full bg-brand-surface border border-brand-border rounded-lg px-3 py-2 text-brand-text outline-none focus:ring-1 focus:ring-blue-500"
                                        value={formData.timestamp}
                                        onChange={e => setFormData({ ...formData, timestamp: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm text-brand-text-muted">Location</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-brand-text-muted" />
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Distribution Center, NY"
                                            className="w-full bg-brand-surface border border-brand-border rounded-lg pl-9 pr-10 py-2 text-brand-text outline-none focus:ring-1 focus:ring-blue-500"
                                            value={formData.location}
                                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleGeocode('event')}
                                            disabled={geocoding === 'event'}
                                            className="absolute right-2 top-2.5 p-1 text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
                                            title="Auto-find coordinates"
                                        >
                                            {geocoding === 'event' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <label className="text-sm text-slate-400">Latitude</label>
                                        <input
                                            type="number"
                                            step="any"
                                            placeholder="e.g. 40.7128"
                                            className="w-full bg-brand-surface border border-brand-border rounded-lg px-3 py-2 text-brand-text outline-none focus:ring-1 focus:ring-blue-500"
                                            value={formData.latitude}
                                            onChange={e => setFormData({ ...formData, latitude: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-slate-400">Longitude</label>
                                        <input
                                            type="number"
                                            step="any"
                                            placeholder="e.g. -74.0060"
                                            className="w-full bg-brand-surface border border-brand-border rounded-lg px-3 py-2 text-brand-text outline-none focus:ring-1 focus:ring-blue-500"
                                            value={formData.longitude}
                                            onChange={e => setFormData({ ...formData, longitude: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm text-slate-400">Description / Note</label>
                                    <textarea
                                        rows={3}
                                        className="w-full bg-brand-surface border border-brand-border rounded-lg px-3 py-2 text-brand-text outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                                        placeholder="e.g. Package arrived at facility"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <hr className="border-brand-border/50" />
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-blue-400 uppercase tracking-wider text-[10px]">Final Destination Coords (Optional)</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-brand-text-muted">Dest. Lat</label>
                                            <input
                                                type="number"
                                                step="any"
                                                placeholder="e.g. 40.7128"
                                                className="w-full bg-brand-surface border border-brand-border rounded-lg px-3 py-1.5 text-brand-text outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                                                value={formData.destLat}
                                                onChange={e => setFormData({ ...formData, destLat: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-brand-text-muted">Dest. Lng</label>
                                            <input
                                                type="number"
                                                step="any"
                                                placeholder="e.g. -74.0060"
                                                className="w-full bg-brand-surface border border-brand-border rounded-lg px-3 py-1.5 text-brand-text outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                                                value={formData.destLng}
                                                onChange={e => setFormData({ ...formData, destLng: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={updating}
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 flex justify-center items-center"
                                >
                                    {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Status'}
                                </button>
                            </fieldset>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Printer, MapPin, Loader2, CheckCircle2, Clock, Pencil, X, Check, FileText, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import dynamic from 'next/dynamic';
import ShippingLabelPDF from '@/components/pdf/ShippingLabelPDF';
import ShipmentChat from './ShipmentChat';
import FormattedDate from '@/components/FormattedDate';

const PDFDownloadLink = dynamic(
    () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
    {
        ssr: false,
        loading: () => <button className="flex items-center px-4 py-2 bg-blue-600/50 text-white rounded-xl">Loading...</button>,
    }
);

export default function ShipmentDetailsClient({ shipment }: { shipment: any }) {
    const router = useRouter();
    const [updating, setUpdating] = useState(false);
    const [formData, setFormData] = useState({
        status: 'IN_TRANSIT',
        location: '',
        description: '',
        latitude: '',
        longitude: '',
        timestamp: ''
    });

    useEffect(() => {
        setFormData(prev => ({ ...prev, timestamp: new Date().toISOString().slice(0, 16) }));
    }, []);


    // Event Edit State
    const [editingEventId, setEditingEventId] = useState<string | null>(null);
    const [editEventData, setEditEventData] = useState({
        status: '',
        location: '',
        description: '',
        timestamp: '',
        latitude: '',
        longitude: ''
    });

    const handleEditEventClick = (event: any) => {
        setEditingEventId(event.id);
        setEditEventData({
            status: event.status,
            location: event.location,
            description: event.description || '',
            timestamp: new Date(event.timestamp).toISOString().slice(0, 16),
            latitude: event.latitude || '',
            longitude: event.longitude || ''
        });
    };

    const handleSaveEvent = async (eventId: string) => {
        try {
            const res = await fetch(`/api/shipments/${shipment.id}/event/${eventId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...editEventData,
                    timestamp: new Date(editEventData.timestamp + ':00Z').toISOString()
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
    const [editData, setEditData] = useState({
        createdAt: new Date(shipment.createdAt).toISOString().slice(0, 16),
        origin: shipment.origin || '',
        destination: shipment.destination || '',
        customerEmail: shipment.customerEmail || '',
        productDescription: shipment.productDescription || '',
        imageUrls: shipment.imageUrls || []
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
                    imageUrls: editData.imageUrls
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
            case 'PENDING': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'IN_TRANSIT': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
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
            case 'PENDING': return 'bg-yellow-500 border-yellow-500';
            case 'IN_TRANSIT': return 'bg-blue-500 border-blue-500';
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
        setUpdating(true);
        try {
            const res = await fetch(`/api/shipments/${shipment.id}/event`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    timestamp: new Date(formData.timestamp + ':00Z').toISOString()
                })
            });
            if (res.ok) {
                setFormData({
                    status: 'IN_TRANSIT',
                    location: '',
                    description: '',
                    latitude: '',
                    longitude: '',
                    timestamp: new Date().toISOString().slice(0, 16)
                });
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




    return (
        <div className="space-y-6 max-w-[1600px] mx-auto p-6">
            <div className="flex items-center justify-between print:hidden">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-slate-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                </button>
                <div className="flex gap-3">
                    <PDFDownloadLink
                        document={<ShippingLabelPDF shipment={shipment} />}
                        fileName={`LABEL-${shipment.trackingNumber}.pdf`}
                        className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-lg shadow-blue-500/20"
                    >
                        {/* @ts-ignore */}
                        {({ loading }) => (
                            <>
                                <FileText className="w-5 h-5 mr-2" />
                                {loading ? 'Preparing...' : 'Download Label'}
                            </>
                        )}
                    </PDFDownloadLink>
                    <button
                        onClick={() => window.print()}
                        className="flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all border border-slate-700"
                    >
                        <Printer className="w-5 h-5 mr-2" />
                        Print Details
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                {/* Left Column: Chat - Sticky */}
                <div className="xl:col-span-3 order-3 xl:order-1 print:hidden">
                    <div className="sticky top-6">
                        <ShipmentChat shipmentId={shipment.id} />
                    </div>
                </div>

                {/* Middle Column: Details & Visual */}
                <div className="xl:col-span-6 space-y-6 order-1 xl:order-2 print:col-span-12 print:w-full">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl print:shadow-none print:border-black print:bg-white print:text-black">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-white print:text-black">{shipment.trackingNumber}</h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="text-slate-400 print:text-gray-600">Created on <FormattedDate date={shipment.createdAt} mode="date" /></p>
                                    <button
                                        onClick={() => setIsEditing(!isEditing)}
                                        className="text-xs text-blue-400 hover:text-blue-300 print:hidden"
                                    >
                                        {isEditing ? 'Cancel Edit' : 'Edit Details'}
                                    </button>
                                </div>

                                {isEditing && (
                                    <form onSubmit={handleEditSubmit} className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700 space-y-3 max-w-md print:hidden">
                                        <div>
                                            <label className="text-xs text-slate-400 block mb-1">Creation Date</label>
                                            <input
                                                type="datetime-local"
                                                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-white"
                                                value={editData.createdAt}
                                                onChange={e => setEditData({ ...editData, createdAt: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400 block mb-1">Origin</label>
                                            <input
                                                type="text"
                                                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-white"
                                                value={editData.origin}
                                                onChange={e => setEditData({ ...editData, origin: e.target.value })}
                                                placeholder="Origin location"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400 block mb-1">Destination</label>
                                            <input
                                                type="text"
                                                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-white"
                                                value={editData.destination}
                                                onChange={e => setEditData({ ...editData, destination: e.target.value })}
                                                placeholder="Destination location"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400 block mb-1">Customer Email</label>
                                            <input
                                                type="email"
                                                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-white"
                                                value={editData.customerEmail}
                                                onChange={e => setEditData({ ...editData, customerEmail: e.target.value })}
                                                placeholder="customer@example.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400 block mb-1">Product Description</label>
                                            <textarea
                                                rows={3}
                                                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-white resize-none"
                                                value={editData.productDescription}
                                                onChange={e => setEditData({ ...editData, productDescription: e.target.value })}
                                                placeholder="Describe the shipment contents..."
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400 block mb-1">Upload Images</label>
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

                                                        e.target.value = ''; // Reset input
                                                        const toastId = toast.loading(`Uploading ${files.length} images...`);

                                                        try {
                                                            const uploadPromises = files.map(async (file) => {
                                                                try {
                                                                    const response = await fetch(
                                                                        `/api/upload?filename=${encodeURIComponent(file.name)}`,
                                                                        {
                                                                            method: 'POST',
                                                                            body: file,
                                                                        },
                                                                    );
                                                                    if (!response.ok) {
                                                                        const errorText = await response.text();
                                                                        throw new Error(errorText || response.statusText);
                                                                    }
                                                                    const newBlob = await response.json();
                                                                    return newBlob.url;
                                                                } catch (err) {
                                                                    console.error(`Failed to upload ${file.name}`, err);
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
                                                                toast.success(`Successfully uploaded ${successUrls.length} images`, { id: toastId });
                                                            } else {
                                                                // Show the error from the first failed promise if any
                                                                toast.error('Upload failed. Check console for details.', { id: toastId });
                                                            }
                                                        } catch (err: any) {
                                                            console.error(err);
                                                            toast.error(`Error: ${err.message}`, { id: toastId });
                                                        }
                                                    }}
                                                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-white file:mr-4 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-500/10 file:text-blue-500 hover:file:bg-blue-500/20"
                                                />
                                                {/* Preview / Remove List */}
                                                {editData.imageUrls.length > 0 && (
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {editData.imageUrls.map((url: string, i: number) => (
                                                            <div key={i} className="relative group aspect-square bg-slate-900 rounded-md overflow-hidden border border-slate-700">
                                                                {/* eslint-disable-next-line @next/next/no-img-element */}
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
                                        <div className="flex gap-2">
                                            <button type="submit" className="bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-500">Save Changes</button>
                                        </div>
                                    </form>
                                )}
                            </div>
                            <div className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${getStatusStyles(shipment.status)} print:border-black print:bg-transparent print:text-black`}>
                                {shipment.status}
                            </div>
                        </div>

                        {/* Route Info */}
                        <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-slate-800 print:border-gray-200">
                            <div>
                                <p className="text-slate-500 text-sm font-medium uppercase mb-1">From</p>
                                <p className="text-white text-lg font-semibold print:text-black">{shipment.origin}</p>
                                <p className="text-slate-400 text-sm print:text-gray-600">{shipment.senderInfo}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-slate-500 text-sm font-medium uppercase mb-1">To</p>
                                <p className="text-white text-lg font-semibold print:text-black">{shipment.destination}</p>
                                <p className="text-slate-400 text-sm print:text-gray-600">{shipment.receiverInfo}</p>
                            </div>
                        </div>

                        {/* Product Details */}
                        {(shipment.productDescription || (shipment.imageUrls && shipment.imageUrls.length > 0)) && (
                            <div className="mb-8 pb-8 border-b border-slate-800 print:border-gray-200">
                                <h3 className="text-white font-semibold mb-4 print:text-black">Product Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {shipment.productDescription && (
                                        <div>
                                            <p className="text-slate-500 text-sm font-medium uppercase mb-2">Description</p>
                                            <p className="text-slate-300 print:text-black whitespace-pre-wrap">{shipment.productDescription}</p>
                                        </div>
                                    )}
                                    {shipment.imageUrls && shipment.imageUrls.length > 0 && (
                                        <div>
                                            <p className="text-slate-500 text-sm font-medium uppercase mb-2">Attached Images</p>
                                            <div className="grid grid-cols-3 gap-2">
                                                {shipment.imageUrls.map((url: string, i: number) => (
                                                    <a key={i} href={url} target="_blank" rel="noreferrer" className="block aspect-square bg-slate-800 rounded-lg overflow-hidden border border-slate-700 hover:border-blue-500 transition-colors relative group">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img src={url} alt={`Product ${i + 1}`} className="w-full h-full object-cover" />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Timeline */}
                        <div>
                            <h3 className="text-white font-semibold mb-6 print:text-black">Tracking History</h3>
                            <div className="relative pl-4 border-l-2 border-slate-800 space-y-8 print:border-gray-300">
                                {shipment.events.map((event: any, index: number) => (
                                    <div key={event.id} className="relative pl-6 group">
                                        <div className={`absolute -left-[21px] top-1 w-4 h-4 rounded-full border-2 ${getTimelineDotColor(event.status)} print:border-black print:bg-black`}></div>

                                        {editingEventId === event.id ? (
                                            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 space-y-3">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="text-xs text-slate-400 block mb-1">Status</label>
                                                        <select
                                                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-white"
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
                                                        <label className="text-xs text-slate-400 block mb-1">Time</label>
                                                        <input
                                                            type="datetime-local"
                                                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-white"
                                                            value={editEventData.timestamp}
                                                            onChange={e => setEditEventData({ ...editEventData, timestamp: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-xs text-slate-400 block mb-1">Location</label>
                                                    <input
                                                        type="text"
                                                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-white"
                                                        value={editEventData.location}
                                                        onChange={e => setEditEventData({ ...editEventData, location: e.target.value })}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="text-xs text-slate-400 block mb-1">Latitude</label>
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-white"
                                                            value={editEventData.latitude}
                                                            onChange={e => setEditEventData({ ...editEventData, latitude: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-slate-400 block mb-1">Longitude</label>
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-white"
                                                            value={editEventData.longitude}
                                                            onChange={e => setEditEventData({ ...editEventData, longitude: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-xs text-slate-400 block mb-1">Description</label>
                                                    <textarea
                                                        rows={2}
                                                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-white resize-none"
                                                        value={editEventData.description}
                                                        onChange={e => setEditEventData({ ...editEventData, description: e.target.value })}
                                                    />
                                                </div>
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => setEditingEventId(null)}
                                                        className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleSaveEvent(event.id)}
                                                        className="p-1 hover:bg-blue-500/20 rounded text-blue-400 hover:text-blue-300"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-1 relative">
                                                <div className="flex justify-between items-start">
                                                    <p className={`font-medium ${getStatusStyles(event.status).replace('bg-', 'data-').split(' ')[1]} print:text-black`}>
                                                        {event.status} - {event.location || 'No Location'}
                                                    </p>
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                                                        <button
                                                            onClick={() => handleEditEventClick(event)}
                                                            className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-blue-400"
                                                            title="Edit Event"
                                                        >
                                                            <Pencil className="w-3 h-3" />
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                if (!confirm('Delete this tracking event? This cannot be undone.')) return;
                                                                try {
                                                                    const res = await fetch(`/api/shipments/${shipment.id}/event/${event.id}`, { method: 'DELETE' });
                                                                    if (res.ok) {
                                                                        toast.success('Event deleted');
                                                                        router.refresh();
                                                                    } else {
                                                                        toast.error('Failed to delete');
                                                                    }
                                                                } catch (e) {
                                                                    console.error(e);
                                                                    toast.error('Error deleting event');
                                                                }
                                                            }}
                                                            className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-red-400"
                                                            title="Delete Event"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="text-slate-400 text-sm print:text-gray-500">{event.description}</p>
                                                <p className="text-slate-500 text-xs print:text-gray-400"><FormattedDate date={event.timestamp} /></p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Update Form */}
                <div className="xl:col-span-3 order-2 xl:order-3 print:hidden">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl sticky top-6">
                        <h3 className="text-lg font-bold text-white mb-4">Update Status</h3>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm text-slate-400">New Status</label>
                                <select
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:ring-1 focus:ring-blue-500"
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

                            <div className="space-y-2">
                                <label className="text-sm text-slate-400">Date/Time</label>
                                <input
                                    type="datetime-local"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:ring-1 focus:ring-blue-500"
                                    value={formData.timestamp}
                                    onChange={e => setFormData({ ...formData, timestamp: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-slate-400">Location</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Distribution Center, NY"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white outline-none focus:ring-1 focus:ring-blue-500"
                                        value={formData.location}
                                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <label className="text-sm text-slate-400">Latitude</label>
                                    <input
                                        type="number"
                                        step="any"
                                        placeholder="e.g. 40.7128"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:ring-1 focus:ring-blue-500"
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
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:ring-1 focus:ring-blue-500"
                                        value={formData.longitude}
                                        onChange={e => setFormData({ ...formData, longitude: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-slate-400">Description / Note</label>
                                <textarea
                                    rows={3}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                                    placeholder="e.g. Package arrived at facility"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={updating}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 flex justify-center items-center"
                            >
                                {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Status'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

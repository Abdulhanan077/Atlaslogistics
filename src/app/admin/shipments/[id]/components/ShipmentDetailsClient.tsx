'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Printer, MapPin, Loader2, CheckCircle2, Clock } from 'lucide-react';

export default function ShipmentDetailsClient({ shipment }: { shipment: any }) {
    const router = useRouter();
    const [updating, setUpdating] = useState(false);
    const [formData, setFormData] = useState({
        status: 'IN_TRANSIT',
        location: '',
        description: '',
        timestamp: new Date().toISOString().slice(0, 16) // Default to now, format YYYY-MM-DDTHH:mm
    });

    // Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        createdAt: new Date(shipment.createdAt).toISOString().slice(0, 16),
        origin: shipment.origin || '',
        destination: shipment.destination || ''
    });

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/shipments/${shipment.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    createdAt: new Date(editData.createdAt).toISOString(),
                    origin: editData.origin,
                    destination: editData.destination
                })
            });
            if (res.ok) {
                setIsEditing(false);
                router.refresh();
            } else {
                alert('Failed to update shipment details');
            }
        } catch (e) {
            console.error(e);
            alert('Error updating');
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'IN_TRANSIT': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'PAUSED': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
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
            case 'PAUSED': return 'bg-orange-500 border-orange-500';
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
                    timestamp: new Date(formData.timestamp).toISOString()
                })
            });
            if (res.ok) {
                setFormData({
                    status: 'IN_TRANSIT',
                    location: '',
                    description: '',
                    timestamp: new Date().toISOString().slice(0, 16)
                });
                router.refresh();
            } else {
                alert('Failed to update');
            }
        } catch (e) {
            console.error(e);
            alert('Error updating');
        } finally {
            setUpdating(false);
        }
    };


    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this shipment? This action cannot be undone.')) return;

        try {
            const res = await fetch(`/api/shipments/${shipment.id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                router.push('/admin/dashboard');
                router.refresh();
            } else {
                alert('Failed to delete shipment');
            }
        } catch (e) {
            console.error(e);
            alert('Error deleting shipment');
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between print:hidden">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-slate-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                </button>
                <div className="flex gap-3">
                    <button
                        onClick={() => window.print()}
                        className="flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all border border-slate-700"
                    >
                        <Printer className="w-5 h-5 mr-2" />
                        Print Details
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Details & Visual */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl print:shadow-none print:border-black print:bg-white print:text-black">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-white print:text-black">{shipment.trackingNumber}</h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="text-slate-400 print:text-gray-600">Created on {new Date(shipment.createdAt).toLocaleDateString()}</p>
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
                                        <div className="flex gap-2">
                                            <button className="bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-500">Save Changes</button>
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

                        {/* Timeline */}
                        <div>
                            <h3 className="text-white font-semibold mb-6 print:text-black">Tracking History</h3>
                            <div className="relative pl-4 border-l-2 border-slate-800 space-y-8 print:border-gray-300">
                                {shipment.events.map((event: any, index: number) => (
                                    <div key={event.id} className="relative pl-6">
                                        <div className={`absolute -left-[21px] top-1 w-4 h-4 rounded-full border-2 ${getTimelineDotColor(event.status)} print:border-black print:bg-black`}></div>
                                        <div className="space-y-1">
                                            <p className={`font-medium ${getStatusStyles(event.status).replace('bg-', 'data-').split(' ')[1]} print:text-black`}>
                                                {event.status} - {event.location || 'No Location'}
                                            </p>
                                            <p className="text-slate-400 text-sm print:text-gray-500">{event.description}</p>
                                            <p className="text-slate-500 text-xs print:text-gray-400">{new Date(event.timestamp).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Update Form (Hidden on Print) */}
                <div className="print:hidden space-y-6">
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
                                    <option value="PAUSED">PAUSED</option>
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

'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

export default function CreateShipmentModal({ onClose }: { onClose: () => void }) {
    const [formData, setFormData] = useState({
        senderInfo: '',
        receiverInfo: '',
        origin: '',
        destination: '',
        estimatedDelivery: '',
        createdAt: new Date().toISOString().slice(0, 16) // Default to now
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/shipments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                onClose();
            } else {
                alert('Failed to create shipment');
            }
        } catch (error) {
            console.error(error);
            alert('Error creating shipment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900">
                    <h2 className="text-xl font-bold text-white">New Shipment</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Sender Info</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-blue-500 outline-none"
                                value={formData.senderInfo}
                                onChange={e => setFormData({ ...formData, senderInfo: e.target.value })}
                                placeholder="Name, Address"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Receiver Info</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-blue-500 outline-none"
                                value={formData.receiverInfo}
                                onChange={e => setFormData({ ...formData, receiverInfo: e.target.value })}
                                placeholder="Name, Address"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Origin</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-blue-500 outline-none"
                                value={formData.origin}
                                onChange={e => setFormData({ ...formData, origin: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Destination</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-blue-500 outline-none"
                                value={formData.destination}
                                onChange={e => setFormData({ ...formData, destination: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">Created Date (Optional)</label>
                        <input
                            type="datetime-local"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-blue-500 outline-none"
                            value={formData.createdAt}
                            onChange={e => setFormData({ ...formData, createdAt: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">Estimated Delivery</label>
                        <input
                            type="date"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-blue-500 outline-none"
                            value={formData.estimatedDelivery}
                            onChange={e => setFormData({ ...formData, estimatedDelivery: e.target.value })}
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg disabled:opacity-50 flex items-center"
                        >
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Create Shipment
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

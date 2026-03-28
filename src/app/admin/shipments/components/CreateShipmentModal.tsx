'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { parseShipmentInfo } from '@/lib/utils';

export default function CreateShipmentModal({ onClose, initialData }: { onClose: () => void, initialData?: any }) {
    const sender = initialData ? parseShipmentInfo(initialData.senderInfo) : null;
    const receiver = initialData ? parseShipmentInfo(initialData.receiverInfo) : null;

    const getInitialDateString = () => {
        const d = initialData?.createdAt ? new Date(initialData.createdAt) : new Date();
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().slice(0, 16);
    };

    const getInitialImageUrls = () => {
        if (!initialData?.imageUrls) return [];
        if (Array.isArray(initialData.imageUrls)) return initialData.imageUrls;
        try {
            return JSON.parse(initialData.imageUrls);
        } catch {
            return [];
        }
    };

    const [formData, setFormData] = useState({
        senderName: sender?.name || '',
        senderPhone: sender?.phone || '',
        senderAddress: sender?.address || '',
        receiverName: receiver?.name || '',
        receiverPhone: receiver?.phone || '',
        receiverAddress: receiver?.address || '',
        origin: initialData?.origin || '',
        destination: initialData?.destination || '',
        customerEmail: initialData?.customerEmail || '',
        estimatedDelivery: initialData?.estimatedDelivery ? new Date(initialData.estimatedDelivery).toISOString().split('T')[0] : '',
        productDescription: initialData?.productDescription || '',
        imageUrls: getInitialImageUrls(),
        createdAt: getInitialDateString()
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            senderInfo: JSON.stringify({
                name: formData.senderName,
                phone: formData.senderPhone,
                address: formData.senderAddress
            }),
            receiverInfo: JSON.stringify({
                name: formData.receiverName,
                phone: formData.receiverPhone,
                address: formData.receiverAddress
            }),
            origin: formData.origin,
            destination: formData.destination,
            customerEmail: formData.customerEmail,
            estimatedDelivery: formData.estimatedDelivery,
            productDescription: formData.productDescription,
            imageUrls: formData.imageUrls,
            createdAt: formData.createdAt
        };

        try {
            const res = await fetch('/api/shipments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success('Shipment created successfully');
                onClose();
            } else {
                toast.error('Failed to create shipment');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error creating shipment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-bg/80 backdrop-blur-sm overflow-y-auto">
            <div className="w-full max-w-3xl bg-brand-surface border border-brand-border/50 rounded-2xl shadow-2xl overflow-hidden my-8">
                <div className="flex items-center justify-between p-6 border-b border-brand-border bg-brand-surface sticky top-0 z-10">
                    <h2 className="text-xl font-bold text-brand-text">{initialData ? 'Clone Shipment' : 'New Shipment'}</h2>
                    <button onClick={onClose} className="text-brand-text-muted hover:text-brand-text transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                    {/* Sender & Receiver Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Sender */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Sender Info</h3>
                            <div className="space-y-3">
                                <input type="text" required placeholder="Full Name" className="w-full bg-brand-bg border border-brand-border/50 rounded-lg px-3 py-2 text-brand-text focus:ring-1 focus:ring-blue-500 outline-none" value={formData.senderName} onChange={e => setFormData({ ...formData, senderName: e.target.value })} />
                                <input type="text" placeholder="Phone Number" className="w-full bg-brand-bg border border-brand-border/50 rounded-lg px-3 py-2 text-brand-text focus:ring-1 focus:ring-blue-500 outline-none" value={formData.senderPhone} onChange={e => setFormData({ ...formData, senderPhone: e.target.value })} />
                                <textarea required rows={2} placeholder="Full Address" className="w-full bg-brand-bg border border-brand-border/50 rounded-lg px-3 py-2 text-brand-text focus:ring-1 focus:ring-blue-500 outline-none resize-none" value={formData.senderAddress} onChange={e => setFormData({ ...formData, senderAddress: e.target.value })} />
                            </div>
                        </div>

                        {/* Receiver */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Receiver Info</h3>
                            <div className="space-y-3">
                                <input type="text" required placeholder="Full Name" className="w-full bg-brand-bg border border-brand-border/50 rounded-lg px-3 py-2 text-brand-text focus:ring-1 focus:ring-blue-500 outline-none" value={formData.receiverName} onChange={e => setFormData({ ...formData, receiverName: e.target.value })} />
                                <input type="text" placeholder="Phone Number" className="w-full bg-brand-bg border border-brand-border/50 rounded-lg px-3 py-2 text-brand-text focus:ring-1 focus:ring-blue-500 outline-none" value={formData.receiverPhone} onChange={e => setFormData({ ...formData, receiverPhone: e.target.value })} />
                                <textarea required rows={2} placeholder="Full Address" className="w-full bg-brand-bg border border-brand-border/50 rounded-lg px-3 py-2 text-brand-text focus:ring-1 focus:ring-blue-500 outline-none resize-none" value={formData.receiverAddress} onChange={e => setFormData({ ...formData, receiverAddress: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    <hr className="border-brand-border" />

                    {/* Routing Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-brand-text-muted">Origin</label>
                            <input type="text" required className="w-full bg-brand-surface border border-brand-border rounded-lg px-3 py-2 text-brand-text focus:ring-1 focus:ring-blue-500 outline-none" value={formData.origin} onChange={e => setFormData({ ...formData, origin: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-brand-text-muted">Destination</label>
                            <input type="text" required className="w-full bg-brand-surface border border-brand-border rounded-lg px-3 py-2 text-brand-text focus:ring-1 focus:ring-blue-500 outline-none" value={formData.destination} onChange={e => setFormData({ ...formData, destination: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-brand-text-muted">Customer Email (Optional)</label>
                            <input type="email" className="w-full bg-brand-surface border border-brand-border rounded-lg px-3 py-2 text-brand-text focus:ring-1 focus:ring-blue-500 outline-none placeholder:text-brand-text-muted/30" value={formData.customerEmail} onChange={e => setFormData({ ...formData, customerEmail: e.target.value })} placeholder="Receives tracking updates" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-brand-text-muted">Estimated Delivery</label>
                            <input type="date" className="w-full bg-brand-surface border border-brand-border rounded-lg px-3 py-2 text-brand-text focus:ring-1 focus:ring-blue-500 outline-none" value={formData.estimatedDelivery} onChange={e => setFormData({ ...formData, estimatedDelivery: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-brand-text-muted">Creation Date (Optional)</label>
                            <input type="datetime-local" className="w-full bg-brand-surface border border-brand-border rounded-lg px-3 py-2 text-brand-text focus:ring-1 focus:ring-blue-500 outline-none" value={formData.createdAt} onChange={e => setFormData({ ...formData, createdAt: e.target.value })} />
                        </div>
                    </div>

                    <hr className="border-brand-border" />

                    {/* Product Details & Images */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-brand-text-muted">Product Description</label>
                            <textarea rows={3} className="w-full bg-brand-surface border border-brand-border rounded-lg px-3 py-2 text-brand-text focus:ring-1 focus:ring-blue-500 outline-none resize-none" placeholder="Describe the shipment contents..." value={formData.productDescription} onChange={e => setFormData({ ...formData, productDescription: e.target.value })} />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-brand-text-muted">Upload Images</label>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={async (e) => {
                                    if (!e.target.files?.length) return;
                                    const files = Array.from(e.target.files);
                                    e.target.value = ''; // Reset input
                                    const toastId = toast.loading(`Uploading ${files.length} images...`);

                                    try {
                                        const uploadPromises = files.map(async (file) => {
                                            try {
                                                const response = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, { method: 'POST', body: file });
                                                if (!response.ok) {
                                                    throw new Error(await response.text() || response.statusText);
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
                                            setFormData(prev => ({ ...prev, imageUrls: [...prev.imageUrls, ...successUrls] }));
                                            toast.success(`Successfully uploaded ${successUrls.length} images`, { id: toastId });
                                        } else {
                                            toast.error('Upload failed. Check console for details.', { id: toastId });
                                        }
                                    } catch (err: any) {
                                        toast.error(`Error: ${err.message}`, { id: toastId });
                                    }
                                }}
                                className="w-full bg-brand-surface border border-brand-border rounded-lg px-3 py-2 text-sm text-brand-text-muted file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-500"
                            />
                            {/* Image Previews */}
                            {formData.imageUrls.length > 0 && (
                                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-2">
                                    {formData.imageUrls.map((url: string, i: number) => (
                                        <div key={i} className="relative group aspect-square bg-brand-bg rounded-md overflow-hidden border border-brand-border">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={url} alt="preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, imageUrls: prev.imageUrls.filter((_: any, idx: number) => idx !== i) }))}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-brand-border sticky bottom-0 bg-brand-surface pb-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-brand-text-muted hover:text-brand-text transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg disabled:opacity-50 flex items-center shadow-lg shadow-blue-500/20">
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Create Shipment
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

'use client';

import { useState } from 'react';
import { X, Loader2, Search } from 'lucide-react';
import { geocodeAddress } from '@/lib/geocoding';
import { toast } from 'react-hot-toast';
import { parseShipmentInfo } from '@/lib/utils';
import { uploadToR2 as upload } from '@/lib/upload-client';

interface ActiveUpload {
    id: string;
    fileName: string;
    progress: number;
    controller: AbortController;
}

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

    const getInitialVideoUrls = () => {
        if (!initialData?.videoUrls) return [];
        if (Array.isArray(initialData.videoUrls)) return initialData.videoUrls;
        try {
            return JSON.parse(initialData.videoUrls);
        } catch {
            return [];
        }
    };

    const [formData, setFormData] = useState({
        senderName: sender?.name || '',
        senderPhone: sender?.phone || '',
        senderAddress: sender?.address || '',
        vehicleType: sender?.vehicleType || 'TRUCK',
        receiverName: receiver?.name || '',
        receiverPhone: receiver?.phone || '',
        receiverAddress: receiver?.address || '',
        destLat: receiver?.destLat || '',
        destLng: receiver?.destLng || '',
        origin: initialData?.origin || '',
        destination: initialData?.destination || '',
        customerEmail: initialData?.customerEmail || '',
        estimatedDelivery: initialData?.estimatedDelivery ? new Date(initialData.estimatedDelivery).toISOString().split('T')[0] : '',
        productDescription: initialData?.productDescription || '',
        imageUrls: getInitialImageUrls(),
        videoUrls: getInitialVideoUrls(),
        originLat: sender?.originLat || '',
        originLng: sender?.originLng || '',
        createdAt: getInitialDateString(),
    });
    const [loading, setLoading] = useState(false);
    const [geocoding, setGeocoding] = useState(false);
    const [activeUploads, setActiveUploads] = useState<ActiveUpload[]>([]);

    const cancelUpload = (id: string) => {
        const upload = activeUploads.find(u => u.id === id);
        if (upload) {
            upload.controller.abort();
            setActiveUploads(prev => prev.filter(u => u.id !== id));
            toast.error(`Upload of ${upload.fileName} cancelled`);
        }
    };

    const handleGeocode = async (address: string, type: 'dest' | 'origin' = 'dest') => {
        if (!address) {
            toast.error("Please enter an address first");
            return;
        }
        setGeocoding(true);
        const result = await geocodeAddress(address);
        setGeocoding(false);
        if (result) {
            const country = result.display_name.split(',').pop()?.trim() || '';
            if (type === 'origin') {
                setFormData(prev => ({ 
                    ...prev, 
                    originLat: result.lat, 
                    originLng: result.lon,
                    origin: country || prev.origin
                }));
            } else {
                setFormData(prev => ({ 
                    ...prev, 
                    destLat: result.lat, 
                    destLng: result.lon,
                    destination: country || prev.destination
                }));
            }
            toast.success("Coordinates found!");
        } else {
            toast.error("Could not find coordinates for this address");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            senderInfo: JSON.stringify({
                name: formData.senderName,
                phone: formData.senderPhone,
                address: formData.senderAddress,
                vehicleType: formData.vehicleType,
                originLat: formData.originLat,
                originLng: formData.originLng
            }),
            receiverInfo: JSON.stringify({
                name: formData.receiverName,
                phone: formData.receiverPhone,
                address: formData.receiverAddress,
                destLat: formData.destLat,
                destLng: formData.destLng
            }),
            origin: formData.origin,
            destination: formData.destination,
            customerEmail: formData.customerEmail,
            estimatedDelivery: formData.estimatedDelivery,
            productDescription: formData.productDescription,
            imageUrls: formData.imageUrls,
            videoUrls: formData.videoUrls,
            createdAt: formData.createdAt,
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
                                <div className="relative">
                                    <textarea required rows={2} placeholder="Full Address" className="w-full bg-brand-bg border border-brand-border/50 rounded-lg px-3 py-2 text-brand-text focus:ring-1 focus:ring-blue-500 outline-none resize-none pr-10" value={formData.senderAddress} onChange={e => setFormData({ ...formData, senderAddress: e.target.value })} />
                                    <button
                                        type="button"
                                        onClick={() => handleGeocode(formData.senderAddress, 'origin')}
                                        disabled={geocoding}
                                        className="absolute right-2 top-2 p-1 text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
                                        title="Auto-find coordinates"
                                    >
                                        {geocoding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                    </button>
                                </div>
                                <select className="w-full bg-brand-bg border border-brand-border/50 rounded-lg px-3 py-2 text-brand-text focus:ring-1 focus:ring-blue-500 outline-none" value={formData.vehicleType} onChange={e => setFormData({ ...formData, vehicleType: e.target.value })}>
                                    <option value="TRUCK">🚚 Truck</option>
                                    <option value="SHIP">🚢 Ship</option>
                                    <option value="PLANE">✈️ Airplane</option>
                                    <option value="VAN">🚐 Van</option>
                                    <option value="TRAIN">🚆 Train</option>
                                </select>
                            </div>
                        </div>

                        {/* Receiver */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Receiver Info</h3>
                            <div className="space-y-3">
                                <input type="text" required placeholder="Full Name" className="w-full bg-brand-bg border border-brand-border/50 rounded-lg px-3 py-2 text-brand-text focus:ring-1 focus:ring-blue-500 outline-none" value={formData.receiverName} onChange={e => setFormData({ ...formData, receiverName: e.target.value })} />
                                <input type="text" placeholder="Phone Number" className="w-full bg-brand-bg border border-brand-border/50 rounded-lg px-3 py-2 text-brand-text focus:ring-1 focus:ring-blue-500 outline-none" value={formData.receiverPhone} onChange={e => setFormData({ ...formData, receiverPhone: e.target.value })} />
                                <div className="relative">
                                    <textarea required rows={2} placeholder="Full Address" className="w-full bg-brand-bg border border-brand-border/50 rounded-lg px-3 py-2 text-brand-text focus:ring-1 focus:ring-blue-500 outline-none resize-none pr-10" value={formData.receiverAddress} onChange={e => setFormData({ ...formData, receiverAddress: e.target.value })} />
                                    <button
                                        type="button"
                                        onClick={() => handleGeocode(formData.receiverAddress)}
                                        disabled={geocoding}
                                        className="absolute right-2 top-2 p-1 text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
                                        title="Auto-find coordinates"
                                    >
                                        {geocoding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr className="border-brand-border" />

                    {/* Routing Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-brand-text-muted">Origin</label>
                            <div className="relative">
                                <input type="text" required className="w-full bg-brand-surface border border-brand-border rounded-lg px-3 py-2 text-brand-text focus:ring-1 focus:ring-blue-500 outline-none mb-2 pr-10" value={formData.origin} onChange={e => setFormData({ ...formData, origin: e.target.value })} />
                                <button
                                    type="button"
                                    onClick={() => handleGeocode(formData.origin, 'origin')}
                                    disabled={geocoding}
                                    className="absolute right-2 top-2 p-1 text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
                                    title="Auto-find coordinates"
                                >
                                    {geocoding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <input type="number" step="any" placeholder="Orig. Latitude" className="w-full bg-brand-surface border border-brand-border rounded-lg px-3 py-2 text-brand-text focus:ring-1 focus:ring-blue-500 outline-none text-sm" value={formData.originLat} onChange={e => setFormData({ ...formData, originLat: e.target.value })} />
                                <input type="number" step="any" placeholder="Orig. Longitude" className="w-full bg-brand-surface border border-brand-border rounded-lg px-3 py-2 text-brand-text focus:ring-1 focus:ring-blue-500 outline-none text-sm" value={formData.originLng} onChange={e => setFormData({ ...formData, originLng: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-brand-text-muted">Destination</label>
                            <div className="relative">
                                <input type="text" required className="w-full bg-brand-surface border border-brand-border rounded-lg px-3 py-2 text-brand-text focus:ring-1 focus:ring-blue-500 outline-none mb-2 pr-10" value={formData.destination} onChange={e => setFormData({ ...formData, destination: e.target.value })} />
                                <button
                                    type="button"
                                    onClick={() => handleGeocode(formData.destination)}
                                    disabled={geocoding}
                                    className="absolute right-2 top-2 p-1 text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
                                    title="Auto-find coordinates"
                                >
                                    {geocoding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <input type="number" step="any" placeholder="Dest. Latitude" className="w-full bg-brand-surface border border-brand-border rounded-lg px-3 py-2 text-brand-text focus:ring-1 focus:ring-blue-500 outline-none text-sm" value={formData.destLat} onChange={e => setFormData({ ...formData, destLat: e.target.value })} />
                                <input type="number" step="any" placeholder="Dest. Longitude" className="w-full bg-brand-surface border border-brand-border rounded-lg px-3 py-2 text-brand-text focus:ring-1 focus:ring-blue-500 outline-none text-sm" value={formData.destLng} onChange={e => setFormData({ ...formData, destLng: e.target.value })} />
                            </div>
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
                                                    onUploadProgress: (progressEvent: any) => {
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
                                            setFormData(prev => ({ ...prev, imageUrls: [...prev.imageUrls, ...successUrls] }));
                                            toast.success(`Successfully uploaded ${successUrls.length} images`);
                                        }
                                    } catch (err: any) {
                                        console.error(err);
                                    }
                                }}
                                className="w-full bg-brand-surface border border-brand-border rounded-lg px-3 py-2 text-sm text-brand-text-muted file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-500"
                            />
                            {/* Active Uploads Progress */}
                            {activeUploads.length > 0 && (
                                <div className="space-y-2 mt-2">
                                    {activeUploads.map((upload) => (
                                        <div key={upload.id} className="bg-brand-bg p-2 rounded-lg border border-brand-border">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span>{upload.fileName}</span>
                                                <button onClick={() => cancelUpload(upload.id)} className="text-red-400 hover:text-red-300">Cancel</button>
                                            </div>
                                            <div className="w-full bg-brand-surface h-2 rounded-full overflow-hidden">
                                                <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${upload.progress}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
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

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-brand-text-muted">Upload Video Proof</label>
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
                                                    onUploadProgress: (progressEvent: any) => {
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
                                            setFormData(prev => ({ ...prev, videoUrls: [...prev.videoUrls, ...successUrls] }));
                                            toast.success(`Successfully uploaded ${successUrls.length} videos`);
                                        }
                                    } catch (err: any) {
                                        console.error(err);
                                    }
                                }}
                                className="w-full bg-brand-surface border border-brand-border rounded-lg px-3 py-2 text-sm text-brand-text-muted file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-500"
                            />
                            {/* Video Previews */}
                            {formData.videoUrls.length > 0 && (
                                <div className="grid grid-cols-1 gap-4 mt-2">
                                    {formData.videoUrls.map((url: string, i: number) => (
                                        <div key={i} className="relative group w-full aspect-video bg-brand-bg rounded-xl overflow-hidden border border-brand-border shadow-xl">
                                            <video src={url} controls className="w-full h-full object-contain bg-black" />
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, videoUrls: prev.videoUrls.filter((_: any, idx: number) => idx !== i) }))}
                                                className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-all z-10 shadow-lg scale-90 group-hover:scale-100"
                                            >
                                                <X className="w-5 h-5" />
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

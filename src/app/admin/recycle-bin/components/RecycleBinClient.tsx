'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Calendar, ArrowRight, RefreshCcw, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import FormattedDate from "@/components/FormattedDate";

export default function RecycleBinClient({ initialShipments }: { initialShipments: any[] }) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredShipments = initialShipments.filter(shipment => {
        return shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            shipment.receiverInfo.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const handleRestore = async (id: string) => {
        try {
            const res = await fetch(`/api/shipments/${id}/restore`, { method: 'PATCH' });
            if (res.ok) {
                toast.success('Shipment restored');
                router.refresh();
            } else {
                toast.error('Failed to restore shipment');
            }
        } catch (e) {
            console.error(e);
            toast.error('Error restoring shipment');
        }
    };

    const handleForceDelete = async (id: string) => {
        if (!confirm('WARNING: This will permanently delete the shipment and all its data. This cannot be undone. Area you sure?')) return;
        try {
            const res = await fetch(`/api/shipments/${id}/force-delete`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Shipment permanently deleted');
                router.refresh();
            } else {
                toast.error('Failed to permanently delete shipment');
            }
        } catch (e) {
            console.error(e);
            toast.error('Error permanently deleting shipment');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search deleted shipments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-white placeholder-slate-500 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-950/50 text-slate-400 text-sm font-medium">
                            <tr>
                                <th className="px-6 py-4">Tracking ID</th>
                                <th className="px-6 py-4">Route</th>
                                <th className="px-6 py-4">Deleted At</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {filteredShipments.map((shipment) => (
                                <tr key={shipment.id} className="hover:bg-slate-800/30 transition-colors group opacity-75 hover:opacity-100">
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-slate-400 font-medium line-through decoration-slate-600">{shipment.trackingNumber}</span>
                                        <div className="text-slate-600 text-xs mt-1">{shipment.receiverInfo}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center text-slate-500 text-sm">
                                            <span className="max-w-[100px] truncate">{shipment.origin}</span>
                                            <ArrowRight className="w-3 h-3 mx-2 text-slate-700" />
                                            <span className="max-w-[100px] truncate">{shipment.destination}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 text-sm">
                                        {shipment.deletedAt ? <FormattedDate date={shipment.deletedAt} /> : 'Unknown'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-3">
                                            <button
                                                onClick={() => handleRestore(shipment.id)}
                                                className="flex items-center px-3 py-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg transition-colors text-sm font-medium"
                                                title="Restore Shipment"
                                            >
                                                <RefreshCcw className="w-4 h-4 mr-1.5" />
                                                Restore
                                            </button>
                                            <button
                                                onClick={() => handleForceDelete(shipment.id)}
                                                className="flex items-center px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white rounded-lg transition-colors text-sm font-medium"
                                                title="Permanently Delete"
                                            >
                                                <Trash2 className="w-4 h-4 mr-1.5" />
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredShipments.length === 0 && (
                        <div className="p-12 border-t border-slate-800 text-center flex flex-col items-center justify-center space-y-3">
                            <Trash2 className="w-12 h-12 text-slate-700" />
                            <p className="text-slate-500 font-medium">Recycle bin is empty.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

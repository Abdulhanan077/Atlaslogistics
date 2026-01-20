'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, MapPin, Calendar, ArrowRight } from 'lucide-react';
import CreateShipmentModal from './CreateShipmentModal';

import { toast } from 'react-hot-toast';

export default function ShipmentsClient({ initialShipments }: { initialShipments: any[] }) {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const filteredShipments = initialShipments.filter(shipment => {
        const matchesSearch = shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            shipment.receiverInfo.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || shipment.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-2xl font-bold text-white">Manage Shipments</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-lg shadow-blue-600/20"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    New Shipment
                </button>
            </div>

            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search by Tracking ID or Receiver..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-white placeholder-slate-500 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-800 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                    <option value="ALL">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="IN_TRANSIT">In Transit</option>
                    <option value="PAUSED">Paused</option>
                    <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="RETURNED">Returned</option>
                </select>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-950/50 text-slate-400 text-sm font-medium">
                            <tr>
                                <th className="px-6 py-4">Tracking ID</th>
                                <th className="px-6 py-4">Route</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Latest Update</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {filteredShipments.map((shipment) => (
                                <tr key={shipment.id} className="hover:bg-slate-800/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-blue-400 font-medium">{shipment.trackingNumber}</span>
                                        <div className="text-slate-500 text-xs mt-1">{shipment.receiverInfo}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center text-slate-300 text-sm">
                                            <span className="max-w-[100px] truncate">{shipment.origin}</span>
                                            <ArrowRight className="w-3 h-3 mx-2 text-slate-600" />
                                            <span className="max-w-[100px] truncate">{shipment.destination}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${shipment.status === 'DELIVERED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                            shipment.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                                'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                            }`}>
                                            {shipment.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-400 text-sm">
                                        {shipment.events[0]?.description || 'Created'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => router.push(`/admin/shipments/${shipment.id}`)}
                                                className="px-3 py-1 bg-green-500/10 text-green-400 hover:bg-green-600 hover:text-white rounded-lg transition-colors text-sm font-medium"
                                            >
                                                Update
                                            </button>
                                            <button
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    if (!confirm('Are you sure you want to delete this shipment?')) return;
                                                    try {
                                                        const res = await fetch(`/api/shipments/${shipment.id}`, { method: 'DELETE' });
                                                        if (res.ok) {
                                                            toast.success('Shipment deleted');
                                                            router.refresh();
                                                        } else {
                                                            toast.error('Failed to delete shipment');
                                                        }
                                                    } catch (e) {
                                                        console.error(e);
                                                        toast.error('Error deleting shipment');
                                                    }
                                                }}
                                                className="px-3 py-1 bg-red-500/10 text-red-400 hover:bg-red-600 hover:text-white rounded-lg transition-colors text-sm font-medium"
                                                title="Delete Shipment"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredShipments.length === 0 && (
                        <div className="p-8 text-center text-slate-500">
                            No shipments found.
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && <CreateShipmentModal onClose={() => { setIsModalOpen(false); router.refresh(); }} />}
        </div>
    );
}

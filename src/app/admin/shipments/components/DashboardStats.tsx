import { Package, Truck, CheckCircle, AlertTriangle } from 'lucide-react';

interface DashboardStatsProps {
    stats: {
        total: number;
        inTransit: number;
        delivered: number;
        exceptions: number;
    };
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-4 hover:border-blue-500/50 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <Package className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-slate-500 text-sm font-medium">Total Shipments</p>
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-4 hover:border-sky-500/50 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                    <Truck className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-slate-500 text-sm font-medium">In Transit</p>
                    <p className="text-2xl font-bold text-white">{stats.inTransit}</p>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-4 hover:border-emerald-500/50 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-slate-500 text-sm font-medium">Delivered</p>
                    <p className="text-2xl font-bold text-white">{stats.delivered}</p>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-4 hover:border-orange-500/50 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-slate-500 text-sm font-medium">Exceptions / On Hold</p>
                    <p className="text-2xl font-bold text-white">{stats.exceptions}</p>
                </div>
            </div>
        </div>
    );
}

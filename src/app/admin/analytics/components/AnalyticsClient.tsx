'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface AnalyticsClientProps {
    totalShipments: number;
    volumeData: Array<{ date: string, count: number, fullDate: string }>;
    statusData: Array<{ name: string, value: number, fill: string }>;
    locationData: Array<{ name: string, value: number }>;
}

export default function AnalyticsClient({ totalShipments, volumeData, statusData, locationData }: AnalyticsClientProps) {

    // Custom tooltips for styling
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-lg">
                    <p className="text-slate-300 text-sm mb-1">{label}</p>
                    <p className="text-white font-bold">{payload[0].value} Shipments</p>
                </div>
            );
        }
        return null;
    };

    const PieTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-lg flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.fill }} />
                    <span className="text-slate-300 text-sm">{data.name}:</span>
                    <span className="text-white font-bold">{data.value}</span>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">Analytics Overview</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Volume Line Chart */}
                <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl lg:col-span-2">
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-white">Shipment Volume (Last 30 Days)</h2>
                        <p className="text-sm text-slate-400">Total historical volume: {totalShipments}</p>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={volumeData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#64748b"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    minTickGap={30}
                                />
                                <YAxis
                                    stroke="#64748b"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    allowDecimals={false}
                                />
                                <RechartsTooltip content={<CustomTooltip />} />
                                <Line
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    dot={false}
                                    activeDot={{ r: 6, fill: "#3b82f6", stroke: "#0f172a", strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Status Distribution Donut Chart */}
                <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
                    <h2 className="text-lg font-semibold text-white mb-6">Status Distribution</h2>
                    {statusData.length > 0 ? (
                        <div className="h-[300px] w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={110}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip content={<PieTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Inner Text Overlay */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-3xl font-bold text-white leading-none">{totalShipments}</span>
                                <span className="text-xs text-slate-400 mt-1">Total Shipments</span>
                            </div>
                        </div>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-slate-500">
                            No active shipments
                        </div>
                    )}
                </div>

                {/* Top Destinations Bar Chart */}
                <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
                    <h2 className="text-lg font-semibold text-white mb-6">Top Drop-off Locations</h2>
                    {locationData.length > 0 ? (
                        <div className="h-[300px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={locationData} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                                    <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                    <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} width={80} />
                                    <RechartsTooltip cursor={{ fill: '#1e293b' }} content={<CustomTooltip />} />
                                    <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-slate-500">
                            No location data available
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

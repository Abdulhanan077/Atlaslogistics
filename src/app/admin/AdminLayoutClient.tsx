'use client';

import { useState } from 'react';
import AdminSidebar from '@/components/admin/Sidebar';
import AdminHeader from '@/components/admin/Header';
import { Menu } from 'lucide-react';

export default function AdminLayoutClient({ children, user }: { children: React.ReactNode, user: any }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-slate-900 text-white overflow-hidden print:h-auto print:overflow-visible">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <div className={`
                fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
                ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
                print:hidden
            `}>
                <AdminSidebar role={user.role} onClose={() => setIsSidebarOpen(false)} />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden print:h-auto print:overflow-visible print:block">
                {/* Mobile Header */}
                <div className="flex items-center justify-between p-4 md:hidden border-b border-slate-800 bg-slate-900 print:hidden">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
                            <Menu className="w-6 h-6" />
                        </button>
                        <span className="font-bold text-lg bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Atlas Logistics</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs select-none">
                        {user.name?.[0] || 'A'}
                    </div>
                </div>

                <div className="hidden md:block print:hidden">
                    <AdminHeader user={user} />
                </div>

                <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-950/50 print:p-0 print:overflow-visible print:bg-white print:text-black">
                    {children}
                </main>
            </div>
        </div>
    );
}

'use client';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { LayoutDashboard, Package, Users, Settings, LogOut, ScrollText, Trash2, BarChart3 } from 'lucide-react';
import { signOut } from 'next-auth/react';

export default function AdminSidebar({ role, onClose }: { role: string; onClose?: () => void }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const viewAs = searchParams.get('viewAs');

    const links = [
        { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/shipments', label: 'Shipments', icon: Package },
        { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
        ...(role === 'SUPER_ADMIN' ? [
            { href: '/admin/users', label: 'Manage Admins', icon: Users },
            { href: '/admin/logs', label: 'Audit Logs', icon: ScrollText }
        ] : []),
        { href: '/admin/recycle-bin', label: 'Recycle Bin', icon: Trash2 },
        { href: '/admin/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <aside className="w-full h-full bg-slate-900 border-r border-slate-800 flex flex-col">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                    Atlas Logistics
                </h1>
                {onClose && (
                    <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white">
                        <LogOut className="w-5 h-5 rotate-180" />
                    </button>
                )}
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    // Append viewAs to href if it exists and we are not going to "Manage Admins"
                    const href = (viewAs && link.href !== '/admin/users')
                        ? `${link.href}?viewAs=${viewAs}`
                        : link.href;

                    return (
                        <Link
                            key={link.href}
                            href={href}
                            onClick={onClose}
                            className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${isActive
                                ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20'
                                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                                }`}
                        >
                            <Icon className="w-5 h-5 mr-3" />
                            {link.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="flex items-center w-full px-4 py-3 text-sm font-medium text-slate-400 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-all"
                >
                    <LogOut className="w-5 h-5 mr-3" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}

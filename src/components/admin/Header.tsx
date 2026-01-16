'use client';

export default function AdminHeader({ user }: { user: { name?: string | null, email?: string | null, role: string } }) {
    return (
        <header className="h-16 bg-slate-900/50 backdrop-blur-sm border-b border-slate-800 flex items-center justify-between px-6 z-10">
            <h2 className="text-slate-200 font-medium">Welcome back, {user.name}</h2>
            <div className="flex items-center space-x-4">
                <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-semibold">
                    {user.role.replace('_', ' ')}
                </span>
                <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-xs font-bold text-slate-300">
                    {user.name?.charAt(0).toUpperCase()}
                </div>
            </div>
        </header>
    );
}

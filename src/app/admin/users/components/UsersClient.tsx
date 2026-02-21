'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Shield, User, X, Loader2, ExternalLink, RotateCcw } from 'lucide-react';
import Link from 'next/link';

export default function UsersClient({ initialUsers }: { initialUsers: any[] }) {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [restoringId, setRestoringId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'active' | 'deleted'>('active');
    const [users, setUsers] = useState(initialUsers);

    useEffect(() => {
        if (viewMode === 'active') {
            setUsers(initialUsers);
        } else {
            fetchDeletedUsers();
        }
    }, [initialUsers, viewMode]);

    const fetchDeletedUsers = async () => {
        try {
            const res = await fetch('/api/users?deleted=true');
            if (res.ok) setUsers(await res.json());
        } catch (e) { console.error(e); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure? This will move the admin to the Recycle Bin.')) return;
        setDeletingId(id);
        try {
            const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
            if (res.ok) {
                if (viewMode === 'active') router.refresh();
                else fetchDeletedUsers();
            } else alert('Failed to delete');
        } catch (e) { console.error(e); }
        finally { setDeletingId(null); }
    };

    const handleRestore = async (id: string) => {
        if (!confirm('Restore this admin account?')) return;
        setRestoringId(id);
        try {
            const res = await fetch(`/api/users/${id}`, { method: 'PATCH' });
            if (res.ok) {
                fetchDeletedUsers();
                router.refresh();
            } else alert('Failed to restore');
        } catch (e) { console.error(e); }
        finally { setRestoringId(null); }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-white">Manage Admins</h1>
                    <div className="flex bg-slate-800 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('active')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'active' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                        >
                            Active
                        </button>
                        <button
                            onClick={() => setViewMode('deleted')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'deleted' ? 'bg-red-600/50 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                        >
                            Recycle Bin
                        </button>
                    </div>
                </div>
                {viewMode === 'active' && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-lg"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Add Admin
                    </button>
                )}
            </div>

            {users.length === 0 ? (
                <div className="text-center py-12 text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center">
                    <Shield className="w-12 h-12 mb-4 text-slate-700" />
                    <p>No {viewMode === 'deleted' ? 'deleted' : 'active'} admins found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {users.map(user => (
                        <div key={user.id} className={`bg-slate-900 border p-6 rounded-2xl flex items-start justify-between group transition-all ${viewMode === 'deleted' ? 'border-red-500/20' : 'border-slate-800 hover:border-slate-700'}`}>
                            <div className="flex items-start">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${user.role === 'SUPER_ADMIN' ? 'bg-purple-500/20 text-purple-400' : viewMode === 'deleted' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                    {user.role === 'SUPER_ADMIN' ? <Shield className="w-5 h-5" /> : <User className="w-5 h-5" />}
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold">{user.name}</h3>
                                    <p className="text-slate-400 text-sm">{user.email}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${user.role === 'SUPER_ADMIN' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                                            {user.role.replace('_', ' ')}
                                        </span>
                                        {viewMode === 'deleted' && (
                                            <span className="inline-block px-2 py-0.5 rounded text-xs font-medium border bg-red-500/10 text-red-400 border-red-500/20">
                                                Deleted
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {user.role !== 'SUPER_ADMIN' && (
                                <div className="flex flex-col gap-2">
                                    {viewMode === 'active' && (
                                        <Link
                                            href={`/admin?viewAs=${user.id}`}
                                            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center"
                                            title="View Portal"
                                        >
                                            <ExternalLink className="w-5 h-5" />
                                        </Link>
                                    )}
                                    {viewMode === 'active' ? (
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            disabled={deletingId === user.id}
                                            className="text-slate-600 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                                            title="Move to Recycle Bin"
                                        >
                                            {deletingId === user.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleRestore(user.id)}
                                            disabled={restoringId === user.id}
                                            className="text-slate-600 hover:text-green-400 p-2 rounded-lg hover:bg-green-500/10 transition-colors"
                                            title="Restore Admin"
                                        >
                                            {restoringId === user.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <RotateCcw className="w-5 h-5" />}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && <AddUserModal onClose={() => { setIsModalOpen(false); router.refresh(); }} />}
        </div>
    );
}

function AddUserModal({ onClose }: { onClose: () => void }) {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) onClose();
            else alert('Failed to create');
        } catch (e) { alert('Error'); }
        finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Add New Admin</h2>
                    <button onClick={onClose}><X className="text-slate-400 hover:text-white" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm text-slate-400">Name</label>
                        <input type="text" required className="w-full bg-slate-800 border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:ring-1 focus:ring-blue-500"
                            value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-sm text-slate-400">Email</label>
                        <input type="email" required className="w-full bg-slate-800 border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:ring-1 focus:ring-blue-500"
                            value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-sm text-slate-400">Password</label>
                        <input type="password" required className="w-full bg-slate-800 border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:ring-1 focus:ring-blue-500"
                            value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl mt-4 flex justify-center">
                        {loading ? <Loader2 className="animate-spin" /> : 'Create Account'}
                    </button>
                </form>
            </div>
        </div>
    );
}

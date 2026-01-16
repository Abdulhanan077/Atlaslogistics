'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Shield, User, X, Loader2 } from 'lucide-react';

export default function UsersClient({ initialUsers }: { initialUsers: any[] }) {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure? This will delete the admin and their shipments.')) return;
        setDeletingId(id);
        try {
            const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
            if (res.ok) router.refresh();
            else alert('Failed to delete');
        } catch (e) { console.error(e); }
        finally { setDeletingId(null); }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Manage Admins</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-lg"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Admin
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {initialUsers.map(user => (
                    <div key={user.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-start justify-between group hover:border-slate-700 transition-all">
                        <div className="flex items-start">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${user.role === 'SUPER_ADMIN' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                                }`}>
                                {user.role === 'SUPER_ADMIN' ? <Shield className="w-5 h-5" /> : <User className="w-5 h-5" />}
                            </div>
                            <div>
                                <h3 className="text-white font-semibold">{user.name}</h3>
                                <p className="text-slate-400 text-sm">{user.email}</p>
                                <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium border ${user.role === 'SUPER_ADMIN' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                    }`}>
                                    {user.role.replace('_', ' ')}
                                </span>
                            </div>
                        </div>
                        {user.role !== 'SUPER_ADMIN' && (
                            <button
                                onClick={() => handleDelete(user.id)}
                                disabled={deletingId === user.id}
                                className="text-slate-600 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                            >
                                {deletingId === user.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                            </button>
                        )}
                    </div>
                ))}
            </div>

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

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Lock, Mail, User, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [secret, setSecret] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name, secret })
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            } else {
                const text = await res.text();
                setError(text || 'Registration failed');
            }
        } catch (e) {
            setError('An unexpected error occurred.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-xl w-full max-w-md p-8">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30">
                        <Package className="text-white w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Admin Setup</h1>
                    <p className="text-slate-400 text-sm mt-1">Register a new Master Administrator</p>
                </div>

                {success ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm p-4 rounded-lg text-center animate-fade-in">
                        Registration successful! Redirecting you to login...
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg text-center">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-slate-300 text-sm font-medium ml-1">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-3 top-3 w-5 h-5 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-slate-700 text-white placeholder-slate-500 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-slate-300 text-sm font-medium ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-slate-700 text-white placeholder-slate-500 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner"
                                    placeholder="admin@logistics.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-slate-300 text-sm font-medium ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-slate-700 text-white placeholder-slate-500 rounded-xl py-2.5 pl-10 pr-12 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-2.5 p-1 text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="border-t border-slate-700/50 pt-4 mt-2"></div>

                        <div className="space-y-2">
                            <label className="text-slate-300 text-sm font-medium ml-1">Master Verification Key</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-3 w-5 h-5 text-red-500/50 group-focus-within:text-red-500 transition-colors" />
                                <input
                                    type="password"
                                    value={secret}
                                    onChange={(e) => setSecret(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-slate-700 text-white placeholder-slate-500 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all shadow-inner"
                                    placeholder="Required to authorize setup"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-emerald-600/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Register Admin
                        </button>

                        <div className="text-center mt-4">
                            <Link href="/login" className="text-slate-500 hover:text-white transition-colors text-sm">
                                Already have an account? Login here.
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

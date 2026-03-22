'use client';

import { useState } from 'react';
import { Lock, ArrowRight, ArrowLeft, Loader2, CheckCircle2, KeyRound, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function ResetPasswordPage() {
    const [token, setToken] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPasswords, setShowPasswords] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            const cleanToken = token.trim();
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: cleanToken, newPassword: password })
            });

            if (res.ok) {
                const data = await res.json();
                setMessage(data.message || 'Password reset successfully.');
            } else {
                const text = await res.text();
                setError(text);
            }
        } catch (e) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-blue-600/20 rounded-full blur-[100px]" />
                <div className="absolute top-1/2 -right-1/4 w-1/2 h-1/2 bg-purple-600/20 rounded-full blur-[100px]" />
            </div>

            <div className="z-10 w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-8">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">Change Password</h1>
                    <p className="text-slate-400">Enter the 6-digit code from your email</p>
                </div>

                {message ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/50 rounded-xl p-6 text-center animate-fade-in">
                        <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                        <h3 className="text-emerald-400 font-semibold mb-2">Password Reset Successful</h3>
                        <p className="text-emerald-500/80 text-sm mb-6">{message}</p>
                        <Link href="/login" className="inline-flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-2" /> log in to continue
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm text-center">
                                {error}
                            </div>
                        )}
                        
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">6-Digit Code</label>
                                <div className="relative">
                                    <KeyRound className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                                    <input
                                        type="text"
                                        required
                                        maxLength={6}
                                        value={token}
                                        onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors tracking-[0.5em] font-mono font-bold text-center"
                                        placeholder="123456"
                                        autoComplete="one-time-code"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">New Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        type={showPasswords ? "text" : "password"}
                                        required
                                        minLength={8}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 pl-10 pr-12 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                                        placeholder="••••••••"
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords(!showPasswords)}
                                        className="absolute right-3 top-2.5 p-1 text-slate-500 hover:text-slate-300 transition-colors"
                                    >
                                        {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Confirm Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        type={showPasswords ? "text" : "password"}
                                        required
                                        minLength={8}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 pl-10 pr-12 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                                        placeholder="••••••••"
                                        autoComplete="new-password"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !password || password !== confirmPassword || token.length !== 6}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>
                                    Update Password
                                    <CheckCircle2 className="w-5 h-5" />
                                </>
                            )}
                        </button>

                        <div className="text-center">
                            <Link href="/forgot-password" className="text-sm text-slate-500 hover:text-white transition-colors">
                                Didn't get a code?
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

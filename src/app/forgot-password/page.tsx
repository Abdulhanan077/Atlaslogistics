'use client';

import { useState } from 'react';
import { Mail, ArrowRight, CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (res.ok) {
                const data = await res.json();
                setMessage(data.message);
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
        <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-blue-600/20 rounded-full blur-[100px]" />
                <div className="absolute top-1/2 -right-1/4 w-1/2 h-1/2 bg-purple-600/20 rounded-full blur-[100px]" />
            </div>

            <div className="z-10 w-full max-w-md bg-brand-surface border border-brand-border rounded-2xl shadow-2xl overflow-hidden p-8">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">Forgot Password</h1>
                    <p className="text-brand-text-muted">Enter your email to receive a reset link</p>
                </div>

                {message ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/50 rounded-xl p-6 text-center animate-fade-in">
                        <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                        <h3 className="text-emerald-400 font-semibold mb-2">Check your email</h3>
                        <p className="text-emerald-500/80 text-sm mb-6">{message}</p>
                        
                        <div className="flex flex-col gap-3">
                            <Link href="/reset-password" className="inline-flex justify-center items-center bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-xl transition-colors">
                                Enter Reset Code <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                            <Link href="/login" className="inline-flex justify-center items-center text-sm text-brand-text-muted hover:text-white transition-colors">
                                <ArrowLeft className="w-4 h-4 mr-2" /> back to login
                            </Link>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm text-center">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 w-5 h-5 text-brand-text-muted/80" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-800 border border-brand-border/50 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                                    placeholder="admin@atlaslogistics.com"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>
                                    Send Reset Link
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                        
                        <div className="text-center">
                            <Link href="/login" className="text-sm text-brand-text-muted/80 hover:text-white transition-colors">
                                Back to login
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

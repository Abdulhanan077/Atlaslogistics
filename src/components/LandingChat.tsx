'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2, Mail, ExternalLink, Package, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LandingChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Array<{ sender: 'BOT' | 'USER'; text: string; time: string; link?: string }>>([
        {
            sender: 'BOT',
            text: 'Welcome to Atlas Logistics Live Support! How can we assist with your shipment today?',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [input, setInput] = useState('');
    const [trackingNumber, setTrackingNumber] = useState('');
    const [isSearchingTracking, setIsSearchingTracking] = useState(false);
    const [companyEmail, setCompanyEmail] = useState('support@atlaslogistics.site');
    const scrollRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => {
                if (data?.supportEmail) setCompanyEmail(data.supportEmail);
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = input.trim();
        if (!trimmed) return;

        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setMessages(prev => [...prev, { sender: 'USER', text: trimmed, time }]);
        setInput('');

        // Check if message looks like a tracking number
        const trackingMatch = trimmed.match(/[A-Z0-9-]{6,20}/i);
        if (trackingMatch && (trimmed.toUpperCase().includes('TRK') || trimmed.length >= 8)) {
            const potentialTrk = trackingMatch[0];
            setIsSearchingTracking(true);
            try {
                const res = await fetch(`/api/shipments/track?number=${encodeURIComponent(potentialTrk)}`);
                if (res.ok) {
                    const shipment = await res.json();
                    setMessages(prev => [
                        ...prev,
                        {
                            sender: 'BOT',
                            text: `Shipment found! Tracking ID: ${shipment.trackingNumber}. Status: ${shipment.status.replace('_', ' ')}. Redirecting you to your dedicated tracking portal...`,
                            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            link: `/track/${shipment.trackingNumber}`
                        }
                    ]);
                    setTimeout(() => {
                        router.push(`/track/${shipment.trackingNumber}`);
                    }, 2000);
                    setIsSearchingTracking(false);
                    return;
                }
            } catch (err) {
                console.error(err);
            }
            setIsSearchingTracking(false);
        }

        // Automated helpful support response
        setTimeout(() => {
            setMessages(prev => [
                ...prev,
                {
                    sender: 'BOT',
                    text: `Thank you for contacting Atlas Logistics Support. Our team has received your message. For immediate assistance or direct documentation inquiries, you can also reach us at ${companyEmail}. If you have a tracking number, please share it here!`,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
            ]);
        }, 1000);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Floating Trigger Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="group relative flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white p-4 md:px-6 md:py-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border border-blue-400/30"
                >
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <MessageCircle className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
                    <span className="hidden md:inline font-black text-sm tracking-tight">Customer Support Chat</span>
                </button>
            )}

            {/* Chat Overlay Box */}
            {isOpen && (
                <div className="w-[92vw] sm:w-[400px] h-[520px] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-900 to-slate-900 p-4 border-b border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg">
                                <Package className="w-5 h-5 text-white" />
                                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-sm tracking-tight flex items-center gap-1.5">
                                    Atlas Logistics Chat
                                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                </h3>
                                <a
                                    href={`mailto:${companyEmail}`}
                                    className="text-xs text-blue-400 hover:text-blue-300 font-mono flex items-center gap-1 transition-colors"
                                >
                                    <Mail className="w-3 h-3" />
                                    {companyEmail}
                                </a>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages Scroll Body */}
                    <div ref={scrollRef} className="flex-1 p-4 space-y-3 overflow-y-auto bg-slate-950/60">
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex flex-col ${
                                    msg.sender === 'USER' ? 'items-end' : 'items-start'
                                }`}
                            >
                                <div
                                    className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                                        msg.sender === 'USER'
                                            ? 'bg-blue-600 text-white rounded-br-none shadow-md'
                                            : 'bg-slate-800 text-slate-200 border border-slate-700/60 rounded-bl-none shadow-sm'
                                    }`}
                                >
                                    <p>{msg.text}</p>
                                    {msg.link && (
                                        <a
                                            href={msg.link}
                                            className="mt-2 inline-flex items-center gap-1 font-bold text-emerald-400 hover:underline"
                                        >
                                            Open Tracking <ExternalLink className="w-3 h-3" />
                                        </a>
                                    )}
                                </div>
                                <span className="text-[9px] text-slate-500 mt-1 px-1">{msg.time}</span>
                            </div>
                        ))}

                        {isSearchingTracking && (
                            <div className="flex items-center gap-2 text-xs text-blue-400 p-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Locating shipment details...
                            </div>
                        )}
                    </div>

                    {/* Quick Info Email Bar */}
                    <div className="bg-slate-900 border-t border-slate-800 p-2 px-4 flex justify-between items-center text-[10px] text-slate-400">
                        <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-blue-400" />
                            Direct Email:
                        </span>
                        <a href={`mailto:${companyEmail}`} className="font-mono font-semibold text-blue-400 hover:underline">
                            {companyEmail}
                        </a>
                    </div>

                    {/* Input Form */}
                    <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
                        <input
                            type="text"
                            placeholder="Type a message or tracking ID..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim()}
                            className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl disabled:opacity-40 transition-colors shadow-md cursor-pointer"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, X, Loader2, User, Phone } from 'lucide-react';

interface Message {
    id: string;
    content: string;
    imageUrl?: string | null;
    sender: 'CLIENT' | 'ADMIN';
    createdAt: string;
}

export default function TrackingChat({ shipmentId }: { shipmentId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Poll for new messages every 5 seconds when open
    useEffect(() => {
        if (!isOpen) return;

        fetchMessages();
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [isOpen, shipmentId]);

    // Scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages.length, isOpen]);

    const fetchMessages = async () => {
        try {
            const res = await fetch(`/api/shipments/${shipmentId}/messages`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (e) {
            console.error("Failed to fetch messages", e);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const uploadRes = await fetch(`/api/upload/public?filename=${encodeURIComponent(file.name)}`, {
                method: 'POST',
                body: file,
            });

            if (uploadRes.ok) {
                const blob = await uploadRes.json();

                await fetch(`/api/shipments/${shipmentId}/messages`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        content: '',
                        imageUrl: blob.url,
                        sender: 'CLIENT'
                    })
                });
                fetchMessages();
            }
        } catch (error) {
            console.error('Image upload failed', error);
        } finally {
            setUploadingImage(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setSending(true);
        try {
            const res = await fetch(`/api/shipments/${shipmentId}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: newMessage,
                    sender: 'CLIENT'
                })
            });

            if (res.ok) {
                setNewMessage('');
                fetchMessages(); // Refresh immediately
            }
        } catch (e) {
            console.error("Failed to send", e);
        } finally {
            setSending(false);
        }
    };

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 right-6 p-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-2xl transition-all transform hover:scale-105 z-50 ${isOpen ? 'hidden' : 'flex'}`}
            >
                <div className="relative">
                    <MessageCircle className="w-6 h-6" />
                    {/* Notification dot could go here */}
                </div>
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-80 md:w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[600px]">
                    {/* Header */}
                    <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                <Phone className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-sm">Support Chat</h3>
                                <p className="text-xs text-slate-400">Ask us anything about your shipment</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-slate-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div
                        ref={scrollRef}
                        className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/50 min-h-[300px]"
                    >
                        {messages.length === 0 ? (
                            <div className="text-center text-slate-500 text-sm mt-10">
                                <p>No messages yet.</p>
                                <p className="text-xs mt-1">Send a message to start a conversation.</p>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.sender === 'CLIENT' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.sender === 'CLIENT'
                                            ? 'bg-blue-600 text-white rounded-tr-none'
                                            : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                                            }`}
                                    >
                                        {msg.imageUrl && (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={msg.imageUrl} alt="Attached" className="max-w-full rounded-xl mb-2 border border-slate-700/50" />
                                        )}
                                        {msg.content && <p>{msg.content}</p>}
                                        <p className={`text-[10px] mt-1 ${msg.sender === 'CLIENT' ? 'text-blue-200' : 'text-slate-500'}`}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-3 bg-slate-800 border-t border-slate-700 flex gap-2">
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={sending || uploadingImage}
                            className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-700 hover:border-slate-600 rounded-xl transition-colors disabled:opacity-50"
                            title="Attach Picture"
                        >
                            {uploadingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageCircle className="w-5 h-5" />}
                        </button>
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                        />
                        <button
                            type="submit"
                            disabled={sending || uploadingImage || !newMessage.trim()}
                            className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </button>
                    </form>
                </div>
            )}
        </>
    );
}

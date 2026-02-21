'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, RefreshCw } from 'lucide-react';

interface Message {
    id: string;
    content: string;
    imageUrl?: string | null;
    sender: 'CLIENT' | 'ADMIN';
    createdAt: string;
}

export default function ShipmentChat({ shipmentId }: { shipmentId: string }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [shipmentId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages.length]);

    const fetchMessages = async () => {
        try {
            const res = await fetch(`/api/shipments/${shipmentId}/messages`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data);

                // Mark as read if latest message is from client
                // We do this optimistically or just call the API
                const hasUnread = data.some((m: Message) => m.sender === 'CLIENT'); // simplistic check, ideally check isRead but we assume if we are fetching, we are reading. 
                // Actually, just calling mark-read endpoint is safer if we want to clear the dashboard notification.
                if (data.length > 0) {
                    markAsRead();
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    const markAsRead = async () => {
        try {
            await fetch(`/api/shipments/${shipmentId}/messages/read`, { method: 'POST' });
        } catch (e) {
            console.error('Failed to mark read', e);
        }
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            // Using the public route we created, admins and clients hit the same quick-path
            const uploadRes = await fetch(`/api/upload/public?filename=${encodeURIComponent(file.name)}`, {
                method: 'POST',
                body: file,
            });

            if (uploadRes.ok) {
                const blob = await uploadRes.json();

                // Immediately send as message
                await fetch(`/api/shipments/${shipmentId}/messages`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        content: '', // Optional text
                        imageUrl: blob.url,
                        sender: 'ADMIN'
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
                    sender: 'ADMIN' // Auth handled by API, but this is for clarity
                })
            });

            if (res.ok) {
                setNewMessage('');
                fetchMessages();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[700px] overflow-hidden shrink-0">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                <h3 className="font-bold text-white flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-blue-400" />
                    Customer Inquiries
                </h3>
                <button onClick={fetchMessages} className="text-slate-400 hover:text-white" title="Refresh">
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/30">
                {messages.length === 0 ? (
                    <div className="text-center text-slate-500 text-sm mt-20">
                        No messages yet.
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.sender === 'ADMIN' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className="max-w-[80%]">
                                <div
                                    className={`rounded-2xl px-4 py-3 text-sm ${msg.sender === 'ADMIN'
                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                        : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                                        }`}
                                >
                                    {msg.imageUrl && (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={msg.imageUrl} alt="Attachment" className="max-w-full rounded-xl mb-2 border border-slate-700/50" />
                                    )}
                                    {msg.content && <p>{msg.content}</p>}
                                </div>
                                <p className={`text-[10px] mt-1 px-1 ${msg.sender === 'ADMIN' ? 'text-right text-slate-500' : 'text-slate-500'
                                    }`}>
                                    <span suppressHydrationWarning>
                                        {new Date(msg.createdAt).toLocaleString(undefined, {
                                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </span>
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <form onSubmit={handleSend} className="p-4 border-t border-slate-800 bg-slate-900">
                <div className="flex gap-2">
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
                        className="p-2.5 text-slate-400 hover:text-white bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl transition-colors disabled:opacity-50"
                        title="Attach Picture"
                    >
                        {uploadingImage ? <RefreshCw className="w-5 h-5 animate-spin" /> : <MessageCircle className="w-5 h-5" />} {/* Using basic icons to avoid import issues temporarily */}
                    </button>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        placeholder="Reply only visible to customer..."
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-500"
                    />
                    <button
                        type="submit"
                        disabled={sending || uploadingImage || !newMessage.trim()}
                        className="bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded-xl disabled:opacity-50 transition-colors"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    );
}

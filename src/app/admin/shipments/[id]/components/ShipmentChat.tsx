'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, RefreshCw, Trash2, Edit2, X, Check } from 'lucide-react';

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
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [editingContent, setEditingContent] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [shipmentId]);

    useEffect(() => {
        if (scrollRef.current && !editingMessageId) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages.length, editingMessageId]);

    const fetchMessages = async () => {
        try {
            const res = await fetch(`/api/shipments/${shipmentId}/messages`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data);

                // Mark as read if latest message is from client
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
                    sender: 'ADMIN'
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

    const handleDeleteMessage = async (messageId: string) => {
        if (!confirm('Are you sure you want to delete this message? This cannot be undone.')) return;
        try {
            const res = await fetch(`/api/messages/${messageId}`, { method: 'DELETE' });
            if (res.ok) {
                setMessages(prev => prev.filter(m => m.id !== messageId));
            }
        } catch (e) {
            console.error('Failed to delete message:', e);
        }
    };

    const handleSaveEdit = async (messageId: string) => {
        if (!editingContent.trim()) return;
        try {
            const res = await fetch(`/api/messages/${messageId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: editingContent })
            });
            if (res.ok) {
                setMessages(prev => prev.map(m => m.id === messageId ? { ...m, content: editingContent } : m));
                setEditingMessageId(null);
                setEditingContent('');
            }
        } catch (e) {
            console.error('Failed to update message:', e);
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
                            className={`flex ${msg.sender === 'ADMIN' ? 'justify-end' : 'justify-start'} group w-full`}
                        >
                            {msg.sender === 'ADMIN' && editingMessageId !== msg.id && (
                                <div className="flex flex-col justify-center sm:flex-row items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity mr-2">
                                    <button
                                        onClick={() => { setEditingMessageId(msg.id); setEditingContent(msg.content || ''); }}
                                        className="text-slate-500 hover:text-blue-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                                        title="Edit message"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteMessage(msg.id)}
                                        className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                                        title="Delete message"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            <div className="max-w-[80%]">
                                {editingMessageId === msg.id ? (
                                    <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700 flex flex-col gap-2 min-w-[250px] shadow-lg">
                                        <textarea
                                            value={editingContent}
                                            onChange={(e) => setEditingContent(e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
                                            rows={3}
                                            autoFocus
                                            spellCheck={false}
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => setEditingMessageId(null)}
                                                className="text-slate-400 hover:text-white px-2 py-1 text-xs font-medium rounded-md hover:bg-slate-700 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => handleSaveEdit(msg.id)}
                                                disabled={!editingContent.trim()}
                                                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-3 py-1 text-xs font-bold rounded-md transition-colors flex items-center gap-1"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        className={`rounded-2xl px-4 py-3 text-sm flex flex-col ${msg.sender === 'ADMIN'
                                            ? 'bg-blue-600 text-white rounded-tr-none'
                                            : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                                            }`}
                                    >
                                        {msg.imageUrl && (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={msg.imageUrl} alt="Attachment" className="max-w-full rounded-xl mb-2 border border-blue-500/50" />
                                        )}
                                        {msg.content && <p className="whitespace-pre-wrap">{msg.content}</p>}
                                    </div>
                                )}
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
                        {uploadingImage ? <RefreshCw className="w-5 h-5 animate-spin" /> : <MessageCircle className="w-5 h-5" />}
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

'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, RefreshCw, Trash2, Edit2, X, Check, Paperclip, FileText, ExternalLink } from 'lucide-react';
import { uploadToR2 as upload } from '@/lib/upload-client';

interface Message {
    id: string;
    content: string;
    imageUrl?: string | null;
    sender: 'CLIENT' | 'ADMIN';
    createdAt: string;
}

const renderMessageContent = (content: string, isBubbleBlue: boolean) => {
    if (!content) return null;
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
    const parts = content.split(urlRegex);
    if (parts.length === 1) return content;

    return parts.map((part, index) => {
        const isUrl = part.startsWith('http://') || part.startsWith('https://') || part.startsWith('www.');
        if (isUrl) {
            const href = part.startsWith('http') ? part : `https://${part}`;
            return (
                <a
                    key={index}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`underline break-all font-semibold hover:opacity-90 ${
                        isBubbleBlue ? 'text-white' : 'text-blue-600'
                    }`}
                >
                    {part}
                </a>
            );
        }
        return part;
    });
};

export default function ShipmentChat({ shipmentId }: { shipmentId: string }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [activeImage, setActiveImage] = useState<string | null>(null);
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [editingContent, setEditingContent] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = '44px';
            const scrollHeight = textareaRef.current.scrollHeight;
            textareaRef.current.style.height = `${Math.min(scrollHeight, 200)}px`;
        }
    }, [newMessage]);

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
                setMessages(prev => {
                    if (prev.length === data.length) {
                        const isSame = prev.every((msg, idx) => 
                            msg.id === data[idx].id && 
                            msg.content === data[idx].content && 
                            msg.imageUrl === data[idx].imageUrl
                        );
                        if (isSame) return prev;
                    }
                    return data;
                });

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
            const newBlob = await upload(file.name, file, {
                access: 'public',
                handleUploadUrl: '/api/upload/token',
            });

            await fetch(`/api/shipments/${shipmentId}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: '',
                    imageUrl: newBlob.url,
                    sender: 'ADMIN'
                })
            });
            fetchMessages();
        } catch (error) {
            console.error('Image upload failed', error);
        } finally {
            setUploadingImage(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSend = async (e?: React.SyntheticEvent) => {
        e?.preventDefault();
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
        <div className="bg-brand-surface border border-brand-border rounded-2xl flex flex-col h-[600px] max-h-[calc(100vh-120px)] overflow-hidden w-full">
            <div className="p-4 border-b border-brand-border flex justify-between items-center bg-brand-surface/50">
                <h3 className="font-bold text-brand-text flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-blue-400" />
                    Customer Inquiries
                </h3>
                <button onClick={fetchMessages} className="text-brand-text-muted hover:text-brand-text" title="Refresh">
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-brand-bg/30">
                {messages.length === 0 ? (
                    <div className="text-center text-brand-text-muted text-sm mt-20">
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
                                        className="text-brand-text-muted hover:text-blue-400 p-1.5 rounded-lg hover:bg-brand-bg transition-colors"
                                        title="Edit message"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteMessage(msg.id)}
                                        className="text-brand-text-muted hover:text-red-400 p-1.5 rounded-lg hover:bg-brand-bg transition-colors"
                                        title="Delete message"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            <div className="max-w-[80%]">
                                {editingMessageId === msg.id ? (
                                    <div className="bg-brand-surface p-3 rounded-2xl border border-brand-border flex flex-col gap-2 w-full shadow-lg">
                                        <textarea
                                            value={editingContent}
                                            onChange={(e) => setEditingContent(e.target.value)}
                                            className="w-full bg-brand-bg border border-brand-border rounded-xl px-3 py-2 text-brand-text text-sm focus:outline-none focus:border-blue-500 resize-none"
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
                                        className={`rounded-2xl px-4 py-3 text-sm flex flex-col break-words min-w-0 ${msg.sender === 'ADMIN'
                                            ? 'bg-blue-600 text-white rounded-tr-none'
                                            : 'bg-brand-surface text-brand-text rounded-tl-none border border-brand-border'
                                            }`}
                                    >
                                        {msg.imageUrl && (() => {
                                            const isPdf = msg.imageUrl.toLowerCase().split('?')[0].endsWith('.pdf');
                                            if (isPdf) {
                                                const fileName = decodeURIComponent(msg.imageUrl.split('/').pop() || 'document.pdf');
                                                return (
                                                    <a 
                                                        href={msg.imageUrl} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        className="flex items-center gap-3 bg-brand-bg hover:bg-slate-800 p-3 rounded-xl border border-brand-border transition-colors mb-2 text-brand-text font-medium group cursor-pointer"
                                                    >
                                                        <FileText className="w-8 h-8 text-red-500 shrink-0" />
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-xs truncate font-bold text-brand-text">{fileName}</p>
                                                            <p className="text-[10px] text-slate-500">PDF Document • Open</p>
                                                        </div>
                                                        <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors shrink-0" />
                                                    </a>
                                                );
                                            } else {
                                                return (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img 
                                                        src={msg.imageUrl} 
                                                        alt="Attachment" 
                                                        className="max-w-full rounded-xl mb-2 border border-blue-500/50 cursor-zoom-in hover:opacity-90 active:scale-[0.98] transition-all" 
                                                        onClick={() => setActiveImage(msg.imageUrl || null)}
                                                    />
                                                );
                                            }
                                        })()}
                                        {msg.content && <p className="whitespace-pre-wrap">{renderMessageContent(msg.content, msg.sender === 'ADMIN')}</p>}
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

            <form onSubmit={handleSend} className="p-4 border-t border-brand-border bg-brand-surface shrink-0">
                <div className="flex items-end gap-3 bg-brand-bg/50 border border-brand-border rounded-[1.5rem] p-2 pr-2 focus-within:border-blue-500/50 transition-all shadow-inner">
                    <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={sending || uploadingImage}
                        className="p-2.5 text-brand-text-muted hover:text-blue-400 hover:bg-brand-surface/50 rounded-full transition-all disabled:opacity-50 shrink-0"
                        title="Attach Picture"
                    >
                        {uploadingImage ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
                    </button>
                    
                    <textarea
                        ref={textareaRef}
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        rows={1}
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent border-none text-brand-text text-sm focus:ring-0 outline-none resize-none py-2.5 max-h-[180px] scrollbar-hide"
                        style={{ minHeight: '40px' }}
                    />
                    
                    <button
                        type="submit"
                        disabled={sending || uploadingImage || !newMessage.trim()}
                        className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full disabled:opacity-50 disabled:grayscale transition-all shadow-lg active:scale-95 shrink-0"
                    >
                        {sending ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                </div>
            </form>

            {/* Image Preview Modal Overlay */}
            {activeImage && (
                <div 
                    className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 md:p-10 cursor-zoom-out"
                    onClick={() => setActiveImage(null)}
                >
                    <button 
                        onClick={() => setActiveImage(null)}
                        className="absolute top-4 right-4 text-white/80 hover:text-white p-2.5 rounded-full bg-slate-900/50 hover:bg-slate-900/80 transition-all shadow-md z-[100000]"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <div className="relative max-w-4xl max-h-[90vh] flex items-center justify-center overflow-hidden rounded-2xl shadow-2xl bg-black/20">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                            src={activeImage} 
                            alt="Full Screen Preview" 
                            className="max-w-full max-h-[90vh] object-contain rounded-2xl select-none"
                            onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking the image itself
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

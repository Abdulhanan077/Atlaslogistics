'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, X, Loader2, User, Phone, Paperclip, FileText, ExternalLink } from 'lucide-react';

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

export default function TrackingChat({ shipmentId }: { shipmentId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [activeImage, setActiveImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const handleOpenChat = () => setIsOpen(true);
        window.addEventListener('open-chat', handleOpenChat);
        return () => window.removeEventListener('open-chat', handleOpenChat);
    }, []);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = '38px';
            const scrollHeight = textareaRef.current.scrollHeight;
            textareaRef.current.style.height = `${Math.min(scrollHeight, 200)}px`;
        }
    }, [newMessage]);

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
                <div className="fixed bottom-6 right-6 w-80 md:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[600px]">
                    {/* Header */}
                    <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
                                <Phone className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <h3 className="text-slate-900 font-bold text-sm">Support Chat</h3>
                                <p className="text-xs text-slate-500">Ask us anything about your shipment</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-slate-400 hover:text-slate-900 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div
                        ref={scrollRef}
                        className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50 min-h-[300px]"
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
                                        className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${msg.sender === 'CLIENT'
                                            ? 'bg-blue-600 text-white rounded-tr-none'
                                            : 'bg-white text-slate-700 rounded-tl-none border border-slate-200'
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
                                                        className="flex items-center gap-3 bg-slate-100 hover:bg-slate-200/80 p-3 rounded-xl border border-slate-350 transition-colors mb-2 text-slate-700 font-medium group cursor-pointer"
                                                    >
                                                        <FileText className="w-8 h-8 text-red-500 shrink-0" />
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-xs truncate font-bold text-slate-800">{fileName}</p>
                                                            <p className="text-[10px] text-slate-400">PDF Document • Open</p>
                                                        </div>
                                                        <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors shrink-0" />
                                                    </a>
                                                );
                                            } else {
                                                return (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img 
                                                        src={msg.imageUrl} 
                                                        alt="Attached" 
                                                        className="max-w-full rounded-xl mb-2 border border-slate-200 cursor-zoom-in hover:opacity-90 active:scale-[0.98] transition-all" 
                                                        onClick={() => setActiveImage(msg.imageUrl || null)}
                                                    />
                                                );
                                            }
                                        })()}
                                        {msg.content && <p className="whitespace-pre-wrap">{renderMessageContent(msg.content, msg.sender === 'CLIENT')}</p>}
                                        <p className={`text-[10px] mt-1 ${msg.sender === 'CLIENT' ? 'text-blue-200' : 'text-slate-400'}`}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-200">
                        <div className="flex items-end gap-3 bg-slate-50 border border-slate-200 rounded-[1.5rem] p-2 pr-2 focus-within:border-blue-300 transition-all shadow-inner">
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
                                className="p-2.5 text-slate-400 hover:text-blue-500 hover:bg-white rounded-full transition-all disabled:opacity-50 shrink-0"
                                title="Attach File (Image or PDF)"
                            >
                                {uploadingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
                            </button>
                            
                            <textarea
                                ref={textareaRef}
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                rows={1}
                                placeholder="Type a message..."
                                className="flex-1 bg-transparent border-none text-slate-900 text-sm focus:ring-0 outline-none resize-none py-2.5 max-h-[180px] scrollbar-hide"
                                style={{ minHeight: '40px' }}
                            />
                            
                            <button
                                type="submit"
                                disabled={sending || uploadingImage || !newMessage.trim()}
                                className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full disabled:opacity-50 disabled:grayscale transition-all shadow-md active:scale-95 shrink-0"
                            >
                                {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            </button>
                        </div>
                    </form>
                </div>
            )}

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
        </>
    );
}

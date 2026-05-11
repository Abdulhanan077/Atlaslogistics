'use client';

import { useState, useEffect } from 'react';
import { Trash2, Image as ImageIcon, Video, Calendar, Package, Loader2, Search, ExternalLink, ShieldAlert } from 'lucide-react';
import { toast } from 'react-hot-toast';
import FormattedDate from '@/components/FormattedDate';

interface MediaItem {
    url: string;
    type: 'image' | 'video';
    shipmentId: string;
    trackingNumber: string;
    createdAt: string;
}

export default function MediaManager() {
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [totalSize, setTotalSize] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleting, setDeleting] = useState<string | null>(null);

    const STORAGE_LIMIT = 5 * 1024 * 1024 * 1024; // 5GB limit

    const fetchMedia = async () => {
        try {
            const res = await fetch('/api/media');
            if (res.ok) {
                const data = await res.json();
                setMedia(data.media || []);
                setTotalSize(data.totalSize || 0);
            }
        } catch (error) {
            console.error('Failed to fetch media', error);
            toast.error('Failed to load media');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMedia();
    }, []);

    const handleDelete = async (item: MediaItem) => {
        const itemDate = new Date(item.createdAt);
        const oneMonthAgo = new Date();
        oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

        if (itemDate > oneMonthAgo) {
            toast.error('Media less than 1 month old cannot be deleted', {
                icon: '🛡️',
                duration: 4000
            });
            return;
        }

        if (!confirm('Are you sure you want to delete this media? This action cannot be undone.')) return;

        setDeleting(item.url);
        try {
            const res = await fetch('/api/media', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    url: item.url, 
                    shipmentId: item.shipmentId,
                    type: item.type
                })
            });

            if (res.ok) {
                toast.success('Media deleted successfully');
                setMedia(prev => prev.filter(m => m.url !== item.url));
            } else {
                const text = await res.text();
                toast.error(text || 'Failed to delete media');
            }
        } catch (error) {
            console.error('Delete error', error);
            toast.error('Server error during deletion');
        } finally {
            setDeleting(null);
        }
    };

    const filteredMedia = media.filter(m => 
        m.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isDeletable = (date: string) => {
        const itemDate = new Date(date);
        const oneMonthAgo = new Date();
        oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
        return itemDate <= oneMonthAgo;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-brand-text-muted">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
                <p>Scanning shipments for media files...</p>
            </div>
        );
    }

    const totalImages = media.filter(m => m.type === 'image').length;
    const totalVideos = media.filter(m => m.type === 'video').length;
    const deletableCount = media.filter(m => isDeletable(m.createdAt)).length;
    const protectedCount = media.length - deletableCount;

    return (
        <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar - Space Usage & Stats */}
            <div className="lg:w-80 flex flex-col gap-6 shrink-0">
                <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 space-y-6 sticky top-6">
                    <div>
                        <h3 className="text-brand-text font-bold flex items-center gap-2 mb-4">
                            <ShieldAlert className="w-5 h-5 text-blue-400" />
                            Storage Insights
                        </h3>
                        <div className="space-y-4">
                            <div className="p-4 bg-brand-bg rounded-xl border border-brand-border">
                                <p className="text-xs text-brand-text-muted mb-1">Total Files</p>
                                <p className="text-2xl font-black text-brand-text">{media.length}</p>
                            </div>

                            <div className="p-4 bg-brand-bg rounded-xl border border-brand-border">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-xs text-brand-text-muted">Storage Used</p>
                                    <p className="text-xs font-bold text-brand-text">
                                        {(totalSize / (1024 * 1024)).toFixed(1)} MB / 5 GB
                                    </p>
                                </div>
                                <div className="w-full bg-brand-surface h-2 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-blue-500 transition-all duration-500" 
                                        style={{ width: `${Math.min((totalSize / STORAGE_LIMIT) * 100, 100)}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-brand-text-muted mt-2">
                                    {((STORAGE_LIMIT - totalSize) / (1024 * 1024)).toFixed(1)} MB available
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                                <div className="p-3 bg-brand-bg rounded-xl border border-brand-border">
                                    <p className="text-[10px] text-brand-text-muted mb-1 uppercase font-bold">Images</p>
                                    <p className="text-lg font-black text-blue-400">{totalImages}</p>
                                </div>
                                <div className="p-3 bg-brand-bg rounded-xl border border-brand-border">
                                    <p className="text-[10px] text-brand-text-muted mb-1 uppercase font-bold">Videos</p>
                                    <p className="text-lg font-black text-purple-400">{totalVideos}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-xs font-bold text-brand-text-muted uppercase tracking-widest">Retention Status</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-brand-text-muted">Protected (Recent)</span>
                                <span className="text-orange-400 font-bold">{protectedCount}</span>
                            </div>
                            <div className="w-full bg-brand-bg h-1.5 rounded-full overflow-hidden">
                                <div className="bg-orange-500 h-full" style={{ width: `${(protectedCount / media.length) * 100}%` }} />
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-brand-text-muted">Deletable (&gt; 30d)</span>
                                <span className="text-green-400 font-bold">{deletableCount}</span>
                            </div>
                            <div className="w-full bg-brand-bg h-1.5 rounded-full overflow-hidden">
                                <div className="bg-green-500 h-full" style={{ width: `${(deletableCount / media.length) * 100}%` }} />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-brand-border">
                        <p className="text-[10px] text-brand-text-muted leading-relaxed italic">
                            Platform policy: Proof documents are cryptographically locked for 30 days post-upload to ensure audit compliance.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content - Gallery */}
            <div className="flex-1 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-surface p-4 rounded-2xl border border-brand-border">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted" />
                        <input
                            type="text"
                            placeholder="Search by tracking number..."
                            className="w-full bg-brand-bg border border-brand-border rounded-xl pl-10 pr-4 py-2 text-brand-text focus:ring-1 focus:ring-blue-500 outline-none"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {filteredMedia.length === 0 ? (
                    <div className="bg-brand-surface border border-brand-border rounded-2xl p-12 text-center text-brand-text-muted">
                        <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="text-lg font-medium">No media files found</p>
                        <p className="text-sm">Try a different search term or upload media to shipments.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredMedia.map((item, idx) => {
                            const deletable = isDeletable(item.createdAt);
                            return (
                                <div key={idx} className="group bg-brand-surface border border-brand-border rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all hover:shadow-xl hover:shadow-blue-500/5">
                                    <div className="aspect-video relative bg-brand-bg">
                                        {item.type === 'image' ? (
                                            <img src={item.url} alt="media" className="w-full h-full object-cover" />
                                        ) : (
                                            <video src={item.url} className="w-full h-full object-cover" />
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                            <a href={item.url} target="_blank" rel="noreferrer" className="p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md text-white transition-all">
                                                <ExternalLink className="w-5 h-5" />
                                            </a>
                                            <button
                                                onClick={() => handleDelete(item)}
                                                disabled={deleting === item.url}
                                                className={`p-2 rounded-full backdrop-blur-md transition-all ${
                                                    deletable 
                                                    ? 'bg-red-500/20 hover:bg-red-500/40 text-red-500' 
                                                    : 'bg-gray-500/20 cursor-not-allowed text-gray-400'
                                                }`}
                                                title={deletable ? 'Delete Media' : 'Cannot delete media < 1 month old'}
                                            >
                                                {deleting === item.url ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        <div className="absolute top-2 left-2">
                                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border ${
                                                item.type === 'image' 
                                                ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' 
                                                : 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                                            }`}>
                                                {item.type}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-4 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center text-brand-text font-mono text-sm font-bold">
                                                <Package className="w-3 h-3 mr-2 text-brand-text-muted" />
                                                {item.trackingNumber}
                                            </div>
                                            {!deletable && (
                                                <span title="Protected: < 1 month old">
                                                    <ShieldAlert className="w-4 h-4 text-orange-500" />
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center text-xs text-brand-text-muted">
                                            <Calendar className="w-3 h-3 mr-2" />
                                            <FormattedDate date={item.createdAt} mode="date" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

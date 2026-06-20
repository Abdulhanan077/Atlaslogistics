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
    isDeleted: boolean;
}

export default function MediaManager() {
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [totalSize, setTotalSize] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleting, setDeleting] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'deleted'>('all');
    const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
    const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
    const [bulkDeleting, setBulkDeleting] = useState(false);

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

    const handleBulkDelete = async () => {
        const itemsToDelete = media.filter(m => selectedUrls.includes(m.url));
        const undeletableItems = itemsToDelete.filter(item => !isDeletable(item.createdAt));
        
        if (undeletableItems.length > 0) {
            toast.error(
                `Selected ${undeletableItems.length} items are less than 30 days old and protected under the retention policy.`, 
                { icon: '🛡️', duration: 4500 }
            );
            return;
        }

        if (!confirm(`Are you sure you want to delete these ${itemsToDelete.length} selected items? This action cannot be undone.`)) {
            return;
        }

        setBulkDeleting(true);
        try {
            const res = await fetch('/api/media', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    items: itemsToDelete.map(item => ({
                        url: item.url,
                        shipmentId: item.shipmentId,
                        type: item.type
                    }))
                })
            });

            if (res.ok) {
                toast.success(`Successfully deleted ${itemsToDelete.length} media items`);
                setMedia(prev => prev.filter(m => !selectedUrls.includes(m.url)));
                setSelectedUrls([]);
            } else {
                const text = await res.text();
                toast.error(text || 'Failed to delete selected media');
            }
        } catch (error) {
            console.error('Bulk delete error', error);
            toast.error('Server error during bulk deletion');
        } finally {
            setBulkDeleting(false);
        }
    };

    const filteredMedia = media
        .filter(m => {
            const matchesSearch = m.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase());
            if (!matchesSearch) return false;
            
            if (statusFilter === 'active') return !m.isDeleted;
            if (statusFilter === 'deleted') return m.isDeleted;
            return true;
        })
        .sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
        });

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
    const deletedCount = media.filter(m => m.isDeleted).length;
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
                            
                            <div className="grid grid-cols-3 gap-2">
                                <div className="p-3 bg-brand-bg rounded-xl border border-brand-border">
                                    <p className="text-[10px] text-brand-text-muted mb-1 uppercase font-bold text-center">Images</p>
                                    <p className="text-lg font-black text-blue-400 text-center">{totalImages}</p>
                                </div>
                                <div className="p-3 bg-brand-bg rounded-xl border border-brand-border">
                                    <p className="text-[10px] text-brand-text-muted mb-1 uppercase font-bold text-center">Videos</p>
                                    <p className="text-lg font-black text-purple-400 text-center">{totalVideos}</p>
                                </div>
                                <div className="p-3 bg-brand-bg rounded-xl border border-brand-border">
                                    <p className="text-[10px] text-brand-text-muted mb-1 uppercase font-bold text-center">Deleted</p>
                                    <p className="text-lg font-black text-red-400 text-center">{deletedCount}</p>
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
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-brand-surface p-4 rounded-2xl border border-brand-border">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted" />
                        <input
                            type="text"
                            placeholder="Search by tracking number..."
                            className="w-full bg-brand-bg border border-brand-border rounded-xl pl-10 pr-4 py-2 text-brand-text focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value as any)}
                            className="bg-brand-bg border border-brand-border rounded-xl px-3 py-2 text-sm text-brand-text focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer"
                        >
                            <option value="all">All Shipments</option>
                            <option value="active">Active Only</option>
                            <option value="deleted">Deleted (Recycle Bin)</option>
                        </select>

                        <select
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value as any)}
                            className="bg-brand-bg border border-brand-border rounded-xl px-3 py-2 text-sm text-brand-text focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                        </select>
                    </div>
                    {filteredMedia.length > 0 && (
                        <button
                            type="button"
                            onClick={() => {
                                const visibleUrls = filteredMedia.map(m => m.url);
                                const allSelected = visibleUrls.every(url => selectedUrls.includes(url));
                                if (allSelected) {
                                    setSelectedUrls(prev => prev.filter(url => !visibleUrls.includes(url)));
                                } else {
                                    setSelectedUrls(prev => {
                                        const next = [...prev];
                                        visibleUrls.forEach(url => {
                                            if (!next.includes(url)) next.push(url);
                                        });
                                        return next;
                                    });
                                }
                            }}
                            className="bg-brand-bg hover:bg-brand-surface border border-brand-border rounded-xl px-4 py-2 text-sm text-brand-text cursor-pointer transition-colors shadow-sm font-semibold shrink-0"
                        >
                            {filteredMedia.map(m => m.url).every(url => selectedUrls.includes(url)) ? 'Deselect All' : 'Select All'}
                        </button>
                    )}
                </div>

                {selectedUrls.length > 0 && (
                    <div className="flex items-center justify-between bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl animate-fade-in">
                        <div className="text-sm text-brand-text">
                            Selected <span className="font-bold text-blue-400">{selectedUrls.length}</span> items
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setSelectedUrls([])}
                                className="text-xs text-brand-text-muted hover:text-brand-text transition-colors"
                            >
                                Clear Selection
                            </button>
                            <button
                                onClick={handleBulkDelete}
                                disabled={bulkDeleting}
                                className="bg-red-600 hover:bg-red-500 disabled:bg-red-600/50 text-white font-semibold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-lg shadow-red-500/15 transition-all cursor-pointer"
                            >
                                {bulkDeleting ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Delete Selected
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

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
                                        <div className="absolute top-2 right-2 z-10 flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedUrls.includes(item.url)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedUrls(prev => [...prev, item.url]);
                                                    } else {
                                                        setSelectedUrls(prev => prev.filter(u => u !== item.url));
                                                    }
                                                }}
                                                className="w-5 h-5 rounded border-brand-border bg-brand-bg/85 text-blue-500 focus:ring-blue-500 cursor-pointer accent-blue-500 shadow-md transition-all hover:scale-105"
                                            />
                                        </div>
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
                                        <div className="absolute top-2 left-2 flex gap-1">
                                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border ${
                                                item.type === 'image' 
                                                ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' 
                                                : 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                                            }`}>
                                                {item.type}
                                            </span>
                                            {item.isDeleted && (
                                                <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border bg-red-500/20 text-red-400 border-red-500/30 flex items-center gap-1">
                                                    🗑️ Deleted
                                                </span>
                                            )}
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

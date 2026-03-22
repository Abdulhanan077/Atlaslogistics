'use client';

import { useState, useEffect } from 'react';
import { Building2, Mail, Phone, Upload, Loader2, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function SettingsDashboard() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [settings, setSettings] = useState({
        companyName: '',
        supportEmail: '',
        supportPhone: '',
        logoUrl: ''
    });

    useEffect(() => {
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => {
                if (data) {
                    setSettings({
                        companyName: data.companyName || '',
                        supportEmail: data.supportEmail || '',
                        supportPhone: data.supportPhone || '',
                        logoUrl: data.logoUrl || ''
                    });
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                toast.error('Failed to load settings');
                setLoading(false);
            });
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            if (res.ok) {
                toast.success('Settings saved successfully!');
            } else {
                toast.error('Failed to save settings');
            }
        } catch (err) {
            toast.error('Error saving settings');
        } finally {
            setSaving(false);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const toastId = toast.loading('Uploading logo...');
        try {
            const response = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
                method: 'POST',
                body: file,
            });
            
            if (!response.ok) throw new Error('Upload failed');
            
            const newBlob = await response.json();
            setSettings(prev => ({ ...prev, logoUrl: newBlob.url }));
            toast.success('Logo uploaded successfully', { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error('Failed to upload logo', { id: toastId });
        }
    };

    if (loading) {
        return <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Platform Settings</h1>
                <p className="text-slate-400">Manage your company branding, contact details, and global preferences.</p>
            </div>

            <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-slate-900 to-slate-950">
                {/* Branding Section */}
                <div className="p-8 border-b border-slate-800/50">
                    <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-blue-500" />
                        Brand Identity
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Logo Upload Zone */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Company Logo</label>
                            <div className="relative group rounded-2xl border-2 border-dashed border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-blue-500 transition-all text-center overflow-hidden aspect-video flex flex-col items-center justify-center cursor-pointer">
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleLogoUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                />
                                {settings.logoUrl ? (
                                    <>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={settings.logoUrl} alt="Logo" className="absolute inset-0 w-full h-full object-contain p-4 bg-white" />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <p className="text-white font-medium flex items-center gap-2">
                                                <Upload className="w-4 h-4" /> Change Logo
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-slate-400 pointer-events-none p-4 w-full">
                                        <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Upload className="w-6 h-6 text-blue-500 opacity-80" />
                                        </div>
                                        <p className="text-sm font-medium text-slate-300">Click to upload brand logo</p>
                                        <p className="text-xs mt-1 opacity-60">PNG or JPG up to 5MB</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Company Name */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Company Name</label>
                                <input
                                    type="text"
                                    required
                                    value={settings.companyName}
                                    onChange={e => setSettings({...settings, companyName: e.target.value})}
                                    placeholder="e.g. Atlas Logistics"
                                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                                <p className="text-xs text-slate-500 mt-3 leading-relaxed">This official name will be proudly displayed automatically across your tracking pages, PDF shipment waybills, and email notifications.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Section */}
                <div className="p-8 border-b border-slate-800/50">
                    <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <Mail className="w-5 h-5 text-purple-500" />
                        Support Contact
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Support Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                                <input
                                    type="email"
                                    value={settings.supportEmail}
                                    onChange={e => setSettings({...settings, supportEmail: e.target.value})}
                                    placeholder="support@domain.com"
                                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-blue-500 filter-none outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Support Phone (Optional)</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                                <input
                                    type="tel"
                                    value={settings.supportPhone}
                                    onChange={e => setSettings({...settings, supportPhone: e.target.value})}
                                    placeholder="+1 (555) 000-0000"
                                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Footbar */}
                <div className="p-6 bg-slate-900 flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] disabled:opacity-50 disabled:shadow-none"
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
}

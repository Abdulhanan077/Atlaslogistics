'use client';

import { useState, useEffect } from 'react';
import { Building2, Mail, Phone, Upload, Loader2, Save, Moon, Sun, Trash2, Coins, CreditCard, ToggleLeft, ToggleRight, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTheme } from '@/components/ThemeProvider';
import { upload } from '@vercel/blob/client';
import { useSession } from 'next-auth/react';

export default function SettingsDashboard() {
    const { data: session } = useSession();
    const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN';
    const { theme, setTheme } = useTheme();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [customCrypto, setCustomCrypto] = useState<Array<{ id: string; name: string; address: string; enabled: boolean }>>([]);
    const [customStandard, setCustomStandard] = useState<Array<{ id: string; name: string; value: string; payeeName: string; enabled: boolean }>>([]);
    
    const [settings, setSettings] = useState({
        companyName: '',
        supportEmail: '',
        chatNotificationEmail: '',
        supportPhone: '',
        logoUrl: '',
        theme: 'dark' as 'dark' | 'light',
        usdtTrc20Address: '',
        usdtTrc20Enabled: true,
        usdtBep20Address: '',
        usdtBep20Enabled: true,
        btcAddress: '',
        btcEnabled: true,
        paypalEmail: '',
        paypalEnabled: false,
        paypalName: '',
        cashappTag: '',
        cashappEnabled: false,
        cashappName: '',
        venmoTag: '',
        venmoEnabled: false,
        venmoName: '',
        zelleEmail: '',
        zelleEnabled: false,
        zelleName: ''
    });

    useEffect(() => {
        fetch('/api/settings')
            .then(async (res) => {
                if (!res.ok) throw new Error('Failed to load settings');
                return res.json();
            })
            .then(data => {
                if (data) {
                    setSettings({
                        companyName: data.companyName || '',
                        supportEmail: data.supportEmail || '',
                        chatNotificationEmail: data.chatNotificationEmail || '',
                        supportPhone: data.supportPhone || '',
                        logoUrl: data.logoUrl || '',
                        theme: data.theme || 'dark',
                        usdtTrc20Address: data.usdtTrc20Address || '',
                        usdtTrc20Enabled: data.usdtTrc20Enabled !== undefined ? data.usdtTrc20Enabled : true,
                        usdtBep20Address: data.usdtBep20Address || '',
                        usdtBep20Enabled: data.usdtBep20Enabled !== undefined ? data.usdtBep20Enabled : true,
                        btcAddress: data.btcAddress || '',
                        btcEnabled: data.btcEnabled !== undefined ? data.btcEnabled : true,
                        paypalEmail: data.paypalEmail || '',
                        paypalEnabled: data.paypalEnabled || false,
                        paypalName: data.paypalName || '',
                        cashappTag: data.cashappTag || '',
                        cashappEnabled: data.cashappEnabled || false,
                        cashappName: data.cashappName || '',
                        venmoTag: data.venmoTag || '',
                        venmoEnabled: data.venmoEnabled || false,
                        venmoName: data.venmoName || '',
                        zelleEmail: data.zelleEmail || '',
                        zelleEnabled: data.zelleEnabled || false,
                        zelleName: data.zelleName || ''
                    });
                    
                    if (data.customCryptoMethods) {
                        try {
                            setCustomCrypto(JSON.parse(data.customCryptoMethods));
                        } catch (e) {
                            console.error(e);
                        }
                    }
                    if (data.customStandardMethods) {
                        try {
                            setCustomStandard(JSON.parse(data.customStandardMethods));
                        } catch (e) {
                            console.error(e);
                        }
                    }

                    // Also update global theme if different
                    if (data.theme && data.theme !== theme) {
                        setTheme(data.theme);
                    }
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
                body: JSON.stringify({
                    ...settings,
                    customCryptoMethods: JSON.stringify(customCrypto),
                    customStandardMethods: JSON.stringify(customStandard)
                })
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
            const newBlob = await upload(file.name, file, {
                access: 'public',
                handleUploadUrl: '/api/upload/token',
            });
            
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
                <h1 className="text-3xl font-bold text-brand-text mb-2">Platform Settings</h1>
                <p className="text-brand-text-muted">Manage your company branding, contact details, and global preferences.</p>
            </div>

            <form onSubmit={handleSave} className="bg-brand-surface border border-brand-border rounded-3xl overflow-hidden shadow-2xl transition-colors duration-300">
                {/* Branding Section */}
                <div className="p-8 border-b border-brand-border/50">
                    <h2 className="text-xl font-semibold text-brand-text mb-6 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-blue-500" />
                        Brand Identity
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Logo Upload Zone */}
                        <div>
                            <label className="block text-sm font-medium text-brand-text-muted mb-2">Company Logo</label>
                            <div className="relative group rounded-2xl border-2 border-dashed border-brand-border/50 bg-brand-bg hover:bg-brand-surface hover:border-blue-500 transition-all text-center overflow-hidden aspect-video flex flex-col items-center justify-center cursor-pointer">
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
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                            <div className="relative">
                                                <input 
                                                    type="file" 
                                                    accept="image/*" 
                                                    onChange={handleLogoUpload}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                                />
                                                <p className="text-white font-medium flex items-center gap-2 pointer-events-none">
                                                    <Upload className="w-4 h-4" /> Change
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSettings(prev => ({ ...prev, logoUrl: '' }));
                                                }}
                                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors relative z-20"
                                            >
                                                <Trash2 className="w-4 h-4" /> Remove
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-brand-text-muted pointer-events-none p-4 w-full">
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
                                <label className="block text-sm font-medium text-brand-text-muted mb-2">Company Name</label>
                                <input
                                    type="text"
                                    required
                                    value={settings.companyName}
                                    onChange={e => setSettings({...settings, companyName: e.target.value})}
                                    placeholder="e.g. Atlas Logistics"
                                    className="w-full bg-brand-surface border border-brand-border text-brand-text rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                                <p className="text-xs text-brand-text-muted/80 mt-3 leading-relaxed">This official name will be proudly displayed automatically across your tracking pages, PDF shipment waybills, and email notifications.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Section */}
                <div className="p-8 border-b border-brand-border/50">
                    <h2 className="text-xl font-semibold text-brand-text mb-6 flex items-center gap-2">
                        <Mail className="w-5 h-5 text-purple-500" />
                        Support Contact
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-brand-text-muted mb-2">Support Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-brand-text-muted/80" />
                                <input
                                    type="email"
                                    value={settings.supportEmail}
                                    onChange={e => setSettings({...settings, supportEmail: e.target.value})}
                                    placeholder="support@domain.com"
                                    className="w-full bg-brand-surface border border-brand-border text-brand-text rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-blue-500 filter-none outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-brand-text-muted mb-2">Support Phone (Optional)</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-3.5 w-5 h-5 text-brand-text-muted/80" />
                                <input
                                    type="tel"
                                    value={settings.supportPhone}
                                    onChange={e => setSettings({...settings, supportPhone: e.target.value})}
                                    placeholder="+1 (555) 000-0000"
                                    className="w-full bg-brand-surface border border-brand-border text-brand-text rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Email Notifications Section */}
                <div className="p-8 border-b border-brand-border/50">
                    <h2 className="text-xl font-semibold text-brand-text mb-6 flex items-center gap-2">
                        <Mail className="w-5 h-5 text-amber-500" />
                        Notification Settings
                    </h2>
                    <p className="text-sm text-brand-text-muted mb-6">
                        Configure where you want to receive alerts and notifications for the platform.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-brand-text-muted mb-2">Chat Notification Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-brand-text-muted/80" />
                                <input
                                    type="email"
                                    value={settings.chatNotificationEmail}
                                    onChange={e => setSettings({...settings, chatNotificationEmail: e.target.value})}
                                    placeholder="notifications@domain.com"
                                    className="w-full bg-brand-surface border border-brand-border text-brand-text rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>
                            <p className="text-xs text-brand-text-muted/80 mt-2">
                                New client messages in shipment chats will be forwarded to this email address. If left blank, it defaults to the email of the administrator who created the shipment.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Appearance Section */}
                <div className="p-8 border-b border-brand-border/50">
                    <h2 className="text-xl font-semibold text-brand-text mb-6 flex items-center gap-2">
                        <Moon className="w-5 h-5 text-indigo-500" />
                        Appearance
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-brand-text-muted mb-4">Platform Theme</label>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSettings({ ...settings, theme: 'dark' });
                                        setTheme('dark');
                                    }}
                                    className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                                        settings.theme === 'dark' 
                                        ? 'bg-blue-600/10 border-blue-600 text-brand-text' 
                                        : 'bg-brand-bg border-brand-border text-brand-text-muted hover:border-brand-border/50'
                                    }`}
                                >
                                    <Moon className="w-5 h-5" />
                                    Dark Mode
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSettings({ ...settings, theme: 'light' });
                                        setTheme('light');
                                    }}
                                    className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                                        settings.theme === 'light' 
                                        ? 'bg-blue-600/10 border-blue-600 text-brand-text' 
                                        : 'bg-brand-bg border-brand-border text-brand-text-muted hover:border-brand-border/50'
                                    }`}
                                >
                                    <Sun className="w-5 h-5" />
                                    Light Mode
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Crypto Payment Configurations */}
                {isSuperAdmin && (
                    <div className="p-8 border-b border-brand-border/50">
                        <h2 className="text-xl font-semibold text-brand-text mb-6 flex items-center gap-2">
                            <Coins className="w-5 h-5 text-emerald-500" />
                            Crypto Payment Methods
                        </h2>
                        <p className="text-sm text-brand-text-muted mb-6">
                            Configure the wallet addresses for your platform and toggle their visibility on the customer pay portal.
                        </p>

                        <div className="space-y-6">
                            <div className="bg-brand-bg/50 border border-brand-border/50 rounded-2xl p-6 space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="block text-sm font-semibold text-brand-text">USDT Wallet Address (TRC-20 Network)</label>
                                    <button
                                        type="button"
                                        onClick={() => setSettings({ ...settings, usdtTrc20Enabled: !settings.usdtTrc20Enabled })}
                                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                            settings.usdtTrc20Enabled ? 'bg-emerald-600' : 'bg-slate-700'
                                        }`}
                                    >
                                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                            settings.usdtTrc20Enabled ? 'translate-x-5' : 'translate-x-0'
                                        }`} />
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={settings.usdtTrc20Address}
                                    onChange={e => setSettings({...settings, usdtTrc20Address: e.target.value})}
                                    placeholder="e.g. TX... (Tron TRC20 Address)"
                                    className="w-full bg-brand-surface border border-brand-border text-brand-text rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono text-sm"
                                />
                            </div>

                            <div className="bg-brand-bg/50 border border-brand-border/50 rounded-2xl p-6 space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="block text-sm font-semibold text-brand-text">USDT Wallet Address (BEP-20 Network)</label>
                                    <button
                                        type="button"
                                        onClick={() => setSettings({ ...settings, usdtBep20Enabled: !settings.usdtBep20Enabled })}
                                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                            settings.usdtBep20Enabled ? 'bg-indigo-600' : 'bg-slate-700'
                                        }`}
                                    >
                                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                            settings.usdtBep20Enabled ? 'translate-x-5' : 'translate-x-0'
                                        }`} />
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={settings.usdtBep20Address}
                                    onChange={e => setSettings({...settings, usdtBep20Address: e.target.value})}
                                    placeholder="e.g. 0x... (BNB Smart Chain BEP20 Address)"
                                    className="w-full bg-brand-surface border border-brand-border text-brand-text rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono text-sm"
                                />
                            </div>

                            <div className="bg-brand-bg/50 border border-brand-border/50 rounded-2xl p-6 space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="block text-sm font-semibold text-brand-text">Bitcoin (BTC) Wallet Address</label>
                                    <button
                                        type="button"
                                        onClick={() => setSettings({ ...settings, btcEnabled: !settings.btcEnabled })}
                                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                            settings.btcEnabled ? 'bg-amber-600' : 'bg-slate-700'
                                        }`}
                                    >
                                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                            settings.btcEnabled ? 'translate-x-5' : 'translate-x-0'
                                        }`} />
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={settings.btcAddress}
                                    onChange={e => setSettings({...settings, btcAddress: e.target.value})}
                                    placeholder="e.g. 1... or bc1... (Bitcoin Wallet Address)"
                                    className="w-full bg-brand-surface border border-brand-border text-brand-text rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono text-sm"
                                />
                            </div>

                            {/* Custom Crypto Methods */}
                            {customCrypto.map((method, index) => (
                                <div key={method.id || index} className="bg-brand-bg/50 border border-brand-border/50 rounded-2xl p-6 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex-1 mr-4">
                                            <input
                                                type="text"
                                                value={method.name}
                                                required
                                                onChange={e => {
                                                    const updated = [...customCrypto];
                                                    updated[index].name = e.target.value;
                                                    setCustomCrypto(updated);
                                                }}
                                                placeholder="e.g. Ethereum (ETH)"
                                                className="bg-transparent border-b border-brand-border text-brand-text font-semibold focus:border-blue-500 focus:outline-none px-1 py-0.5 text-sm w-full"
                                            />
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const updated = [...customCrypto];
                                                    updated[index].enabled = !updated[index].enabled;
                                                    setCustomCrypto(updated);
                                                }}
                                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                                    method.enabled ? 'bg-emerald-600' : 'bg-slate-700'
                                                }`}
                                            >
                                                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                    method.enabled ? 'translate-x-5' : 'translate-x-0'
                                                }`} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setCustomCrypto(customCrypto.filter((_, i) => i !== index));
                                                }}
                                                className="text-red-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                                                title="Delete custom crypto method"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-brand-text-muted mb-2">Wallet Address</label>
                                        <input
                                            type="text"
                                            required
                                            value={method.address}
                                            onChange={e => {
                                                const updated = [...customCrypto];
                                                updated[index].address = e.target.value;
                                                setCustomCrypto(updated);
                                            }}
                                            placeholder="e.g. 0x..."
                                            className="w-full bg-brand-surface border border-brand-border text-brand-text rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono text-sm"
                                        />
                                    </div>
                                </div>
                            ))}

                            <div className="flex justify-end pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCustomCrypto([...customCrypto, { id: Math.random().toString(36).substring(7), name: '', address: '', enabled: true }]);
                                    }}
                                    className="flex items-center gap-1.5 text-xs font-bold text-blue-500 hover:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 px-4 py-2 rounded-xl transition-all"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Add Custom Crypto
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Standard Payment Configurations */}
                {isSuperAdmin && (
                    <div className="p-8 border-b border-brand-border/50">
                        <h2 className="text-xl font-semibold text-brand-text mb-6 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-blue-500" />
                            Standard Payment Methods
                        </h2>
                        <p className="text-sm text-brand-text-muted mb-6">
                            Configure standard fiat payment accounts (PayPal, CashApp, Venmo, and Zelle) for the tracking payment portal. Enable methods only when you are ready to receive payments.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* PayPal */}
                            <div className="bg-brand-bg/50 border border-brand-border/50 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-brand-text flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                                            PayPal
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setSettings({ ...settings, paypalEnabled: !settings.paypalEnabled })}
                                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                                settings.paypalEnabled ? 'bg-blue-600' : 'bg-slate-700'
                                            }`}
                                        >
                                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                settings.paypalEnabled ? 'translate-x-5' : 'translate-x-0'
                                            }`} />
                                        </button>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-brand-text-muted mb-2">PayPal Email Address</label>
                                        <input
                                            type="email"
                                            value={settings.paypalEmail}
                                            onChange={e => setSettings({...settings, paypalEmail: e.target.value})}
                                            placeholder="e.g. billing@company.com"
                                            className="w-full bg-brand-surface border border-brand-border text-brand-text rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-brand-text-muted mb-2">Payee Name (Optional)</label>
                                        <input
                                            type="text"
                                            value={settings.paypalName}
                                            onChange={e => setSettings({...settings, paypalName: e.target.value})}
                                            placeholder="e.g. Atlas Logistics Inc."
                                            className="w-full bg-brand-surface border border-brand-border text-brand-text rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* CashApp */}
                            <div className="bg-brand-bg/50 border border-brand-border/50 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-brand-text flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                            CashApp
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setSettings({ ...settings, cashappEnabled: !settings.cashappEnabled })}
                                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                                settings.cashappEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                                            }`}
                                        >
                                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                settings.cashappEnabled ? 'translate-x-5' : 'translate-x-0'
                                            }`} />
                                        </button>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-brand-text-muted mb-2">CashApp Tag</label>
                                        <input
                                            type="text"
                                            value={settings.cashappTag}
                                            onChange={e => setSettings({...settings, cashappTag: e.target.value})}
                                            placeholder="e.g. $MyCompanyTag"
                                            className="w-full bg-brand-surface border border-brand-border text-brand-text rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-brand-text-muted mb-2">Payee Name (Optional)</label>
                                        <input
                                            type="text"
                                            value={settings.cashappName}
                                            onChange={e => setSettings({...settings, cashappName: e.target.value})}
                                            placeholder="e.g. Atlas Logistics"
                                            className="w-full bg-brand-surface border border-brand-border text-brand-text rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Venmo */}
                            <div className="bg-brand-bg/50 border border-brand-border/50 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-brand-text flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                                            Venmo
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setSettings({ ...settings, venmoEnabled: !settings.venmoEnabled })}
                                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                                settings.venmoEnabled ? 'bg-sky-500' : 'bg-slate-700'
                                            }`}
                                        >
                                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                settings.venmoEnabled ? 'translate-x-5' : 'translate-x-0'
                                            }`} />
                                        </button>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-brand-text-muted mb-2">Venmo Username</label>
                                        <input
                                            type="text"
                                            value={settings.venmoTag}
                                            onChange={e => setSettings({...settings, venmoTag: e.target.value})}
                                            placeholder="e.g. @MyCompanyVenmo"
                                            className="w-full bg-brand-surface border border-brand-border text-brand-text rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-brand-text-muted mb-2">Payee Name (Optional)</label>
                                        <input
                                            type="text"
                                            value={settings.venmoName}
                                            onChange={e => setSettings({...settings, venmoName: e.target.value})}
                                            placeholder="e.g. Atlas Logistics"
                                            className="w-full bg-brand-surface border border-brand-border text-brand-text rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Zelle */}
                            <div className="bg-brand-bg/50 border border-brand-border/50 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-brand-text flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                                            Zelle
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setSettings({ ...settings, zelleEnabled: !settings.zelleEnabled })}
                                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                                settings.zelleEnabled ? 'bg-purple-500' : 'bg-slate-700'
                                            }`}
                                        >
                                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                settings.zelleEnabled ? 'translate-x-5' : 'translate-x-0'
                                            }`} />
                                        </button>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-brand-text-muted mb-2">Zelle Email / Phone</label>
                                        <input
                                            type="text"
                                            value={settings.zelleEmail}
                                            onChange={e => setSettings({...settings, zelleEmail: e.target.value})}
                                            placeholder="e.g. zelle@company.com"
                                            className="w-full bg-brand-surface border border-brand-border text-brand-text rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-brand-text-muted mb-2">Payee Name (Optional)</label>
                                        <input
                                            type="text"
                                            value={settings.zelleName}
                                            onChange={e => setSettings({...settings, zelleName: e.target.value})}
                                            placeholder="e.g. Atlas Logistics Inc."
                                            className="w-full bg-brand-surface border border-brand-border text-brand-text rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Custom Standard Methods */}
                            {customStandard.map((method, index) => (
                                <div key={method.id || index} className="bg-brand-bg/50 border border-brand-border/50 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <div className="flex-1 mr-4">
                                                <input
                                                    type="text"
                                                    value={method.name}
                                                    required
                                                    onChange={e => {
                                                        const updated = [...customStandard];
                                                        updated[index].name = e.target.value;
                                                        setCustomStandard(updated);
                                                    }}
                                                    placeholder="e.g. Apple Pay / Bank Transfer"
                                                    className="bg-transparent border-b border-brand-border text-brand-text font-semibold focus:border-blue-500 focus:outline-none px-1 py-0.5 text-sm w-full"
                                                />
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const updated = [...customStandard];
                                                        updated[index].enabled = !updated[index].enabled;
                                                        setCustomStandard(updated);
                                                    }}
                                                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                                        method.enabled ? 'bg-blue-600' : 'bg-slate-700'
                                                    }`}
                                                >
                                                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                        method.enabled ? 'translate-x-5' : 'translate-x-0'
                                                    }`} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setCustomStandard(customStandard.filter((_, i) => i !== index));
                                                    }}
                                                    className="text-red-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                                                    title="Delete custom standard method"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-brand-text-muted mb-2">Account Detail / Tag / Email</label>
                                            <input
                                                type="text"
                                                required
                                                value={method.value}
                                                onChange={e => {
                                                    const updated = [...customStandard];
                                                    updated[index].value = e.target.value;
                                                    setCustomStandard(updated);
                                                }}
                                                placeholder="e.g. details or phone number"
                                                className="w-full bg-brand-surface border border-brand-border text-brand-text rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-brand-text-muted mb-2">Payee Name (Optional)</label>
                                            <input
                                                type="text"
                                                value={method.payeeName}
                                                onChange={e => {
                                                    const updated = [...customStandard];
                                                    updated[index].payeeName = e.target.value;
                                                    setCustomStandard(updated);
                                                }}
                                                placeholder="e.g. Atlas Logistics Inc."
                                                className="w-full bg-brand-surface border border-brand-border text-brand-text rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div className="md:col-span-2 flex justify-end pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCustomStandard([...customStandard, { id: Math.random().toString(36).substring(7), name: '', value: '', payeeName: '', enabled: true }]);
                                    }}
                                    className="flex items-center gap-1.5 text-xs font-bold text-blue-500 hover:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 px-4 py-2 rounded-xl transition-all"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Add Custom Method
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Footbar */}
                <div className="p-6 bg-brand-surface border-t border-brand-border/50 flex justify-end">
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

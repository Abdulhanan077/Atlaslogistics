'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Copy, Check, Coins, MessageSquare, AlertCircle, Loader2, ArrowLeft, Building2, Wallet, Calendar, ShieldCheck, MapPin, Package, Download, Map, ExternalLink } from 'lucide-react';
import TrackingChat from "@/components/TrackingChat";
import QRCode from 'qrcode';

interface PaymentPageClientProps {
    shipment: {
        id: string;
        trackingNumber: string;
        origin: string;
        destination: string;
        status: string;
        holdFee: number;
        holdBaseCharge: number;
        holdPaid: number;
        diffDays: number;
        totalAccumulatedFee: number;
        totalDue: number;
        remainingBalance: number;
        holdReason: string;
    };
    settings: {
        companyName?: string;
        supportEmail?: string;
        supportPhone?: string;
        usdtTrc20Address?: string;
        usdtTrc20Enabled?: boolean;
        usdtBep20Address?: string;
        usdtBep20Enabled?: boolean;
        btcAddress?: string;
        btcEnabled?: boolean;
        logoUrl?: string;
        paypalEmail?: string;
        paypalEnabled?: boolean;
        paypalName?: string;
        cashappTag?: string;
        cashappEnabled?: boolean;
        cashappName?: string;
        venmoTag?: string;
        venmoEnabled?: boolean;
        venmoName?: string;
        zelleEmail?: string;
        zelleEnabled?: boolean;
        zelleName?: string;
        customCryptoMethods?: string;
        customStandardMethods?: string;
    } | null;
}

export default function PaymentPageClient({ shipment, settings }: PaymentPageClientProps) {
    // Parse custom methods
    let parsedCustomCrypto: Array<{ id: string; name: string; address: string; enabled: boolean }> = [];
    let parsedCustomStandard: Array<{ id: string; name: string; value: string; payeeName: string; enabled: boolean }> = [];

    if (settings?.customCryptoMethods) {
        try {
            parsedCustomCrypto = JSON.parse(settings.customCryptoMethods);
        } catch (e) {
            console.error(e);
        }
    }
    if (settings?.customStandardMethods) {
        try {
            parsedCustomStandard = JSON.parse(settings.customStandardMethods);
        } catch (e) {
            console.error(e);
        }
    }

    const availableMethods: string[] = [];
    if (settings?.usdtTrc20Address && settings?.usdtTrc20Enabled !== false) availableMethods.push('USDT_TRC20');
    if (settings?.usdtBep20Address && settings?.usdtBep20Enabled !== false) availableMethods.push('USDT_BEP20');
    if (settings?.btcAddress && settings?.btcEnabled !== false) availableMethods.push('BTC');

    // Add custom crypto methods
    parsedCustomCrypto.forEach(m => {
        if (m.enabled && m.name && m.address) {
            availableMethods.push(`CUSTOM_CRYPTO_${m.id}`);
        }
    });

    if (settings?.paypalEnabled && settings?.paypalEmail) availableMethods.push('PAYPAL');
    if (settings?.cashappEnabled && settings?.cashappTag) availableMethods.push('CASHAPP');
    if (settings?.venmoEnabled && settings?.venmoTag) availableMethods.push('VENMO');
    if (settings?.zelleEnabled && settings?.zelleEmail) availableMethods.push('ZELLE');

    // Add custom standard methods
    parsedCustomStandard.forEach(m => {
        if (m.enabled && m.name && m.value) {
            availableMethods.push(`CUSTOM_STANDARD_${m.id}`);
        }
    });

    const [selectedMethod, setSelectedMethod] = useState<string>(availableMethods[0] || 'USDT_TRC20');
    const [copied, setCopied] = useState(false);
    const [copiedName, setCopiedName] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
    
    // Sync selected method if settings load or change
    useEffect(() => {
        if (availableMethods.length > 0 && !availableMethods.includes(selectedMethod)) {
            setSelectedMethod(availableMethods[0]);
        }
    }, [settings]);

    const getSelectedMethodLabel = () => {
        if (selectedMethod.startsWith('CUSTOM_CRYPTO_')) {
            const id = selectedMethod.replace('CUSTOM_CRYPTO_', '');
            return parsedCustomCrypto.find(m => m.id === id)?.name || 'Crypto';
        }
        if (selectedMethod.startsWith('CUSTOM_STANDARD_')) {
            const id = selectedMethod.replace('CUSTOM_STANDARD_', '');
            return parsedCustomStandard.find(m => m.id === id)?.name || 'Payment';
        }
        switch (selectedMethod) {
            case 'USDT_TRC20': return 'USDT (TRC20)';
            case 'USDT_BEP20': return 'USDT (BEP20)';
            case 'BTC': return 'Bitcoin (BTC)';
            case 'PAYPAL': return 'PayPal';
            case 'CASHAPP': return 'CashApp';
            case 'VENMO': return 'Venmo';
            case 'ZELLE': return 'Zelle';
            default: return selectedMethod.replace('_', ' ');
        }
    };

    // Live price conversion states
    const [btcPrice, setBtcPrice] = useState<number | null>(null);
    const [loadingPrice, setLoadingPrice] = useState(false);

    // Fetch Bitcoin price dynamically when BTC tab is chosen
    useEffect(() => {
        if (selectedMethod === 'BTC' && !btcPrice) {
            setLoadingPrice(true);
            fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')
                .then(res => res.json())
                .then(data => {
                    if (data?.bitcoin?.usd) {
                        setBtcPrice(data.bitcoin.usd);
                    }
                })
                .catch(err => console.error('Failed to fetch BTC price', err))
                .finally(() => setLoadingPrice(false));
        }
    }, [selectedMethod, btcPrice]);

    // Handle copying address with clipboard API and fallback for non-secure HTTP contexts
    const handleCopy = (text: string) => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text)
                .then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                })
                .catch(err => {
                    console.error('Failed to copy text using clipboard API', err);
                    fallbackCopy(text);
                });
        } else {
            fallbackCopy(text);
        }
    };

    const fallbackCopy = (text: string) => {
        try {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.top = '0';
            textArea.style.left = '0';
            textArea.style.position = 'fixed';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            if (successful) {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } else {
                console.error('Fallback copy failed');
            }
        } catch (err) {
            console.error('Fallback copy failed with exception', err);
        }
    };

    const handleCopyName = (text: string) => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text)
                .then(() => {
                    setCopiedName(true);
                    setTimeout(() => setCopiedName(false), 2000);
                })
                .catch(err => {
                    console.error('Failed to copy text', err);
                    fallbackCopyName(text);
                });
        } else {
            fallbackCopyName(text);
        }
    };

    const fallbackCopyName = (text: string) => {
        try {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.top = '0';
            textArea.style.left = '0';
            textArea.style.position = 'fixed';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            if (successful) {
                setCopiedName(true);
                setTimeout(() => setCopiedName(false), 2000);
            }
        } catch (err) {}
    };

    // Retrieve active address based on choice
    const getActiveAddress = () => {
        if (!settings) return '';
        if (selectedMethod.startsWith('CUSTOM_CRYPTO_')) {
            const id = selectedMethod.replace('CUSTOM_CRYPTO_', '');
            const method = parsedCustomCrypto.find(m => m.id === id);
            return method ? method.address : '';
        }
        if (selectedMethod.startsWith('CUSTOM_STANDARD_')) {
            const id = selectedMethod.replace('CUSTOM_STANDARD_', '');
            const method = parsedCustomStandard.find(m => m.id === id);
            return method ? method.value : '';
        }
        switch (selectedMethod) {
            case 'USDT_TRC20': return settings.usdtTrc20Address || '';
            case 'USDT_BEP20': return settings.usdtBep20Address || '';
            case 'BTC': return settings.btcAddress || '';
            case 'PAYPAL': return settings.paypalEmail || '';
            case 'CASHAPP': {
                const tag = settings.cashappTag || '';
                return tag.startsWith('$') ? tag : `$${tag}`;
            }
            case 'VENMO': {
                const tag = settings.venmoTag || '';
                return tag.startsWith('@') ? tag : `@${tag}`;
            }
            case 'ZELLE': return settings.zelleEmail || '';
            default: return '';
        }
    };

    const getActivePayeeName = () => {
        if (!settings) return '';
        if (selectedMethod.startsWith('CUSTOM_STANDARD_')) {
            const id = selectedMethod.replace('CUSTOM_STANDARD_', '');
            const method = parsedCustomStandard.find(m => m.id === id);
            return method ? method.payeeName : '';
        }
        switch (selectedMethod) {
            case 'PAYPAL': return settings.paypalName || '';
            case 'CASHAPP': return settings.cashappName || '';
            case 'VENMO': return settings.venmoName || '';
            case 'ZELLE': return settings.zelleName || '';
            default: return '';
        }
    };

    const activeAddress = getActiveAddress();
    const activePayeeName = getActivePayeeName();
    const hasAnyPaymentMethod = availableMethods.length > 0;

    // Dynamic BTC calculation
    const btcAmount = btcPrice ? (shipment.remainingBalance / btcPrice).toFixed(6) : null;

    // QR Code data formatter
    const getQRData = () => {
        if (!activeAddress) return '';
        if (selectedMethod === 'BTC') {
            // Return raw address for maximum compatibility with ATMs and wallets
            return activeAddress.trim();
        }
        if (selectedMethod === 'CASHAPP') {
            const rawTag = settings?.cashappTag?.replace('$', '') || '';
            return `https://cash.app/$${rawTag}`;
        }
        if (selectedMethod === 'VENMO') {
            const rawTag = settings?.venmoTag?.replace('@', '') || '';
            return `https://venmo.com/${rawTag}`;
        }
        if (selectedMethod === 'PAYPAL') {
            return `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${encodeURIComponent(activeAddress)}&amount=${shipment.remainingBalance}&currency_code=USD`;
        }
        // Return raw address/text for all other methods (USDT, Zelle, Custom methods)
        return activeAddress.trim();
    };

    const qrData = getQRData();

    // Generate local QR code URL
    useEffect(() => {
        if (qrData) {
            QRCode.toDataURL(qrData, { width: 300, margin: 2 })
                .then(url => setQrCodeUrl(url))
                .catch(err => console.error('Failed to generate local QR code', err));
        } else {
            setQrCodeUrl('');
        }
    }, [qrData]);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-600 relative overflow-x-hidden selection:bg-blue-500/30 font-sans">
            {/* Ambient background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[150px] mix-blend-multiply animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[150px] mix-blend-multiply animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            {/* Navigation Header */}
            <nav className="relative z-20 w-full border-b border-slate-200 bg-white/85 backdrop-blur-xl shadow-sm">
                <div className="max-w-[1400px] mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
                    <Link href={`/track/${shipment.trackingNumber}`} className="group flex items-center text-slate-500 hover:text-blue-600 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mr-3 group-hover:bg-slate-100 transition-colors border border-slate-200">
                            <ArrowLeft className="w-5 h-5" />
                        </div>
                        <span className="font-medium tracking-wide">Back to Tracking Page</span>
                    </Link>
                    <div className="flex items-center gap-3 text-right">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <div className="hidden sm:block">
                            <p className="text-slate-900 font-bold text-sm tracking-wide">{settings?.companyName || 'Atlas Logistics'}</p>
                            <p className="text-slate-500 text-xs">Official Payment Portal</p>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 max-w-[1400px] mx-auto px-4 lg:px-8 py-8 lg:py-12 space-y-8">
                {/* Banner */}
                <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="absolute right-0 top-0 -translate-y-12 translate-x-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="space-y-2">
                        <span className="inline-block px-3 py-1 bg-white/20 rounded-full font-bold text-xs uppercase tracking-wider">
                            Action Required
                        </span>
                        <h1 className="text-3xl font-black tracking-tight">Shipment Fee Settlement</h1>
                        <p className="opacity-90 text-sm max-w-xl">
                            Shipment is currently locked on hold due to storage parameters. Make payment below to release.
                        </p>
                    </div>
                    <div className="bg-white/15 backdrop-blur-md border border-white/20 px-6 py-4 rounded-2xl shrink-0">
                        <p className="text-xs uppercase opacity-75 font-bold tracking-widest">Tracking Number</p>
                        <p className="font-mono font-bold text-xl mt-1 tracking-wider">{shipment.trackingNumber}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Details & Ledger */}
                    <div className="lg:col-span-5 space-y-8">
                        {/* Shipment Info Card */}
                        <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm space-y-6">
                            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                                <Package className="w-5 h-5 text-blue-500" />
                                Shipment Overview
                            </h2>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Origin</p>
                                    <p className="font-bold text-slate-805 mt-1">{shipment.origin}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Destination</p>
                                    <p className="font-bold text-slate-850 mt-1">{shipment.destination}</p>
                                </div>
                            </div>
                            
                            {shipment.holdReason && (
                                <div className="border border-dashed border-orange-200 bg-orange-50/50 rounded-2xl p-4 text-xs text-orange-850">
                                    <span className="font-bold block mb-1">Reason for Hold:</span>
                                    {shipment.holdReason}
                                </div>
                            )}
                        </div>

                        {/* Hold Ledger Summary */}
                        <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
                            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2 mb-6">
                                <Coins className="w-5 h-5 text-amber-500" />
                                Hold Payment Ledger
                            </h2>
                            <div className="space-y-4 text-sm text-slate-600">
                                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                    <span>Base Hold Charge:</span>
                                    <span className="font-bold text-slate-900">${shipment.holdBaseCharge.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                    <span>Daily Storage Rate:</span>
                                    <span className="font-bold text-slate-900">${shipment.holdFee.toFixed(2)} / day</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                    <span>Days Elapsed:</span>
                                    <span className="font-bold text-slate-900">{shipment.diffDays} days</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                    <span>Storage Accrued:</span>
                                    <span className="font-bold text-slate-900">+${shipment.totalAccumulatedFee.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-100 font-bold text-slate-900">
                                    <span>Total Amount Due:</span>
                                    <span>${shipment.totalDue.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-100 text-emerald-700 font-bold">
                                    <span>Amount Paid:</span>
                                    <span>-${shipment.holdPaid.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center pt-4 font-black text-lg text-slate-900 border-t-2 border-dashed border-slate-100">
                                    <span className="text-orange-600">Remaining Balance:</span>
                                    <span className="text-orange-600 text-2xl">${shipment.remainingBalance.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Bitcoin ATM Locator & Guide */}
                        <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm space-y-6">
                            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                                <Map className="w-5 h-5 text-indigo-500" />
                                Bitcoin ATM Locator
                            </h2>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Don't have cryptocurrency or want to pay with cash? You can buy and send Bitcoin directly to our wallet from any physical Bitcoin ATM near you.
                            </p>

                            {/* Direct Locator Links */}
                            <div className="space-y-3">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Find ATMs Near You</p>
                                <div className="grid grid-cols-1 gap-2">
                                    <a
                                        href="https://www.google.com/maps/search/?api=1&query=Bitcoin+ATM"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between px-4 py-3 bg-blue-50/50 border border-blue-200 rounded-xl text-xs font-bold text-blue-800 hover:bg-blue-100 hover:border-blue-300 transition-all cursor-pointer shadow-sm"
                                    >
                                        <span className="flex items-center gap-2">
                                            📍 Find Bitcoin ATMs on Google Maps (100% Reliable)
                                        </span>
                                        <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                                    </a>
                                </div>
                            </div>

                            {/* Walkthrough Instructions */}
                            <div className="border-t border-slate-150 pt-4 space-y-3">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">How to Pay at a Bitcoin ATM</p>
                                <ol className="list-decimal pl-4 text-xs text-slate-500 space-y-2.5 leading-relaxed">
                                    <li>Locate a nearby ATM using the Google Maps link above.</li>
                                    <li>Select <strong>"Buy Bitcoin"</strong> or <strong>"Send Crypto"</strong> on the ATM screen.</li>
                                    <li>When prompted for a destination wallet address, <strong>scan our Bitcoin payment QR code</strong> from your phone screen.</li>
                                    <li>Insert cash matching the remaining balance shown.</li>
                                    <li>Take the printed paper receipt, snap a photo, and upload it in the Support Chat below.</li>
                                </ol>
                            </div>
                        </div>
                    </div>

                    {/* Right Payment Form & Setup */}
                    <div className="lg:col-span-7 space-y-8">
                        <div className="bg-white border border-slate-200 rounded-[2rem] p-8 lg:p-10 shadow-md">
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2 mb-6">
                                <Wallet className="w-5 h-5 text-emerald-500" />
                                Payment Instructions
                            </h2>

                            {hasAnyPaymentMethod ? (
                                <div className="space-y-6">
                                    {/* Tabs */}
                                    <div className="flex flex-wrap bg-slate-100 p-1.5 rounded-xl border border-slate-200/50 gap-1">
                                        {availableMethods.map((method) => {
                                            let label = '';
                                            let colorClass = '';
                                            if (method === 'USDT_TRC20') { label = 'USDT (TRC20)'; colorClass = 'text-emerald-600'; }
                                            else if (method === 'USDT_BEP20') { label = 'USDT (BEP20)'; colorClass = 'text-indigo-600'; }
                                            else if (method === 'BTC') { label = 'Bitcoin (BTC)'; colorClass = 'text-amber-600'; }
                                            else if (method === 'PAYPAL') { label = 'PayPal'; colorClass = 'text-blue-600'; }
                                            else if (method === 'CASHAPP') { label = 'CashApp'; colorClass = 'text-emerald-500'; }
                                            else if (method === 'VENMO') { label = 'Venmo'; colorClass = 'text-sky-500'; }
                                            else if (method === 'ZELLE') { label = 'Zelle'; colorClass = 'text-purple-600'; }
                                            else if (method.startsWith('CUSTOM_CRYPTO_')) {
                                                const id = method.replace('CUSTOM_CRYPTO_', '');
                                                const m = parsedCustomCrypto.find(x => x.id === id);
                                                label = m?.name || 'Crypto';
                                                colorClass = 'text-teal-600';
                                            } else if (method.startsWith('CUSTOM_STANDARD_')) {
                                                const id = method.replace('CUSTOM_STANDARD_', '');
                                                const m = parsedCustomStandard.find(x => x.id === id);
                                                label = m?.name || 'Payment';
                                                colorClass = 'text-rose-600';
                                            }

                                            return (
                                                <button
                                                    key={method}
                                                    type="button"
                                                    onClick={() => { setSelectedMethod(method); setCopied(false); }}
                                                    className={`flex-1 min-w-[100px] py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                                        selectedMethod === method
                                                            ? `bg-white ${colorClass} shadow-sm`
                                                            : 'text-slate-500 hover:text-slate-800'
                                                    }`}
                                                >
                                                    {label}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {activeAddress ? (
                                        <div className="flex flex-col items-center justify-center py-4 space-y-6">
                                            {/* QR Code */}
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-52 h-52 bg-white border border-slate-200 p-4 rounded-3xl shadow-sm flex items-center justify-center relative group">
                                                    <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity pointer-events-none" />
                                                    {qrCodeUrl ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img 
                                                            src={qrCodeUrl}
                                                            alt={`${getSelectedMethodLabel()} QR Payment`}
                                                            className="w-full h-full object-contain relative z-10"
                                                        />
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-2 text-slate-400 text-xs">
                                                            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                                                            Generating QR Code...
                                                        </div>
                                                    )}
                                                </div>
                                                {qrCodeUrl && (
                                                    <a
                                                        href={qrCodeUrl}
                                                        download={`payment-qr-${getSelectedMethodLabel().toLowerCase().replace(/\s+/g, '-')}.png`}
                                                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all shadow-sm shrink-0 cursor-pointer"
                                                    >
                                                        <Download className="w-3.5 h-3.5" />
                                                        Download QR Code
                                                    </a>
                                                )}
                                            </div>

                                            {/* Conversion Info */}
                                            <div className="text-center space-y-1">
                                                {selectedMethod === 'BTC' ? (
                                                    loadingPrice ? (
                                                        <div className="flex items-center justify-center gap-1.5 text-sm text-slate-500">
                                                            <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                                                            Fetching current BTC rates...
                                                        </div>
                                                    ) : btcAmount ? (
                                                        <>
                                                            <p className="text-2xl font-black text-slate-900 tracking-tight">
                                                                ~ {btcAmount} BTC
                                                            </p>
                                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                                                                Rate: 1 BTC = ${btcPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                                                            </p>
                                                        </>
                                                    ) : (
                                                        <p className="text-sm text-slate-500 font-medium">
                                                            Send equivalent value in Bitcoin
                                                        </p>
                                                    )
                                                ) : ['USDT_TRC20', 'USDT_BEP20'].includes(selectedMethod) || selectedMethod.startsWith('CUSTOM_CRYPTO_') ? (
                                                    <>
                                                        <p className="text-2xl font-black text-slate-900 tracking-tight">
                                                            ~ {shipment.remainingBalance.toFixed(2)} {getSelectedMethodLabel()}
                                                        </p>
                                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                                                            Rate: 1 {getSelectedMethodLabel()} = $1.00 USD
                                                        </p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <p className="text-2xl font-black text-slate-900 tracking-tight">
                                                            ${shipment.remainingBalance.toFixed(2)} USD
                                                        </p>
                                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                                                            Rate: 1.00 USD = $1.00 USD
                                                        </p>
                                                    </>
                                                )}
                                            </div>

                                            {/* Payee Name Copy Bar */}
                                            {activePayeeName && (
                                                <div className="w-full space-y-2">
                                                    <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                                                        <span>Account Holder / Payee Name</span>
                                                    </div>
                                                    <div className="flex gap-2 w-full">
                                                        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-mono text-sm text-slate-800 select-all overflow-x-auto whitespace-nowrap hide-scrollbar flex items-center justify-start">
                                                            {activePayeeName}
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleCopyName(activePayeeName)}
                                                            className="shrink-0 flex items-center justify-center px-5 rounded-2xl border border-slate-200 hover:border-blue-500/50 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-blue-600 transition-all cursor-pointer"
                                                            title="Copy payee name to clipboard"
                                                        >
                                                            {copiedName ? (
                                                                <Check className="w-5 h-5 text-emerald-500" />
                                                            ) : (
                                                                <Copy className="w-5 h-5" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Wallet Address Copy Bar */}
                                            <div className="w-full space-y-2">
                                                <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                                                    <span>
                                                        {selectedMethod === 'PAYPAL' ? 'PayPal Email Address' :
                                                         selectedMethod === 'CASHAPP' ? 'CashApp Tag' :
                                                         selectedMethod === 'VENMO' ? 'Venmo Username' :
                                                         selectedMethod === 'ZELLE' ? 'Zelle Email / Phone' :
                                                         selectedMethod.startsWith('CUSTOM_STANDARD_') ? `${getSelectedMethodLabel()} Details` :
                                                         'Wallet Destination Address'}
                                                    </span>
                                                    <span className="text-[10px] text-amber-600 font-mono font-bold uppercase">{getSelectedMethodLabel()}</span>
                                                </div>
                                                <div className="flex gap-2 w-full">
                                                    <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-mono text-sm text-slate-800 select-all overflow-x-auto whitespace-nowrap hide-scrollbar flex items-center justify-start">
                                                        {activeAddress}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopy(activeAddress)}
                                                        className="shrink-0 flex items-center justify-center px-5 rounded-2xl border border-slate-200 hover:border-blue-500/50 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-blue-600 transition-all cursor-pointer"
                                                        title="Copy address to clipboard"
                                                    >
                                                        {copied ? (
                                                            <Check className="w-5 h-5 text-emerald-500" />
                                                        ) : (
                                                            <Copy className="w-5 h-5" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-12 border border-slate-200 bg-slate-50 rounded-[2rem] text-center text-slate-500 text-sm">
                                            No payment details configured for {getSelectedMethodLabel()}. Please contact support to arrange transaction details.
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="p-12 border border-dashed border-amber-500/30 bg-amber-500/5 rounded-[2rem] flex flex-col items-center text-center space-y-4">
                                    <AlertCircle className="w-10 h-10 text-amber-500" />
                                    <p className="text-slate-900 font-black text-lg">Platform Payment Gateway Offline</p>
                                    <p className="text-slate-500 text-sm max-w-md leading-relaxed">
                                        The logistics team has not set up their payment gateway details yet. You can obtain payment details by requesting support in the chat widget below.
                                    </p>
                                </div>
                            )}

                            {/* Info Callout */}
                            <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-5 flex gap-4 text-xs leading-relaxed text-blue-700 mt-6">
                                <AlertCircle className="w-5 h-5 shrink-0 text-blue-500 mt-0.5" />
                                <div className="space-y-1">
                                    <span className="font-bold block">Verification Ledger Guidelines:</span>
                                    {['USDT_TRC20', 'USDT_BEP20', 'BTC'].includes(selectedMethod) || selectedMethod.startsWith('CUSTOM_CRYPTO_') ? (
                                        <p>
                                            Once your transaction completes on the blockchain network, please take a screenshot of your transfer status or copy the Transaction Hash (TxID) and submit it into the Live Support Chat located at the bottom of the screen. Our logistics auditing team will confirm validation and release your package on hold.
                                        </p>
                                    ) : (
                                        <p>
                                            Once you have completed the transfer, please take a screenshot of your payment receipt showing the details and transaction ID, and submit it into the Live Support Chat located at the bottom of the screen. Our logistics auditing team will confirm validation and release your package on hold.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Injected Support Chat widget directly on the payment page */}
            <TrackingChat shipmentId={shipment.id} />
        </div>
    );
}

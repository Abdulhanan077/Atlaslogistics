'use client';

import { useState } from 'react';
import { X, Save, RotateCcw, Download, Check, FileText, Sparkles, Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { parseShipmentInfo } from '@/lib/utils';
import { getWaybillDetails, WaybillDetails } from '@/lib/waybill';

interface WaybillEditModalProps {
    shipment: any;
    onClose: () => void;
    onSaveSuccess?: () => void;
}

export default function WaybillEditModal({ shipment, onClose, onSaveSuccess }: WaybillEditModalProps) {
    const initialWb = getWaybillDetails(shipment);
    const [formData, setFormData] = useState<WaybillDetails>({ ...initialWb });
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');

    const handleChange = (field: keyof WaybillDetails, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleResetToDemo = () => {
        setFormData({
            awbPrefix: '114',
            departureCode: 'LHR',
            awbNumber: shipment?.trackingNumber || '90481204',
            airportOfDeparture: 'LHR (London)',
            airportOfDestination: 'ATL (Atlanta)',
            pkgs: '3',
            weight: '37.32 KG',
            hsCode: 'HS 7108.12',
            commodity: 'Gold Bars',
            declaredCustomsValue: 'USD 1,275,320.00',
            freightCharge: 'PREPAID',
            specialHandling: 'VAL Cargo Protocol. Armored Transport.\nOfficial Recipient Photo ID Verification Required.',
            carrierDigitalStamp: '[IATA Validated]',
            waybillDate: '14 OCT 2009',
            shipperName: 'Atlas Logistics UK Ltd',
            shipperAddress: 'International House, Garretts Green\nBirmingham, B33 0UE, UK',
            shipperEmail: 'info@atlaslogistics.co.uk',
            consigneeName: 'Christine Moore',
            consigneeAddress: '3260 Spreading Oak Dr\nDouglasville, GA 30135, USA',
            consigneeEmail: 'christine.moore@gmail.com',
            companyEmail: 'support@atlaslogistics.site',
        });
        toast.success('Reset form to official Air Waybill demo template!');
    };

    const handleResetToOriginal = () => {
        setFormData({ ...initialWb });
        toast.success('Restored form back to original shipment details!');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const currentSender = parseShipmentInfo(shipment.senderInfo);
            const updatedSenderInfo = JSON.stringify({
                ...currentSender,
                waybillDetails: formData,
            });

            const res = await fetch(`/api/shipments/${shipment.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    senderInfo: updatedSenderInfo,
                }),
            });

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(errText || 'Failed to update waybill');
            }

            toast.success('Air Waybill configuration saved successfully!');
            if (onSaveSuccess) onSaveSuccess();
            onClose();
        } catch (err: any) {
            console.error('Error saving waybill:', err);
            toast.error(err.message || 'Failed to save waybill settings');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
            <div className="relative w-full max-w-4xl bg-brand-card dark:bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden my-8">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Air Waybill (AWB) Specification</h2>
                            <p className="text-xs text-slate-400">
                                Configure customs & consignment fields for shipment #{shipment?.trackingNumber}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleResetToDemo}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-medium rounded-lg transition-all border border-amber-500/30"
                            title="Fill sample demo values"
                        >
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            Load Demo Defaults
                        </button>
                        <button
                            type="button"
                            onClick={handleResetToOriginal}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-all border border-slate-700"
                            title="Revert form back to original shipment details"
                        >
                            <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
                            Restore Original
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* View Mode Tabs */}
                <div className="flex border-b border-slate-800 bg-slate-950/60 px-6 pt-2">
                    <button
                        type="button"
                        onClick={() => setActiveTab('form')}
                        className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 ${
                            activeTab === 'form'
                                ? 'border-blue-500 text-blue-400 bg-slate-900'
                                : 'border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        Form Fields
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('preview')}
                        className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 ${
                            activeTab === 'preview'
                                ? 'border-blue-500 text-blue-400 bg-slate-900'
                                : 'border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        Live Visual Box Preview
                    </button>
                </div>

                {/* Body Content */}
                <form onSubmit={handleSubmit}>
                    <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
                        {activeTab === 'form' ? (
                            <>
                                {/* Section 1: AWB Identification & Dates */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 border-b border-slate-800 pb-2">
                                        1. AWB Identifier, Carrier & Dates
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-300 mb-1">
                                                AWB Airline Prefix
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.awbPrefix || ''}
                                                onChange={e => handleChange('awbPrefix', e.target.value)}
                                                placeholder="114"
                                                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-300 mb-1">
                                                Departure Code
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.departureCode || ''}
                                                onChange={e => handleChange('departureCode', e.target.value)}
                                                placeholder="LHR"
                                                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-300 mb-1">
                                                AWB Serial Number
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.awbNumber || ''}
                                                onChange={e => handleChange('awbNumber', e.target.value)}
                                                placeholder="90481204"
                                                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-300 mb-1">
                                                Waybill Date
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.waybillDate || ''}
                                                onChange={e => handleChange('waybillDate', e.target.value)}
                                                placeholder="14 OCT 2009"
                                                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-300 mb-1">
                                                Carrier Digital Stamp Status
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.carrierDigitalStamp || ''}
                                                onChange={e => handleChange('carrierDigitalStamp', e.target.value)}
                                                placeholder="[IATA Validated]"
                                                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-300 mb-1">
                                                Company / Carrier Email
                                            </label>
                                            <input
                                                type="email"
                                                value={formData.companyEmail || ''}
                                                onChange={e => handleChange('companyEmail', e.target.value)}
                                                placeholder="support@atlaslogistics.site"
                                                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Shipper & Consignee Parties */}
                                <div className="space-y-4 pt-2">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 border-b border-slate-800 pb-2">
                                        2. Parties & Email Addresses
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Shipper */}
                                        <div className="space-y-3 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                                            <h4 className="text-xs font-bold text-slate-200">Shipper Details</h4>
                                            <div>
                                                <label className="block text-[11px] text-slate-400 mb-1">Shipper Name</label>
                                                <input
                                                    type="text"
                                                    value={formData.shipperName || ''}
                                                    onChange={e => handleChange('shipperName', e.target.value)}
                                                    placeholder="Atlas Logistics UK Ltd"
                                                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] text-slate-400 mb-1">Shipper Full Address</label>
                                                <textarea
                                                    rows={3}
                                                    value={formData.shipperAddress || ''}
                                                    onChange={e => handleChange('shipperAddress', e.target.value)}
                                                    placeholder="International House, Garretts Green&#10;Birmingham, B33 0UE, UK"
                                                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-blue-500 font-mono"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] text-slate-400 mb-1">Shipper Email Address</label>
                                                <input
                                                    type="email"
                                                    value={formData.shipperEmail || ''}
                                                    onChange={e => handleChange('shipperEmail', e.target.value)}
                                                    placeholder="info@atlaslogistics.co.uk"
                                                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-blue-500"
                                                />
                                            </div>
                                        </div>

                                        {/* Consignee */}
                                        <div className="space-y-3 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                                            <h4 className="text-xs font-bold text-slate-200">Consignee Details</h4>
                                            <div>
                                                <label className="block text-[11px] text-slate-400 mb-1">Consignee Name</label>
                                                <input
                                                    type="text"
                                                    value={formData.consigneeName || ''}
                                                    onChange={e => handleChange('consigneeName', e.target.value)}
                                                    placeholder="Christine Moore"
                                                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] text-slate-400 mb-1">Consignee Full Address</label>
                                                <textarea
                                                    rows={3}
                                                    value={formData.consigneeAddress || ''}
                                                    onChange={e => handleChange('consigneeAddress', e.target.value)}
                                                    placeholder="3260 Spreading Oak Dr&#10;Douglasville, GA 30135, USA"
                                                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-blue-500 font-mono"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] text-slate-400 mb-1">Consignee Email Address</label>
                                                <input
                                                    type="email"
                                                    value={formData.consigneeEmail || ''}
                                                    onChange={e => handleChange('consigneeEmail', e.target.value)}
                                                    placeholder="christine.moore@gmail.com"
                                                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-blue-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 3: Airports & Route */}
                                <div className="space-y-4 pt-2">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 border-b border-slate-800 pb-2">
                                        3. Airports & Route
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-300 mb-1">
                                                Airport of Departure
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.airportOfDeparture || ''}
                                                onChange={e => handleChange('airportOfDeparture', e.target.value)}
                                                placeholder="LHR (London)"
                                                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-300 mb-1">
                                                Destination Airport
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.airportOfDestination || ''}
                                                onChange={e => handleChange('airportOfDestination', e.target.value)}
                                                placeholder="ATL (Atlanta)"
                                                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Section 4: Cargo & Customs Table Fields */}
                                <div className="space-y-4 pt-2">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 border-b border-slate-800 pb-2">
                                        4. Cargo & Customs Specifications
                                    </h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                        <div>
                                            <label className="block text-[11px] text-slate-300 mb-1">PKGS</label>
                                            <input
                                                type="text"
                                                value={formData.pkgs || ''}
                                                onChange={e => handleChange('pkgs', e.target.value)}
                                                placeholder="3"
                                                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs text-center focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] text-slate-300 mb-1">Weight</label>
                                            <input
                                                type="text"
                                                value={formData.weight || ''}
                                                onChange={e => handleChange('weight', e.target.value)}
                                                placeholder="37.32 KG"
                                                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs text-center focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] text-slate-300 mb-1">HS Code</label>
                                            <input
                                                type="text"
                                                value={formData.hsCode || ''}
                                                onChange={e => handleChange('hsCode', e.target.value)}
                                                placeholder="HS 7108.12"
                                                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs text-center focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] text-slate-300 mb-1">Declared Customs Value</label>
                                            <input
                                                type="text"
                                                value={formData.declaredCustomsValue || ''}
                                                onChange={e => handleChange('declaredCustomsValue', e.target.value)}
                                                placeholder="USD 1,275,320.00"
                                                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs text-center focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] text-slate-300 mb-1">Freight Charge</label>
                                            <select
                                                value={formData.freightCharge || 'PREPAID'}
                                                onChange={e => handleChange('freightCharge', e.target.value)}
                                                className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs text-center focus:outline-none focus:border-blue-500"
                                            >
                                                <option value="PREPAID">PREPAID</option>
                                                <option value="COLLECT">COLLECT</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-300 mb-1">
                                            Commodity Description
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.commodity || ''}
                                            onChange={e => handleChange('commodity', e.target.value)}
                                            placeholder="Gold Bars"
                                            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                {/* Section 5: Special Handling */}
                                <div className="space-y-4 pt-2">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 border-b border-slate-800 pb-2">
                                        5. Special Handling Instructions
                                    </h3>
                                    <div>
                                        <textarea
                                            rows={3}
                                            value={formData.specialHandling || ''}
                                            onChange={e => handleChange('specialHandling', e.target.value)}
                                            placeholder="VAL Cargo Protocol. Armored Transport. Official Recipient Photo ID Verification Required."
                                            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500 font-mono"
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            /* Live Box Frame Preview Mode */
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400">
                                        Exact Air Waybill (AWB) Box Render
                                    </h3>
                                    <a
                                        href={`/api/shipments/${shipment.id}/label`}
                                        download={`WAYBILL-${formData.awbNumber || shipment.trackingNumber}.pdf`}
                                        className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        Download Generated PDF
                                    </a>
                                </div>

                                <div className="bg-white text-slate-900 font-mono text-xs p-4 rounded-xl border border-slate-300 shadow-xl overflow-x-auto">
                                    {/* AWB Outer Box */}
                                    <div className="border-2 border-slate-900 rounded">
                                        {/* Header Row */}
                                        <div className="flex justify-between items-center px-3 py-2 border-b-2 border-slate-900 bg-slate-100 font-bold">
                                            <span>{formData.awbPrefix} - {formData.departureCode} - {formData.awbNumber}</span>
                                            <span className="tracking-wider">INTERNATIONAL AIR WAYBILL (AWB)</span>
                                        </div>

                                        {/* Shipper & Consignee Grid */}
                                        <div className="grid grid-cols-2 border-b-2 border-slate-900">
                                            <div className="p-3 border-r-2 border-slate-900">
                                                <div className="text-[10px] font-bold text-slate-600 uppercase mb-1">SHIPPER'S NAME & ADDRESS:</div>
                                                <div className="font-bold">{formData.shipperName}</div>
                                                <div className="whitespace-pre-line text-[11px] leading-relaxed text-slate-800">
                                                    {formData.shipperAddress}
                                                </div>
                                                {formData.shipperEmail && (
                                                    <div className="text-[10px] font-bold text-blue-800 mt-1">
                                                        Email: {formData.shipperEmail}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-3">
                                                <div className="text-[10px] font-bold text-slate-600 uppercase mb-1">CONSIGNEE'S NAME & ADDRESS:</div>
                                                <div className="font-bold">{formData.consigneeName}</div>
                                                <div className="whitespace-pre-line text-[11px] leading-relaxed text-slate-800">
                                                    {formData.consigneeAddress}
                                                </div>
                                                {formData.consigneeEmail && (
                                                    <div className="text-[10px] font-bold text-blue-800 mt-1">
                                                        Email: {formData.consigneeEmail}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Route Bar */}
                                        <div className="flex justify-between items-center px-3 py-2 border-b-2 border-slate-900 bg-slate-50 text-[11px]">
                                            <div><span className="font-bold">AIRPORT OF DEPARTURE:</span> {formData.airportOfDeparture}</div>
                                            <div><span className="font-bold">DESTINATION:</span> {formData.airportOfDestination}</div>
                                        </div>

                                        {/* Cargo Table Header */}
                                        <div className="grid grid-cols-12 border-b border-slate-900 bg-slate-200 text-[10px] font-bold text-center">
                                            <div className="col-span-1 p-1.5 border-r border-slate-900">PKGS</div>
                                            <div className="col-span-2 p-1.5 border-r border-slate-900">WEIGHT</div>
                                            <div className="col-span-4 p-1.5 border-r border-slate-900 text-left">COMMODITY/HS</div>
                                            <div className="col-span-3 p-1.5 border-r border-slate-900">DECLARED CUSTOMS VALUE</div>
                                            <div className="col-span-2 p-1.5">FREIGHT CHARGE</div>
                                        </div>

                                        {/* Cargo Table Data */}
                                        <div className="grid grid-cols-12 border-b-2 border-slate-900 text-[11px] text-center min-h-[48px] items-center">
                                            <div className="col-span-1 p-2 border-r border-slate-900 font-bold">{formData.pkgs}</div>
                                            <div className="col-span-2 p-2 border-r border-slate-900 font-bold">{formData.weight}</div>
                                            <div className="col-span-4 p-2 border-r border-slate-900 text-left">
                                                <div className="font-bold">{formData.hsCode}</div>
                                                <div className="text-[10px] text-slate-600">({formData.commodity})</div>
                                            </div>
                                            <div className="col-span-3 p-2 border-r border-slate-900 font-bold">{formData.declaredCustomsValue}</div>
                                            <div className="col-span-2 p-2 font-bold">{formData.freightCharge}</div>
                                        </div>

                                        {/* Special Handling Row */}
                                        <div className="p-3 border-b-2 border-slate-900 text-[11px]">
                                            <div className="text-[10px] font-bold text-slate-600 uppercase mb-0.5">SPECIAL HANDLING INSTRUCTIONS:</div>
                                            <div className="whitespace-pre-line text-slate-900">{formData.specialHandling}</div>
                                        </div>

                                        {/* Footer Row */}
                                        <div className="flex justify-between items-center px-3 py-2 bg-slate-50 text-[11px]">
                                            <div>
                                                <span className="font-bold">CARRIER DIGITAL STAMP:</span> <span className="text-sky-700 font-bold">{formData.carrierDigitalStamp}</span>
                                                {formData.companyEmail && (
                                                    <span className="text-[10px] text-slate-600 ml-2">({formData.companyEmail})</span>
                                                )}
                                            </div>
                                            <div><span className="font-bold">DATE:</span> {formData.waybillDate}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Modal Footer */}
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/80">
                        <a
                            href={`/api/shipments/${shipment.id}/label`}
                            download={`WAYBILL-${formData.awbNumber || shipment.trackingNumber}.pdf`}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all border border-slate-700"
                        >
                            <Download className="w-4 h-4 text-emerald-400" />
                            Download PDF
                        </a>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50"
                            >
                                {saving ? (
                                    <>Saving...</>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Save Air Waybill
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

'use client';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Shield, ShieldAlert, KeyRound, Server, HardDrive, FileCheck } from 'lucide-react';

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-600 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      {/* Global Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/10 blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[150px]" />
      </div>

      <Navbar />

      <main className="relative z-10 w-full pt-32 pb-24 px-4 lg:px-8 max-w-5xl mx-auto">
        {/* HERO */}
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-6">
            <Shield className="w-4 h-4 text-blue-500" />
            <span className="text-[10px] font-black tracking-[0.2em] text-blue-600 uppercase">Trust Center</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tighter leading-none">
            Platform Security & Compliance
          </h1>
          <p className="text-slate-600 text-lg md:text-xl font-medium leading-relaxed">
            Atlas Logistics is built on cryptographic verification, ensuring an unbroken, immutable chain of custody and rigorous compliance standards.
          </p>
        </div>

        {/* SECURITY PILLARS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-6">
              <KeyRound className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Cryptographic Custody</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Every package handoff is secured using dynamic cryptographic keys. Physical asset transfers are verified at secure hubs, leaving a tamper-proof digital record that eliminates manifest spoofing.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6">
              <Server className="w-6 h-6 text-indigo-500" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Multi-Tenant Isolation</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Customer data and cargo manifests are logically partitioned inside our database layer using strict Row-Level Security (RLS) policies. Your supply chain intelligence is accessible only to your authorized users.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6">
              <HardDrive className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">E2E Fleet Telemetry</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              In-transit telemetry—including precise GPS positions, temperature fluctuations, and impact logs—is encrypted in transit and at rest, preventing any interception or manipulation of route history.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mb-6">
              <FileCheck className="w-6 h-6 text-amber-500" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Customs Clearance Protection</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              To guarantee national security and tariff integrity, Atlas Logistics coordinates directly with Customs & Border Protection (CBP) as the licensed manifest custodian. All documentation is prepared and verified by certified brokers.
            </p>
          </div>
        </div>

        {/* SECURITY ALERT BANNER */}
        <div className="bg-amber-50 border border-amber-200 rounded-[2.5rem] p-8 md:p-10 shadow-lg flex flex-col md:flex-row gap-6 items-start">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h4 className="text-lg font-black text-slate-900 mb-2">Import / Export Compliance Warning</h4>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Under international transit laws, individual consignees are **strictly prohibited** from direct clearance bypass with port authorities or border control hubs for cargo assigned under Atlas's active manifest bonds.
            </p>
            <p className="text-slate-500 text-xs leading-relaxed">
              All customs inquiries, tax payments, and documentation releases must be mediated by our authorized brokerage agent at `atlaslogistics077@gmail.com` to prevent package confiscation, legal penalties, or terminal holding flags.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

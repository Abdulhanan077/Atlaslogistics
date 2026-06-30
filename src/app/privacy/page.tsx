'use client';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Eye, Shield, Lock, FileText } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-600 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      {/* Global Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/10 blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[150px]" />
      </div>

      <Navbar />

      <main className="relative z-10 w-full pt-32 pb-24 px-4 lg:px-8 max-w-4xl mx-auto">
        {/* HERO */}
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-6">
            <Eye className="w-4 h-4 text-blue-500" />
            <span className="text-[10px] font-black tracking-[0.2em] text-blue-600 uppercase">Compliance</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tighter leading-none">
            Privacy Policy
          </h1>
        </div>

        {/* POLICY CONTENT */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-2xl space-y-8 prose prose-slate max-w-none text-sm md:text-base leading-relaxed">
          <section className="space-y-4">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500 shrink-0" />
              1. Information We Collect
            </h3>
            <p>
              We collect information necessary to coordinate global cargo shipping and provide secure tracking telemetry. This includes:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-xs md:text-sm">
              <li><strong>Consignee & Sender Details:</strong> Names, physical delivery addresses, phone numbers, and email coordinates.</li>
              <li><strong>Cargo Manifest Information:</strong> Item descriptions, tariff valuations, Harmonized System (HS) classifications, and customs bond details.</li>
              <li><strong>Real-time Telemetry:</strong> In-transit GPS coordinates, cargo container temperature/humidity values, and impact log telemetry.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-500 shrink-0" />
              2. How We Use Your Data
            </h3>
            <p>
              Your data is processed to guarantee safe transit compliance. Specifically:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-xs md:text-sm">
              <li>To prepare customs entry summary forms (CBP Form 7501) and coordinate clearance procedures at high-value cargo terminals.</li>
              <li>To provide active telemetry tracking on our dashboard under authorized session parameters.</li>
              <li>To verify transaction records and coordinate secure billing through our compliance operations support team at `atlaslogistics077@gmail.com`.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-500 shrink-0" />
              3. Data Retention & Sharing Controls
            </h3>
            <p>
              Atlas Logistics operates under strict GDPR and CCPA boundaries. We retain shipping records only as long as required by national maritime laws and customs recordkeeping requirements. We do not sell supply chain telemetry to third-party advertisers. Cargo data is disclosed solely to authorized customs agents, port operators, and security compliance regulators to facilitate legal entry.
            </p>
          </section>

          <section className="space-y-4 border-t border-slate-100 pt-6">
            <h3 className="text-lg font-black text-slate-900">4. Contact Compliance</h3>
            <p className="text-xs text-slate-500">
              For any privacy inquiries, data extraction requests, or compliance checks, please contact our privacy compliance desk directly at `atlaslogistics077@gmail.com`.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

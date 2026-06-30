'use client';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Scale, ShieldAlert, FileWarning, HelpCircle } from 'lucide-react';

export default function TermsPage() {
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
            <Scale className="w-4 h-4 text-blue-500" />
            <span className="text-[10px] font-black tracking-[0.2em] text-blue-600 uppercase">Legal</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tighter leading-none">
            Terms of Service
          </h1>
        </div>

        {/* POLICY CONTENT */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-2xl space-y-8 prose prose-slate max-w-none text-sm md:text-base leading-relaxed">
          <section className="space-y-4">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <FileWarning className="w-5 h-5 text-blue-500 shrink-0" />
              1. Customs Brokerage & Legal Custody
            </h3>
            <p>
              Atlas Logistics operates as the sole licensed customs broker and legal custodian responsible for high-value cargo manifests handled under our shipping accounts. All import/export clearance activities are executed under our registered agency bonds in compliance with local port authorities.
            </p>
          </section>

          {/* CUSTOMS SPECIAL NOTICE BOX */}
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 md:p-8 space-y-3">
            <h4 className="text-sm font-black text-amber-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0" />
              IMPORTANT: Customs Bypass & Direct Interaction Restrictions
            </h4>
            <p className="text-slate-700 text-xs leading-relaxed">
              Consignees are strictly prohibited from bypassing our logistics channels to initiate direct contact, payment negotiations, or billing settlements with port authorities or customs officials. 
            </p>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Because Atlas Logistics is the designated legal custodian of the active manifest bond, customs agencies will only coordinate clearance and accept payments through our registered agency. Any attempt by individual consignees to settle fees directly with external port agents violates our terms of service and may result in immediate manifest cancellation or terminal hold penalties.
            </p>
          </div>

          <section className="space-y-4">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-500 shrink-0" />
              2. Fee Settlements, Release Conditions, & Wallet Verification
            </h3>
            <p>
              Cargo held at Destination Customs & Port High-Value Cargo Terminals is subject to the following rules:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-xs md:text-sm">
              <li><strong>Full Remaining Balance Clearance:</strong> Cargo will not be released from terminals under partial payment records. Delivery dispatch requires the full remaining balance of duties, tariffs, and handling fees to be cleared.</li>
              <li><strong>Dynamic Wallet Verification:</strong> Because transaction parameters, network fees, and wallet addresses shift dynamically, consignees must obtain the most up-to-date and secure Bitcoin wallet address directly from our customer support team or via email at `atlaslogistics077@gmail.com` before initiating any transfer. Atlas is not responsible for funds sent to unverified or stale payment addresses.</li>
              <li><strong>Billing Coordination:</strong> Official billing details are coordinated dynamically on the platform. Alternate billing channels are managed solely through our verified compliance support inbox at `atlaslogistics077@gmail.com`.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-black text-slate-900">3. Transit Route & Destination Modifications</h3>
            <p>
              Once a manifest is generated, modifications to the final destination delivery address requested by the sender are subject to strict authorization parameters. A destination address modification will not be executed without the explicit written approval of the designated consignee (receiver). If the consignee denies the request, the cargo remains at its original bound destination.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-black text-slate-900">4. Reputational Integrity, Disputes, & Shipment Freezes</h3>
            <p>
              In the event that a consignee disputes the validity of a shipment, makes unsubstantiated claims of fraud, or initiates unauthorized external audits of the cargo directly with airport or port terminal agents, Atlas Logistics reserves the absolute right to temporarily lock tracking updates, freeze cargo dispatch at the Destination Customs & Port High-Value Cargo Terminal, and require standard identity/documentation verification through official reviews prior to resuming clearance activities.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-black text-slate-900">5. Limitation of Liability & Storage Charges</h3>
            <p>
              Atlas Logistics is not liable for cargo seizures, customs delay fines, or border holds resulting from incorrect shipping declarations provided by the sender. Furthermore, consignees are solely responsible for all port storage fees (demurrage), customs inspection charges, and administrative penalties accumulated during holds caused by compliance investigations or pending balance clearances.
            </p>
          </section>

          <section className="space-y-4 border-t border-slate-100 pt-6">
            <h3 className="text-lg font-black text-slate-900">6. Legal Inquiries</h3>
            <p className="text-xs text-slate-500">
              For legal escalations, corporate registration verifications, or compliance issues, please contact our legal desk at `atlaslogistics077@gmail.com`.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

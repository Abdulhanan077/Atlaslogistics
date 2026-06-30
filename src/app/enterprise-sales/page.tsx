'use client';

import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Star, Building2, TrendingUp, Handshake, Globe2, ShieldCheck, Mail, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function EnterpriseSalesPage() {
  const [form, setForm] = useState({ name: '', email: '', company: '', volume: '100-500', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.company) {
      toast.error('Please fill in your name, email, and company.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setForm({ name: '', email: '', company: '', volume: '100-500', message: '' });
      toast.success('Thank you! Your sales inquiry has been logged. An enterprise account manager will reach out within 1 business hour.');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-600 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      {/* Global Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/10 blur-[150px]" />
      </div>

      <Navbar />

      <main className="relative z-10 w-full pt-32 pb-24 px-4 lg:px-8 max-w-5xl mx-auto">
        {/* HERO */}
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 mb-6">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span className="text-[10px] font-black tracking-[0.2em] text-indigo-600 uppercase">Enterprise Solutions</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tighter leading-none">
            Scale Global Supply Chains
          </h1>
          <p className="text-slate-600 text-lg md:text-xl font-medium leading-relaxed">
            Consolidate customs brokerage, cryptographic package telemetry, and multi-tenant warehouse visibility into a unified dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-16">
          {/* LEFT: ENTERPRISE INFO */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-6">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Built for High Volume Shippers</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Whether you coordinate container fleets, specialized biopharma transit corridors, or regional fulfillment networks, Atlas provides dedicated pipeline management tailored to compliance requirements.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-white border border-slate-200 rounded-[2rem] shadow-sm">
                <ShieldCheck className="w-6 h-6 text-emerald-500 mb-3" />
                <h4 className="text-sm font-black text-slate-900 mb-1">Guaranteed SLA</h4>
                <p className="text-slate-500 text-xs leading-relaxed">Strict timing thresholds for customs verification, document handling, and terminal handoffs.</p>
              </div>

              <div className="p-6 bg-white border border-slate-200 rounded-[2rem] shadow-sm">
                <Globe2 className="w-6 h-6 text-blue-500 mb-3" />
                <h4 className="text-sm font-black text-slate-900 mb-1">Global Brokerage Network</h4>
                <p className="text-slate-500 text-xs leading-relaxed">Dedicated customs coordinators in 150+ ports of entry to ensure cargo clears borders with zero friction.</p>
              </div>

              <div className="p-6 bg-white border border-slate-200 rounded-[2rem] shadow-sm">
                <TrendingUp className="w-6 h-6 text-indigo-500 mb-3" />
                <h4 className="text-sm font-black text-slate-900 mb-1">Optimized Tariffs</h4>
                <p className="text-slate-500 text-xs leading-relaxed">System-assisted HS-coding and bond coordination to minimize import/export compliance overhead.</p>
              </div>

              <div className="p-6 bg-white border border-slate-200 rounded-[2rem] shadow-sm">
                <Handshake className="w-6 h-6 text-purple-500 mb-3" />
                <h4 className="text-sm font-black text-slate-900 mb-1">Dedicated Support</h4>
                <p className="text-slate-500 text-xs leading-relaxed">Direct communication pathways with our compliance agents, bypassing public ticketing queues.</p>
              </div>
            </div>
          </div>

          {/* RIGHT: CONTACT FORM */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-2xl">
              <div className="flex items-center gap-2 mb-6">
                <Mail className="w-5 h-5 text-indigo-600" />
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Contact Sales</h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Your Name</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Company Email</label>
                  <input
                    type="email"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
                    placeholder="johndoe@company.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Company Name</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
                    placeholder="Acme Corporation"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Monthly Shipment Volume</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
                    value={form.volume}
                    onChange={(e) => setForm({ ...form, volume: e.target.value })}
                  >
                    <option value="Under 100">Under 100 shipments</option>
                    <option value="100-500">100 - 500 shipments</option>
                    <option value="500-2500">500 - 2,500 shipments</option>
                    <option value="Over 2500">Over 2,500 shipments</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Specific Requirements</label>
                  <textarea
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-indigo-500 font-medium text-sm"
                    placeholder="Tell us about your logistics needs..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:shadow-lg text-white rounded-xl py-4 font-black text-sm tracking-tight transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-indigo-200" />
                      Sending Inquiry...
                    </>
                  ) : (
                    'Connect with Sales Account Manager'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

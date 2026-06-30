'use client';

import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { HelpCircle, ChevronDown, ChevronUp, Mail, MessageSquare, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface FAQItem {
  q: string;
  a: string;
}

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [form, setForm] = useState({ subject: '', category: 'customs', desc: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const faqs: FAQItem[] = [
    {
      q: 'Why is my shipment held at the Destination Customs & Port High-Value Cargo Terminal?',
      a: 'Cargo manifests carrying high-value electronics, medical equipment, or import commodities are flagged by border protection authorities pending clearance of customs bonds, administrative processing fees, or outstanding import tariffs. You can view the current balance and payment history directly on our tracking dashboard.'
    },
    {
      q: 'Can I pay my clearance duties and fees directly to port or customs officials?',
      a: 'No. Under international transit regulations and our strict operational guidelines, customers are not permitted to bypass our service to interact directly with customs authorities or terminal managers. Atlas Logistics acts as the sole licensed broker and legal custodian for your specific cargo manifest. Consequently, customs authorities will only coordinate clearance and accept payments directly through our registered agency rather than individual consignees.'
    },
    {
      q: 'Do you accept partial payments for the release of cargo?',
      a: 'While partial payments are recorded on your account statement, company regulations state that the full remaining balance must be cleared before the parcel can be officially released from the terminal for final delivery.'
    },
    {
      q: 'Can the destination of the cargo be changed in transit?',
      a: 'Any request by a sender to modify the final destination of a parcel requires the explicit approval of the consignee (receiver). A destination modification cannot be processed on our customs manifest without this formal authorization.'
    },
    {
      q: 'How can I submit documentation or verify my identity?',
      a: 'You can email scans of your commercial invoices, tax IDs, or queries directly to our verified support operations desk at atlaslogistics077@gmail.com, or submit a helpdesk ticket on this page.'
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject || !form.desc || !form.email) {
      toast.error('Please fill in your email, subject, and ticket description.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setForm({ subject: '', category: 'customs', desc: '', email: '' });
      toast.success('Your support ticket has been submitted! An operations agent will follow up via email shortly.');
    }, 1500);
  };

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
            <HelpCircle className="w-4 h-4 text-blue-500" />
            <span className="text-[10px] font-black tracking-[0.2em] text-blue-600 uppercase">Support Hub</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tighter leading-none">
            Customer Support Center
          </h1>
          <p className="text-slate-600 text-lg md:text-xl font-medium leading-relaxed">
            Have questions about customs holds, clearance processes, or payment methods? We are here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-16">
          {/* LEFT: FAQS */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-6">Frequently Asked Questions</h3>
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left font-black text-slate-900 text-sm tracking-tight cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {openFaq === i ? <ChevronUp className="w-5 h-5 text-blue-500 shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 border-t border-slate-100 pt-4 text-slate-600 text-xs leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* RIGHT: TICKET FORM */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-2xl">
              <div className="flex items-center gap-2 mb-6">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Open Support Ticket</h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Your Email</label>
                  <input
                    type="email"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-blue-500 font-medium text-sm"
                    placeholder="johndoe@company.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Topic / Category</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-blue-500 font-medium text-sm"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    <option value="customs">Customs Holds & Release</option>
                    <option value="billing">Tariffs & Payments</option>
                    <option value="telemetry">GPS & Temperature Telemetry</option>
                    <option value="other">General Inquiries</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ticket Subject</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-blue-500 font-medium text-sm"
                    placeholder="Customs release status for TRK-123456"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Describe Your Inquiry</label>
                  <textarea
                    rows={4}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-blue-500 font-medium text-xs leading-relaxed"
                    placeholder="Provide details about your shipment number, tracking ID, or invoice number..."
                    value={form.desc}
                    onChange={(e) => setForm({ ...form, desc: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg text-white rounded-xl py-4 font-black text-sm tracking-tight transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-blue-200" />
                      Creating Ticket...
                    </>
                  ) : (
                    'Submit Support Ticket'
                  )}
                </button>
              </form>

              {/* Direct email helper */}
              <div className="mt-6 border-t border-slate-100 pt-6 text-center">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-2">Direct Compliance Channel</span>
                <a href="mailto:atlaslogistics077@gmail.com" className="inline-flex items-center gap-2 text-blue-600 hover:underline font-black text-sm">
                  <Mail className="w-4 h-4" />
                  atlaslogistics077@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

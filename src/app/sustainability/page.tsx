'use client';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Leaf, Award, Compass, Wind, Zap } from 'lucide-react';

export default function SustainabilityPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-600 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      {/* Global Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-500/10 blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/10 blur-[150px]" />
      </div>

      <Navbar />

      <main className="relative z-10 w-full pt-32 pb-24 px-4 lg:px-8 max-w-5xl mx-auto">
        {/* HERO */}
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 mb-6">
            <Leaf className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-black tracking-[0.2em] text-emerald-600 uppercase">Our Mission</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tighter leading-none">
            Sustainable Shipping Networks
          </h1>
          <p className="text-slate-600 text-lg md:text-xl font-medium leading-relaxed">
            Atlas Logistics is committed to achieving net-zero carbon operations by 2040 through intelligent routing algorithms and eco-conscious transport solutions.
          </p>
        </div>

        {/* STATS STRIP */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-xl mb-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-4xl md:text-5xl font-black text-emerald-600 mb-2 tracking-tighter">-35%</p>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">CO2 Emissions Since 2022</p>
          </div>
          <div className="border-y md:border-y-0 md:border-x border-slate-100 py-6 md:py-0">
            <p className="text-4xl md:text-5xl font-black text-emerald-600 mb-2 tracking-tighter">80%</p>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Electric Last-Mile Fleet</p>
          </div>
          <div>
            <p className="text-4xl md:text-5xl font-black text-emerald-600 mb-2 tracking-tighter">1.2M</p>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tons of Offset Carbon</p>
          </div>
        </div>

        {/* INITIATIVES */}
        <div className="space-y-8 mb-16">
          {[
            {
              title: 'Eco-Intelligent Routing',
              desc: 'Our dynamic logistics engine analyzes real-time traffic grids, weather patterns, and fuel usage profiles to compute paths that prioritize carbon efficiency without sacrificing prompt deliveries.',
              icon: Compass,
              color: 'text-blue-500 bg-blue-50'
            },
            {
              title: 'Alternative Energy Fleet',
              desc: 'We are continually transitioning our last-mile delivery vans to electric drives, while matching regional cargo trucks with bio-LNG configurations to support low-emission transport lanes.',
              icon: Zap,
              color: 'text-amber-500 bg-amber-50'
            },
            {
              title: 'Carbon Offset Matching',
              desc: 'Enterprise customers receive precise monthly environmental reports showing their shipping footprint, which can be dynamically balanced using our pre-cleared renewable energy offset tokens.',
              icon: Wind,
              color: 'text-emerald-500 bg-emerald-50'
            }
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-10 shadow-lg flex flex-col md:flex-row gap-6 items-start hover:shadow-xl transition-all duration-300">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${item.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">{item.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* FOOTPRINT ACCORD */}
        <div className="bg-emerald-950 text-emerald-100 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Award className="w-64 h-64 text-emerald-100 animate-pulse" />
          </div>
          <div className="relative z-10 max-w-2xl">
            <h4 className="text-2xl md:text-3xl font-black text-white mb-4 tracking-tight">Eco-Logistics Certified</h4>
            <p className="text-emerald-200/80 text-sm leading-relaxed mb-6">
              Atlas Logistics is fully certified by the Global Green Freight Initiative. Our environmental audit logs are public, verifiable, and checked against international standards.
            </p>
            <div className="flex gap-4">
              <span className="px-4 py-2 rounded-full bg-emerald-900 border border-emerald-800 text-[10px] font-black uppercase tracking-widest text-white">ISO 14001 Compliant</span>
              <span className="px-4 py-2 rounded-full bg-emerald-900 border border-emerald-800 text-[10px] font-black uppercase tracking-widest text-white">GGFI Certified</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

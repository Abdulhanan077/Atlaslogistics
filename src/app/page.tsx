'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, Package, ArrowRight, ShieldCheck, Globe2, 
  Clock, Truck, Plane, Ship, MapPin, CheckCircle2, 
  Star, Zap, Activity, Box, BarChart3, Shield, Loader2
} from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [trackingId, setTrackingId] = useState('');
  const [companyName, setCompanyName] = useState('Atlas Logistics');
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/settings')
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load settings');
        return res.json();
      })
      .then((data) => {
        if (data?.companyName) setCompanyName(data.companyName);
      })
      .catch((err) => console.error('Failed to load settings', err));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingId.trim()) {
      setIsLoading(true);
      router.push(`/track/${trackingId.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-300 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      {/* Global Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[150px] mix-blend-screen animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/10 blur-[150px] mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:40px_40px]" />
      </div>

      {/* Floating Modern Navbar */}
      <nav className="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-5xl">
        <div className="bg-black/60 backdrop-blur-3xl border border-white/10 rounded-2xl md:rounded-full px-4 md:px-10 h-14 md:h-20 flex items-center justify-center md:justify-between shadow-2xl">
            <Link href="/" className="flex items-center gap-2 md:gap-3 group shrink-0">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                    <Package className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <span className="text-white font-black text-lg md:text-xl tracking-tighter whitespace-nowrap">{companyName}</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-slate-400">
                <a href="#how-it-works" className="hover:text-white transition-colors">Process</a>
                <a href="#infrastructure" className="hover:text-white transition-colors">Network</a>
                <a href="#stats" className="hover:text-white transition-colors">Global</a>
            </div>

            <div className="hidden md:block w-8 md:w-10"></div>
        </div>
      </nav>

      <main className="relative z-10 w-full flex flex-col pt-32">
        
        {/* CINEMATIC HERO SECTION */}
        <section className="relative min-h-[90vh] flex items-center px-4 lg:px-8 max-w-[1400px] mx-auto py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
            
            {/* Left Column: Typography */}
            <div className="lg:col-span-7 space-y-8 text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-md">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] font-black tracking-[0.2em] text-blue-400 uppercase">Live Logistics Network Active</span>
              </div>

              <h1 className="text-5xl md:text-7xl xl:text-8xl font-black text-white tracking-tighter leading-[0.95] drop-shadow-2xl">
                Global Track <br/>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400">
                  Precision.
                </span>
              </h1>
              
              <p className="text-sm md:text-xl text-slate-400 font-medium tracking-wide max-w-xl leading-relaxed">
                Global logistics transparency at your fingertips. High-precision telemetry, secure hub verification, and an immutable chain of custody for every parcel.
              </p>

              {/* Quick Contact / Trust Badge */}
              <div className="flex items-center gap-4 pt-4">
                 <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-[#030712] bg-slate-800 flex items-center justify-center overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?u=${i}`} alt="User" />
                      </div>
                    ))}
                 </div>
                 <div className="text-xs font-bold tracking-wide">
                    <p className="text-white">Join 12k+ Global Partners</p>
                    <p className="text-slate-500">Trusted in 150+ Countries</p>
                 </div>
              </div>
            </div>

            {/* Right Column: Search Card */}
            <div className="lg:col-span-5 relative">
               {/* Background Glow */}
               <div className="absolute -inset-10 bg-blue-600/20 blur-[100px] rounded-full animate-pulse pointer-events-none" />
               
               <div className="relative z-10 bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Globe2 className="w-40 h-40 text-white" />
                  </div>

                  <h3 className="text-2xl font-black text-white mb-8 tracking-tight">Track Your Shipment</h3>
                  
                  <form onSubmit={handleSearch} className="relative z-30 space-y-4">
                    <div className={`relative group transition-all duration-300 ${isFocused ? 'scale-[1.02]' : ''}`}>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/50 to-indigo-600/50 rounded-2xl blur-md opacity-0 group-hover:opacity-40 transition-opacity" />
                      <div className="relative bg-black/40 border border-white/10 rounded-2xl p-4 flex items-center gap-4 transition-colors group-hover:border-white/20">
                        <Search className={`w-6 h-6 transition-colors ${isFocused ? 'text-blue-400' : 'text-slate-500'}`} />
                        <input
                          type="text"
                          placeholder="Tracking ID (e.g. TRK-123456)"
                          className="bg-transparent border-none text-white text-base md:text-lg placeholder-slate-600 focus:ring-0 outline-none font-mono w-full px-0"
                          value={trackingId}
                          onChange={(e) => setTrackingId(e.target.value)}
                          onFocus={() => setIsFocused(true)}
                          onBlur={() => setIsFocused(false)}
                          required
                        />
                      </div>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="relative z-50 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] text-white rounded-2xl py-5 font-black text-lg tracking-tight transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-70 disabled:cursor-wait"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin text-blue-200" />
                          Locating Shipment...
                        </>
                      ) : (
                        <>
                          Track Shipment
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Feature Toggles */}
                  <div className="mt-10 grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center text-center">
                       <ShieldCheck className="w-6 h-6 text-emerald-400 mb-2" />
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secure Hand-off</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center text-center">
                       <ShieldCheck className="w-6 h-6 text-blue-400 mb-2" />
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-time ETA</span>
                    </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Hero Warehouse Image Overlay (Floating) */}
          <div className="absolute bottom-[-5%] md:bottom-[-10%] right-[-10%] md:right-[-5%] w-[80%] md:w-[60%] h-[30%] md:h-[40%] z-[-1] opacity-20 md:opacity-30 pointer-events-none">
             <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2000" alt="Logistics Network" className="w-full h-full object-cover mix-blend-luminosity rounded-l-[50px] md:rounded-l-[100px] border-l border-t border-white/10" />
             <div className="absolute inset-0 bg-gradient-to-r from-[#030712] via-transparent to-transparent" />
          </div>
        </section>

        {/* BENTO FEATURE GRID */}
        <section id="how-it-works" className="py-24 px-4 lg:px-8 max-w-[1400px] mx-auto">
            <div className="mb-16 text-center lg:text-left lg:max-w-xl">
                <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter">Powered by <br className="hidden md:block"/> Innovation.</h2>
                <p className="text-slate-400 text-lg">We don't just ship boxes. We manage complex data-driven logistics pipelines for the modern era.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:auto-rows-[250px]">
                {/* Large Main Feature */}
                <div className="md:col-span-8 md:row-span-2 bg-[#0a0f1c] border border-white/10 rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-end group overflow-hidden relative">
                    <div className="absolute top-4 right-4 md:top-0 md:right-0 p-2 md:p-12 opacity-10 group-hover:scale-110 transition-transform duration-700">
                        <MapPin className="w-32 h-32 md:w-64 md:h-64 text-white" />
                    </div>
                    <div className="relative z-10">
                        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
                            <MapPin className="w-8 h-8 text-blue-400" />
                        </div>
                        <h3 className="text-2xl md:text-3xl font-black text-white mb-2 md:mb-4">Live GPS Pipeline</h3>
                        <p className="text-slate-400 text-sm md:text-lg max-w-md leading-relaxed">Every vehicle in our fleet is equipped with military-grade GPS tracking, transmitting every meter of the journey directly to your dashboard.</p>
                    </div>
                </div>

                {/* Medium Feature */}
                <div className="md:col-span-4 md:row-span-1 bg-gradient-to-br from-indigo-600/20 to-blue-600/20 border border-blue-500/20 rounded-[2.5rem] p-8 flex flex-col justify-center">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                        <ShieldCheck className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-black text-white mb-2 tracking-tight">Security First</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">Cryptographic proof-of-delivery ensures that only the intended recipient can unlock the final confirmation.</p>
                </div>

                {/* Medium Feature 2 */}
                <div className="md:col-span-4 md:row-span-1 bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-8 flex flex-col justify-center">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                        <BarChart3 className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-black text-white mb-2 tracking-tight">Real-time Data</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">From humidity sensors to impact detection, monitor the condition of your shipments in real-time.</p>
                </div>

                {/* Wide Feature */}
                <div className="md:col-span-12 bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-8 md:p-10 flex flex-col lg:flex-row lg:items-center justify-between group overflow-hidden relative min-h-[300px] md:min-h-0">
                    <div className="max-w-xl">
                        <h3 className="text-xl md:text-2xl font-black text-white mb-2">Automated Milestone Documentation</h3>
                        <p className="text-slate-400 text-sm md:text-base leading-relaxed">High-resolution photos and video verification are automatically captured at every major hub, providing an immutable paper trail of your shipment's status.</p>
                    </div>
                    <div className="flex gap-3 md:gap-4 mt-8 lg:mt-0 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                        <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-2xl overflow-hidden border border-white/10 group-hover:border-blue-500/50 transition-colors">
                            <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=400" alt="Scanning" className="w-full h-full object-cover mix-blend-luminosity hover:mix-blend-normal transition-all" />
                        </div>
                        <div className="w-24 h-24 rounded-2xl overflow-hidden border border-white/10 group-hover:border-blue-500/50 transition-colors">
                            <img src="https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=400" alt="Verification" className="w-full h-full object-cover mix-blend-luminosity hover:mix-blend-normal transition-all" />
                        </div>
                        <div className="w-24 h-24 rounded-2xl overflow-hidden border border-white/10 group-hover:border-blue-500/50 transition-colors">
                            <img src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=400" alt="Parcel Verification" className="w-full h-full object-cover mix-blend-luminosity hover:mix-blend-normal transition-all" />
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* STATS STRIP */}
        <section id="stats" className="py-20 relative overflow-hidden">
            <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
               <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {[
                    { label: 'Delivery Rate', value: '99.9', suffix: '%' },
                    { label: 'Active Fleet', value: '5.2', suffix: 'K+' },
                    { label: 'Global Hubs', value: '180', suffix: '+' },
                    { label: 'Customer Trust', value: '4.9', suffix: '/5' }
                  ].map((stat, i) => (
                    <div key={i} className="text-center">
                      <p className="text-4xl md:text-6xl font-black text-white mb-2 tracking-tighter">
                        {stat.value}<span className="text-blue-500">{stat.suffix}</span>
                      </p>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{stat.label}</p>
                    </div>
                  ))}
               </div>
            </div>
        </section>

        {/* MODERN INFRASTRUCTURE (MASONRY) */}
        <section id="infrastructure" className="py-24 px-4 lg:px-8 max-w-[1400px] mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
                <div className="max-w-2xl">
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter">Our Global Network.</h2>
                    <p className="text-slate-400 text-lg">Operating at the intersection of heavy infrastructure and high-speed intelligence.</p>
                </div>
                <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors cursor-pointer">
                        <Plane className="w-5 h-5" />
                    </div>
                    <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors cursor-pointer">
                        <Ship className="w-5 h-5" />
                    </div>
                    <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors cursor-pointer">
                        <Truck className="w-5 h-5" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { title: 'SkyBridge Air', desc: 'Next-day intercontinental dispatch via private air corridors.', img: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2000' },
                  { title: 'OceanLink', desc: 'Sustainable, high-volume maritime transport across all major lanes.', img: 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?q=80&w=2000' },
                  { title: 'Continental Road', desc: 'Intelligent fleet routing for carbon-efficient last-mile delivery.', img: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=2000' }
                ].map((item, i) => (
                  <div key={i} className="group relative aspect-[4/5] rounded-[3rem] overflow-hidden border border-white/10">
                    <img src={item.img} alt={item.title} className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity group-hover:mix-blend-normal group-hover:scale-110 group-hover:mix-blend-normal transition-all duration-700 opacity-60" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-10 transform group-hover:-translate-y-2 transition-transform duration-500">
                        <h4 className="text-3xl font-black text-white mb-3">{item.title}</h4>
                        <p className="text-slate-300 text-sm leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
            </div>
        </section>

      </main>

      {/* Modern Footer */}
      <footer className="w-full border-t border-white/5 bg-[#030712] pt-24 pb-12 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-24">
                <div className="md:col-span-4 space-y-8">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                            <Package className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-white font-black text-2xl tracking-tighter">{companyName}</span>
                    </Link>
                    <p className="text-slate-500 leading-relaxed text-sm">
                        Leading the transition to cryptographic logistics and real-time physical asset verification.
                    </p>
                </div>
                
                <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-12">
                   <div className="space-y-6">
                      <h5 className="text-white font-black text-xs uppercase tracking-[0.2em]">Platform</h5>
                      <ul className="space-y-4 text-sm text-slate-500">
                        <li><a href="#" className="hover:text-white transition-colors">Tracking</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">API Access</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                      </ul>
                   </div>
                   <div className="space-y-6">
                      <h5 className="text-white font-black text-xs uppercase tracking-[0.2em]">Company</h5>
                      <ul className="space-y-4 text-sm text-slate-500">
                        <li><a href="#" className="hover:text-white transition-colors">Global Hubs</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Sustainability</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                      </ul>
                   </div>
                   <div className="space-y-6">
                      <h5 className="text-white font-black text-xs uppercase tracking-[0.2em]">Contact</h5>
                      <ul className="space-y-4 text-sm text-slate-500">
                        <li><a href="#" className="hover:text-white transition-colors">Enterprise Sales</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Support Center</a></li>
                      </ul>
                   </div>
                </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-between pt-12 border-t border-white/5 gap-6 text-xs text-slate-500 font-bold uppercase tracking-widest">
                <p><Link href="/login" className="hover:text-slate-400 transition-colors cursor-default" title="System Management">&copy;</Link> {new Date().getFullYear()} {companyName}. All Rights Reserved.</p>
                <div className="flex gap-8">
                    <a href="#" className="hover:text-white transition-colors">Privacy</a>
                    <a href="#" className="hover:text-white transition-colors">Terms</a>
                    <a href="#" className="hover:text-white transition-colors">Cookies</a>
                </div>
            </div>
        </div>
      </footer>

      {/* Decorative Elements */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes rotate-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-rotate {
          animation: rotate-slow 20s linear infinite;
        }
      `}} />
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import Link from 'next/link';

export function Navbar() {
  const [companyName, setCompanyName] = useState('Atlas Logistics');
  const [supportEmail, setSupportEmail] = useState('support@atlaslogistics.site');

  useEffect(() => {
    fetch('/api/settings')
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load settings');
        return res.json();
      })
      .then((data) => {
        if (data?.companyName) setCompanyName(data.companyName);
        if (data?.supportEmail) setSupportEmail(data.supportEmail);
      })
      .catch((err) => console.error('Failed to load settings', err));
  }, []);

  return (
    <nav className="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-5xl">
        <div className="bg-white/80 backdrop-blur-3xl border border-slate-200 rounded-2xl md:rounded-full px-4 md:px-8 h-14 md:h-20 flex items-center justify-between shadow-xl">
            <Link href="/" className="flex items-center gap-2 md:gap-3 group shrink-0">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                    <Package className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <span className="text-slate-900 font-black text-lg md:text-xl tracking-tighter whitespace-nowrap">{companyName}</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-slate-500">
                <a href="/#how-it-works" className="hover:text-blue-600 transition-colors">Process</a>
                <a href="/#infrastructure" className="hover:text-blue-600 transition-colors">Network</a>
                <a href="/#stats" className="hover:text-blue-600 transition-colors">Global</a>
            </div>

            <a
                href={`mailto:${supportEmail}`}
                className="text-xs font-mono font-semibold px-3.5 py-1.5 md:px-4 md:py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200/60 rounded-full transition-all shadow-sm shrink-0"
            >
                {supportEmail}
            </a>
        </div>
    </nav>
  );
}

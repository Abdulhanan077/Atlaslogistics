'use client';

import { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
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
    <footer className="w-full border-t border-slate-200 bg-white pt-24 pb-12 overflow-hidden relative z-10">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-24">
              <div className="md:col-span-4 space-y-8">
                  <Link href="/" className="flex items-center gap-3 group">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                          <Package className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-slate-900 font-black text-2xl tracking-tighter">{companyName}</span>
                  </Link>
                  <p className="text-slate-500 leading-relaxed text-sm">
                      Leading the transition to cryptographic logistics and real-time physical asset verification.
                  </p>
              </div>
              
              <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-12">
                 <div className="space-y-6">
                    <h5 className="text-slate-900 font-black text-xs uppercase tracking-[0.2em]">Platform</h5>
                    <ul className="space-y-4 text-sm text-slate-500">
                      <li><Link href="/#tracking-section" className="hover:text-blue-600 transition-colors">Tracking</Link></li>
                      <li><Link href="/api-access" className="hover:text-blue-600 transition-colors">API Access</Link></li>
                      <li><Link href="/security" className="hover:text-blue-600 transition-colors">Security</Link></li>
                    </ul>
                 </div>
                 <div className="space-y-6">
                    <h5 className="text-slate-900 font-black text-xs uppercase tracking-[0.2em]">Company</h5>
                    <ul className="space-y-4 text-sm text-slate-500">
                      <li><Link href="/#infrastructure" className="hover:text-blue-600 transition-colors">Global Hubs</Link></li>
                      <li><Link href="/sustainability" className="hover:text-blue-600 transition-colors">Sustainability</Link></li>
                      <li><Link href="/reviews" className="hover:text-blue-600 transition-colors">Customer Reviews</Link></li>
                    </ul>
                 </div>
                 <div className="space-y-6">
                    <h5 className="text-slate-900 font-black text-xs uppercase tracking-[0.2em]">Contact</h5>
                    <ul className="space-y-4 text-sm text-slate-500">
                      <li><a href={`mailto:${supportEmail}`} className="hover:text-blue-600 font-medium transition-colors text-slate-700 font-mono text-xs">{supportEmail}</a></li>
                      <li><Link href="/enterprise-sales" className="hover:text-blue-600 transition-colors">Enterprise Sales</Link></li>
                      <li><Link href="/support" className="hover:text-blue-600 transition-colors">Support Center</Link></li>
                    </ul>
                 </div>
              </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between pt-12 border-t border-slate-100 gap-6 text-xs text-slate-500 font-bold uppercase tracking-widest">
              <p><Link href="/login" className="hover:text-blue-600 transition-colors cursor-default" title="System Management">&copy;</Link> {new Date().getFullYear()} {companyName}. All Rights Reserved.</p>
              <div className="flex gap-8">
                  <Link href="/privacy" className="hover:text-slate-900 transition-colors">Privacy</Link>
                  <Link href="/terms" className="hover:text-slate-900 transition-colors">Terms</Link>
                  <Link href="/cookies" className="hover:text-slate-900 transition-colors">Cookies</Link>
              </div>
          </div>
      </div>
    </footer>
  );
}

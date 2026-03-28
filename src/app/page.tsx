'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Package, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [trackingId, setTrackingId] = useState('');
  const [companyName, setCompanyName] = useState('Atlas Logistics');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data?.companyName) setCompanyName(data.companyName);
      })
      .catch((err) => console.error('Failed to load settings', err));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingId.trim()) {
      router.push(`/track/${trackingId.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-blue-600/20 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 -right-1/4 w-1/2 h-1/2 bg-purple-600/20 rounded-full blur-[100px]" />
      </div>

      <div className="z-10 w-full max-w-2xl text-center space-y-8">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20 rotate-3 transition-transform hover:rotate-6">
            <Package className="w-8 h-8 text-white" />
          </div>
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-white bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
          Track with {companyName}
        </h1>
        <p className="text-lg text-brand-text-muted max-w-lg mx-auto">
          Enter your tracking ID to see real-time updates and delivery status.
        </p>

        <form onSubmit={handleSearch} className="relative max-w-lg mx-auto">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity" />
            <div className="relative bg-brand-surface border border-brand-border/50 rounded-2xl shadow-xl flex items-center p-2">
              <Search className="w-6 h-6 text-brand-text-muted/80 ml-3" />
              <input
                type="text"
                placeholder="Enter Tracking ID (e.g. TRK-12345678)"
                className="w-full bg-transparent border-none text-white text-lg placeholder-slate-500 focus:ring-0 px-4 py-3"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-6 py-3 font-semibold transition-colors flex items-center"
              >
                Track
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        </form>


      </div>

      <div className="absolute bottom-6 w-full text-center z-10">
        <p className="text-brand-text-muted/80 text-md">
          <Link href="/login" className="hover:text-brand-text-muted transition-colors">&copy;</Link> {new Date().getFullYear()} {companyName}. All rights reserved.
        </p>
      </div>
    </div>
  );
}

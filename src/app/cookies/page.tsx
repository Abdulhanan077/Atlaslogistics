'use client';

import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Cookie, Settings, ShieldCheck, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function CookiesPage() {
  const [preferences, setPreferences] = useState({
    essential: true, // Always true
    analytical: true,
    marketing: false
  });
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    toast.success('Cookie preferences updated successfully!');
    setTimeout(() => setIsSaved(false), 2000);
  };

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
            <Cookie className="w-4 h-4 text-blue-500" />
            <span className="text-[10px] font-black tracking-[0.2em] text-blue-600 uppercase">Privacy Settings</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tighter leading-none">
            Cookie Policy
          </h1>
          <p className="text-slate-500 text-sm font-bold tracking-wide uppercase">
            Manage your preference configurations
          </p>
        </div>

        {/* PREFERENCE CONTROL PANEL */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-2xl space-y-8 mb-12">
          <div className="flex items-start gap-4 border-b border-slate-100 pb-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
              <Settings className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Cookie Preference Dashboard</h3>
              <p className="text-slate-500 text-xs">Configure how Atlas stores tracking data on your local system.</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Essential */}
            <div className="flex items-start justify-between gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <h4 className="text-sm font-black text-slate-900 mb-1">Strictly Essential Cookies</h4>
                <p className="text-slate-500 text-xs leading-relaxed max-w-lg">
                  Required to facilitate session login tokens, secure tracking queries, and language selection preferences. These cookies cannot be deactivated.
                </p>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-md text-[10px] font-black uppercase tracking-wider shrink-0 select-none">Required</span>
            </div>

            {/* Analytical */}
            <div className="flex items-start justify-between gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <h4 className="text-sm font-black text-slate-900 mb-1">Performance & Analytical Cookies</h4>
                <p className="text-slate-500 text-xs leading-relaxed max-w-lg">
                  Allows us to count visitor trends and page source telemetry. Helps us evaluate page loading efficiency and telemetry pipeline performance.
                </p>
              </div>
              <button
                onClick={() => setPreferences({ ...preferences, analytical: !preferences.analytical })}
                className={`w-12 h-6 rounded-full p-1 transition-all shrink-0 cursor-pointer flex items-center ${
                  preferences.analytical ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white shadow-sm" />
              </button>
            </div>

            {/* Marketing */}
            <div className="flex items-start justify-between gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <h4 className="text-sm font-black text-slate-900 mb-1">Targeting & Marketing Cookies</h4>
                <p className="text-slate-500 text-xs leading-relaxed max-w-lg">
                  Used by our customer support channels to store active chat assistance histories and personalize logistics suggestions.
                </p>
              </div>
              <button
                onClick={() => setPreferences({ ...preferences, marketing: !preferences.marketing })}
                className={`w-12 h-6 rounded-full p-1 transition-all shrink-0 cursor-pointer flex items-center ${
                  preferences.marketing ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white shadow-sm" />
              </button>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 text-right">
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg text-white rounded-xl font-black text-sm tracking-tight transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 ml-auto"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  Preferences Saved!
                </>
              ) : (
                'Save Cookie Preferences'
              )}
            </button>
          </div>
        </div>

        {/* POLICY DOC OVERVIEW */}
        <div className="bg-slate-100 border border-slate-200 rounded-[2.5rem] p-8 md:p-12 space-y-6">
          <h4 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
            Cookie Declaration
          </h4>
          <p className="text-slate-600 text-xs leading-relaxed">
            Cookies are simple text fragments stored on your browser profile. By selecting preference criteria, you consent to our storage parameters. For detailed data controller profiles, please refer to our Privacy Policy page.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

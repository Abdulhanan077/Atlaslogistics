'use client';

import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Terminal, Key, ShieldCheck, Cpu, Copy, Check, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ApiAccessPage() {
  const [activeTab, setActiveTab] = useState<'curl' | 'js' | 'python'>('curl');
  const [apiKey, setApiKey] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const generateKey = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const array = new Uint8Array(24);
      window.crypto.getRandomValues(array);
      const hex = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
      setApiKey(`atlas_live_${hex}`);
      setIsGenerating(false);
      toast.success('Production API Key generated successfully!');
    }, 1200);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    toast.success('API Key copied to clipboard!');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const codeSnippets = {
    curl: `curl -X GET "https://api.atlaslogistics.site/v1/shipments/TRK-123456" \\
  -H "Authorization: Bearer ${apiKey || 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json"`,
    js: `const response = await fetch("https://api.atlaslogistics.site/v1/shipments/TRK-123456", {
  method: "GET",
  headers: {
    "Authorization": "Bearer ${apiKey || 'YOUR_API_KEY'}",
    "Content-Type": "application/json"
  }
});
const data = await response.json();
console.log(data);`,
    python: `import requests

url = "https://api.atlaslogistics.site/v1/shipments/TRK-123456"
headers = {
    "Authorization": f"Bearer {apiKey or 'YOUR_API_KEY'}",
    "Content-Type": "application/json"
}

response = requests.get(url, headers=headers)
shipment_data = response.json()
print(shipment_data)`
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
            <Terminal className="w-4 h-4 text-blue-500" />
            <span className="text-[10px] font-black tracking-[0.2em] text-blue-600 uppercase">Developers</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tighter leading-none">
            Developer API Access
          </h1>
          <p className="text-slate-600 text-lg md:text-xl font-medium leading-relaxed">
            Build on top of the global logistics trust network. Automate tracking, manifest validation, and customs clearances programmatically.
          </p>
        </div>

        {/* API KEY PANEL */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-10 shadow-2xl mb-12">
          <div className="flex items-start gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
              <Key className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">API Key Credentials</h3>
              <p className="text-slate-500 text-sm">Generate a sandbox or production key to authenticate your HTTP requests.</p>
            </div>
          </div>

          <div className="space-y-6">
            {apiKey ? (
              <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-2xl p-4 md:p-6">
                <code className="text-slate-900 font-mono text-sm break-all flex-1 select-all">{apiKey}</code>
                <button
                  onClick={copyToClipboard}
                  className="p-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition-all flex items-center justify-center shrink-0 cursor-pointer"
                >
                  {copiedKey ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5 text-slate-500" />}
                </button>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center">
                <p className="text-slate-400 text-sm mb-4">No API Key generated yet. Keys are stored in local session storage only.</p>
                <button
                  onClick={generateKey}
                  disabled={isGenerating}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg text-white rounded-xl font-black text-sm tracking-tight transition-all active:scale-95 disabled:opacity-75 cursor-pointer flex items-center justify-center gap-2 mx-auto"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-blue-200" />
                      Generating Key...
                    </>
                  ) : (
                    <>
                      Generate Production API Key
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* CODE PLAYGROUND */}
        <div className="bg-slate-900 text-slate-200 rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-800 mb-12">
          {/* Header */}
          <div className="bg-slate-950 px-6 py-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs text-slate-500 font-bold ml-2 font-mono">GET /v1/shipments/:id</span>
            </div>
            <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1 gap-1">
              {(['curl', 'js', 'python'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveTab(lang)}
                  className={`px-3 py-1 text-xs font-bold uppercase rounded-md transition-colors cursor-pointer ${
                    activeTab === lang ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
          {/* Editor */}
          <div className="p-6 md:p-8 font-mono text-sm leading-relaxed overflow-x-auto">
            <pre className="text-blue-400">{codeSnippets[activeTab]}</pre>
          </div>
        </div>

        {/* PLAN COMPARISON */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: 'Sandbox Free',
              rateLimit: '1,000 req / mo',
              desc: 'For testing and local development.',
              features: ['Basic Telemetry', 'Standard Support', 'Customs Doc Verification']
            },
            {
              name: 'Growth Plan',
              rateLimit: '50,000 req / mo',
              desc: 'For mid-size shippers and active distributors.',
              features: ['Real-time Webhooks', 'Priority SLA support', 'Phytosanitary Pre-clearance API']
            },
            {
              name: 'Enterprise Scale',
              rateLimit: 'Unlimited req / mo',
              desc: 'For massive global logistics operations.',
              features: ['Dedicated Edge Gateway', 'Custom compliance webhooks', 'Direct customs integration API']
            }
          ].map((plan, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <h4 className="text-lg font-black text-slate-900 mb-2">{plan.name}</h4>
              <p className="text-2xl font-black text-blue-600 mb-4">{plan.rateLimit}</p>
              <p className="text-slate-500 text-xs leading-relaxed mb-6 border-b border-slate-100 pb-4">{plan.desc}</p>
              <ul className="space-y-3">
                {plan.features.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}

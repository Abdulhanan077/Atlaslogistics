'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';

const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'ar', name: 'Arabic' },
    { code: 'zh-CN', name: 'Chinese' },
    { code: 'hi', name: 'Hindi' },
    { code: 'bn', name: 'Bengali' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
];

export default function GoogleTranslate() {
    const pathname = usePathname();
    const [selectedLang, setSelectedLang] = useState('en');

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).googleTranslateElementInit = () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            new (window as any).google.translate.TranslateElement(
                { pageLanguage: 'en', autoDisplay: false },
                'google_translate_element_hidden'
            );
        };
    }, []);

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const langCode = e.target.value;
        setSelectedLang(langCode);

        // Find the hidden Google select element and trigger a change
        const triggerChange = () => {
            let gtCombo: HTMLSelectElement | null = document.querySelector('.goog-te-combo');

            // If the element doesn't exist, it might be nested within an iframe
            if (!gtCombo) {
                const iframe = document.querySelector('iframe.goog-te-menu-frame');
                if (iframe) {
                    gtCombo = (iframe as HTMLIFrameElement).contentDocument?.querySelector('.goog-te-combo') || null;
                }
            }

            if (gtCombo) {
                gtCombo.value = langCode;
                gtCombo.dispatchEvent(new Event('change'));
            }
        };

        // Add a slight delay to ensure Google has mounted the DOM correctly
        setTimeout(triggerChange, 100);
    };

    if (pathname.startsWith('/admin')) {
        return null;
    }

    return (
        <div className="fixed bottom-4 left-4 z-[100]">
            {/* The Custom Native Dropdown */}
            <div className="relative group">
                <div className="flex items-center bg-slate-800 text-white rounded-lg shadow-lg border border-slate-700 overflow-hidden hover:border-blue-500 transition-colors">
                    <div className="pl-3 py-2 border-r border-slate-700 bg-slate-900">
                        <Globe className="w-4 h-4 text-blue-400" />
                    </div>
                    <select
                        value={selectedLang}
                        onChange={handleLanguageChange}
                        className="bg-slate-800 text-sm py-2 px-3 pr-8 appearance-none focus:outline-none cursor-pointer"
                    >
                        {languages.map(lang => (
                            <option key={lang.code} value={lang.code}>{lang.name}</option>
                        ))}
                    </select>
                    {/* Custom Arrow */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
            </div>

            {/* The Hidden Google Widget Container */}
            <div id="google_translate_element_hidden" className="hidden"></div>

            <Script
                src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
                strategy="lazyOnload"
            />
        </div>
    );
}

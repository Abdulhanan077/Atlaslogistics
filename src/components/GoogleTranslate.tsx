'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { usePathname } from 'next/navigation';

export default function GoogleTranslate() {
    const pathname = usePathname();

    useEffect(() => {
        // Check if the script has already initialized
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!(window as any).googleTranslateElementInit) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).googleTranslateElementInit = () => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                new (window as any).google.translate.TranslateElement(
                    {
                        pageLanguage: 'en',
                        layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
                        autoDisplay: false
                    },
                    'google_translate_element'
                );
            };
        }
    }, []);

    // Completely hide the widget if the user is in the admin portal
    if (pathname.startsWith('/admin')) {
        return null;
    }

    return (
        <>
            <div id="google_translate_element" className="fixed bottom-4 left-4 md:left-6 z-[100] scale-90 md:scale-100 origin-bottom-left"></div>
            <Script
                src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
                strategy="lazyOnload"
            />
        </>
    );
}

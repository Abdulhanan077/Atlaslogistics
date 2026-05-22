'use client';

export default function PayFeesButton() {
    return (
        <button
            onClick={() => {
                window.dispatchEvent(new CustomEvent('open-chat'));
            }}
            className="inline-flex items-center justify-center px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition-all shadow-md shadow-amber-600/10 hover:shadow-amber-600/20 text-sm text-center"
        >
            Pay Fees / Contact Support
        </button>
    );
}

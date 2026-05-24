'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Coins, Loader2 } from 'lucide-react';

interface PayFeesButtonProps {
    trackingNumber: string;
}

export default function PayFeesButton({ trackingNumber }: PayFeesButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleClick = () => {
        setIsLoading(true);
        router.push(`/track/${trackingNumber}/pay`);
    };

    return (
        <button
            onClick={handleClick}
            disabled={isLoading}
            className="inline-flex items-center justify-center px-5 py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-amber-600/70 text-white font-bold rounded-2xl transition-all hover:scale-105 shadow-lg shadow-amber-600/25 hover:shadow-amber-500/40 text-sm text-center cursor-pointer disabled:cursor-not-allowed select-none"
        >
            {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
                <Coins className="w-4 h-4 mr-2" />
            )}
            Pay Outstanding Fees Here
        </button>
    );
}

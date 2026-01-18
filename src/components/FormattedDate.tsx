'use client';

import { useEffect, useState } from 'react';

interface FormattedDateProps {
    date: string | Date;
    className?: string;
    mode?: 'datetime' | 'date'; // defaults to datetime
}

export default function FormattedDate({ date, className, mode = 'datetime' }: FormattedDateProps) {
    const [formatted, setFormatted] = useState('');

    useEffect(() => {
        if (!date) return;
        const d = new Date(date);

        if (mode === 'date') {
            setFormatted(d.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }));
        } else {
            setFormatted(d.toLocaleString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric'
            }));
        }
    }, [date, mode]);

    // Render a placeholder or empty string to avoid layout shift if possible, 
    // or just the formatted date once available.
    // Using opacity-0 during hydration helps avoid flash of unstyled content if we cared about matching server HTML exactly,
    // but here we just want the client time to appear.
    if (!formatted) return <span className={className}></span>;

    return <span className={className}>{formatted}</span>;
}

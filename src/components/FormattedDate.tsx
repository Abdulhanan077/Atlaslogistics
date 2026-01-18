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

        // Use UTC methods to display "static" time (ignoring viewer's timezone)
        if (mode === 'date') {
            setFormatted(d.toLocaleDateString(undefined, {
                timeZone: 'UTC',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }));
        } else {
            setFormatted(d.toLocaleString(undefined, {
                timeZone: 'UTC',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric'
            }));
        }
    }, [date, mode]);

    if (!formatted) return <span className={className}></span>;

    return <span className={className}>{formatted}</span>;
}

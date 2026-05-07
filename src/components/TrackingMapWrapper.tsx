'use client';

import dynamic from 'next/dynamic';

const TrackingMap = dynamic(() => import('./TrackingMap'), {
    loading: () => <div className="h-[400px] w-full bg-slate-800 animate-pulse rounded-xl" />,
    ssr: false
});

export default function TrackingMapWrapper(props: { 
    lat: number; 
    lng: number; 
    locationName: string; 
    events?: any[]; 
    vehicleType?: string;
    destLat?: string | number;
    destLng?: string | number;
    destinationName?: string;
    destinationAddress?: string;
    showToggle?: boolean;
    isRouteVisible?: boolean;
    onToggle?: (visible: boolean) => void;
}) {
    return <TrackingMap {...props} />;
}

'use client';

import dynamic from 'next/dynamic';

const TrackingMap = dynamic(() => import('./TrackingMap'), {
    loading: () => <div className="h-[400px] w-full bg-slate-200 animate-pulse rounded-xl" />,
    ssr: false
});

export default function TrackingMapWrapper(props: { 
    lat: number; 
    lng: number; 
    locationName: string; 
    events?: any[]; 
    vehicleType?: string;
    originLat?: string | number;
    originLng?: string | number;
    destLat?: string | number;
    destLng?: string | number;
    destinationName?: string;
    destinationAddress?: string;
    showToggle?: boolean;
    isRouteVisible?: boolean;
    onToggle?: (visible: boolean) => void;
    onDragEnd?: (lat: number, lng: number) => void;
}) {
    return <TrackingMap {...props} />;
}

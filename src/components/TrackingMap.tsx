'use client';

import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useState, useMemo } from 'react';
import { Map as MapIcon, Route } from 'lucide-react';

const calculateBearing = (startLat: number, startLng: number, endLat: number, endLng: number) => {
    const startLatRad = (startLat * Math.PI) / 180;
    const startLngRad = (startLng * Math.PI) / 180;
    const endLatRad = (endLat * Math.PI) / 180;
    const endLngRad = (endLng * Math.PI) / 180;

    const y = Math.sin(endLngRad - startLngRad) * Math.cos(endLatRad);
    const x = Math.cos(startLatRad) * Math.sin(endLatRad) -
              Math.sin(startLatRad) * Math.cos(endLatRad) * Math.cos(endLngRad - startLngRad);
    let bearing = (Math.atan2(y, x) * 180) / Math.PI;
    return (bearing + 360) % 360;
};

const getVehicleIcon = (type: string, rotation: number = 0) => {
    let emoji = "🚚";
    let baseRotation = 90; // Default emojis (truck, ship, etc) face left. For North (0 deg), rotate 90 deg.
    const isSideView = type !== 'PLANE';
    
    if (type === 'SHIP') emoji = "🚢";
    if (type === 'PLANE') {
        emoji = "✈️";
        baseRotation = 45; // Plane emoji is typically already slanted
    }
    if (type === 'VAN') emoji = "🚐";
    if (type === 'TRAIN') emoji = "🚆";

    const finalRotation = (rotation + baseRotation) % 360;
    // For side-view icons, if the rotation is between 90 and 270, it will appear upside down.
    // We flip it vertically (scaleY) in these cases to keep it upright while still facing the right way.
    const needsFlip = isSideView && finalRotation > 90 && finalRotation < 270;
    const transform = `rotate(${finalRotation}deg) ${needsFlip ? 'scaleY(-1)' : ''}`;

    return L.divIcon({
        className: 'custom-vehicle-icon',
        html: `<div style="transform: ${transform}; background: #3b82f6; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); border: 2px solid white; font-size: 20px; transition: transform 0.5s ease-out;">${emoji}</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18]
    });
};

const getDotIcon = (isStart = false) => {
    const color = isStart ? '#22c55e' : '#ef4444';
    return L.divIcon({
        className: 'custom-dot-icon',
        html: `<div style="background: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.4);"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
        popupAnchor: [0, -7]
    });
};

const getDestinationIcon = () => {
    return L.divIcon({
        className: 'custom-destination-icon',
        html: `<div style="background: #ef4444; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); border: 2px solid white; font-size: 16px;">🏁</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15]
    });
};

export default function TrackingMap({ 
    lat, 
    lng, 
    locationName,
    events = [],
    vehicleType = 'TRUCK',
    destLat,
    destLng,
    destinationName,
    destinationAddress,
    showToggle = true,
    isRouteVisible,
    onToggle
}: { 
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
    const [localShowRoute, setLocalShowRoute] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('map_show_route');
            return saved !== null ? JSON.parse(saved) : true;
        }
        return true;
    });

    // Use controlled state if provided, otherwise fallback to local state
    const showRoute = isRouteVisible !== undefined ? isRouteVisible : localShowRoute;

    const handleToggleRoute = () => {
        const next = !showRoute;
        if (onToggle) {
            onToggle(next);
        } else {
            setLocalShowRoute(next);
            localStorage.setItem('map_show_route', JSON.stringify(next));
        }
    };

    const routePoints = useMemo(() => {
        const points = [];
        
        if (events && events.length > 0) {
            const validEvents = [...events]
                .filter(e => e.latitude && e.longitude)
                .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                
            points.push(...validEvents.map(e => ({
                lat: parseFloat(e.latitude),
                lng: parseFloat(e.longitude),
                location: e.location,
                status: e.status
            })));
        }

        // If we have destination coords, add them as the final point
        if (destLat && destLng) {
            const dLat = parseFloat(String(destLat));
            const dLng = parseFloat(String(destLng));
            
            if (!isNaN(dLat) && !isNaN(dLng)) {
                // Check if last event is already the destination to avoid duplicates
                const lastPoint = points[points.length - 1];
                if (!lastPoint || lastPoint.lat !== dLat || lastPoint.lng !== dLng) {
                    points.push({
                        lat: dLat,
                        lng: dLng,
                        location: destinationName || 'Destination',
                        status: 'DESTINATION'
                    });
                }
            }
        }
            
        return points;
    }, [events, destLat, destLng, destinationName]);

    const historyLine = useMemo(() => {
        return routePoints
            .filter(p => p.status !== 'DESTINATION')
            .map(p => [p.lat, p.lng] as [number, number]);
    }, [routePoints]);

    const projectedLine = useMemo(() => {
        const dest = routePoints.find(p => p.status === 'DESTINATION');
        if (!dest || historyLine.length === 0) return [];
        return [historyLine[historyLine.length - 1], [dest.lat, dest.lng] as [number, number]];
    }, [routePoints, historyLine]);

    const center = [lat, lng] as [number, number];

    const bearing = useMemo(() => {
        if (!destLat || !destLng) return 0;
        const dLat = parseFloat(String(destLat));
        const dLng = parseFloat(String(destLng));
        if (isNaN(dLat) || isNaN(dLng)) return 0;
        return calculateBearing(lat, lng, dLat, dLng);
    }, [lat, lng, destLat, destLng]);

    return (
        <div className="flex flex-col gap-3">
            {showToggle && routePoints.length > 1 && (
                <div className="flex justify-end">
                    <button
                        onClick={handleToggleRoute}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                            showRoute 
                                ? 'bg-blue-600 text-white hover:bg-blue-500' 
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                    >
                        {showRoute ? <MapIcon className="w-4 h-4" /> : <Route className="w-4 h-4" />}
                        {showRoute ? 'Hide Route' : 'Show Route'}
                    </button>
                </div>
            )}
            
            <div className="h-[400px] w-full rounded-xl overflow-hidden shadow-lg border border-slate-700 relative z-0">
                <MapContainer
                    center={center}
                    zoom={routePoints.length > 1 ? 4 : 13}
                    scrollWheelZoom={false}
                    worldCopyJump={true}
                    minZoom={2}
                    maxBounds={[[-90, -180], [90, 180]]}
                    style={{ height: '100%', width: '100%', background: '#f8fafc' }}
                >
                    <TileLayer
                        attribution='&copy; ESRI'
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
                        maxZoom={20}
                        noWrap={true}
                    />
                    
                    {showRoute && (
                        <>
                            {/* Covered Route (Solid) */}
                            {historyLine.length > 1 && (
                                <Polyline 
                                    positions={historyLine} 
                                    color="#3b82f6" 
                                    weight={4} 
                                    opacity={1}
                                />
                            )}
                            
                            {/* Projected Route (Dashed) */}
                            {projectedLine.length > 1 && (
                                <Polyline 
                                    positions={projectedLine} 
                                    color="#94a3b8" 
                                    weight={3} 
                                    opacity={0.6}
                                    dashArray="10, 10" 
                                />
                            )}
                        </>
                    )}

                    {showRoute && routePoints.map((point, idx) => {
                        if (idx === routePoints.length - 1) return null;
                        
                        // Skip if this is the current vehicle location to avoid overlap
                        if (point.lat === lat && point.lng === lng) return null;

                        return (
                            <Marker 
                                key={idx} 
                                position={[point.lat, point.lng]} 
                                icon={getDotIcon(idx === 0)}
                            >
                                <Popup>
                                    <div className="text-slate-800">
                                        <div className="font-bold text-sm mb-1">{point.location}</div>
                                        <div className="text-xs text-slate-500">{point.status}</div>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}

                    {routePoints.length > 0 ? (
                        <>
                            <Marker 
                                position={center} 
                                icon={getVehicleIcon(vehicleType, bearing)}
                            >
                                <Popup>
                                    <div className="text-slate-800">
                                        <div className="font-bold text-sm mb-1">{locationName}</div>
                                        <div className="text-xs text-slate-500">Current Location</div>
                                    </div>
                                </Popup>
                            </Marker>

                            {(() => {
                                const dLat = parseFloat(String(destLat));
                                const dLng = parseFloat(String(destLng));
                                if (isNaN(dLat) || isNaN(dLng)) return null;
                                
                                return (
                                    <Marker 
                                        position={[dLat, dLng]} 
                                        icon={getDestinationIcon()}
                                    >
                                        <Popup>
                                            <div className="text-slate-800">
                                                <div className="font-bold text-sm mb-1">{destinationName || 'Destination'}</div>
                                                {destinationAddress && <div className="text-xs text-slate-600 mb-1">{destinationAddress}</div>}
                                                <div className="text-xs text-slate-400">Target Destination</div>
                                            </div>
                                        </Popup>
                                    </Marker>
                                );
                            })()}
                        </>
                    ) : (
                        <Marker position={center} icon={getVehicleIcon(vehicleType)}>
                            <Popup>
                                <span className="font-semibold text-slate-800">{locationName}</span>
                            </Popup>
                        </Marker>
                    )}
                </MapContainer>
            </div>
        </div>
    );
}

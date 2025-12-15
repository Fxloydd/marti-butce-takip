'use client';

import { useEffect, useState } from 'react';
import { Payment } from '@/types';
import { Card } from '@/components/ui/Card';
import { MapPin, X } from 'lucide-react';

// Dynamic import for Leaflet to avoid SSR issues
let MapContainer: any;
let TileLayer: any;
let Marker: any;
let Popup: any;

interface LocationMapProps {
    payments: Payment[];
    isOpen: boolean;
    onClose: () => void;
}

// Simple geocoding based on common locations (mock data for demo)
const locationCoords: Record<string, [number, number]> = {
    'istanbul': [41.0082, 28.9784],
    'ankara': [39.9334, 32.8597],
    'izmir': [38.4192, 27.1287],
    'antalya': [36.8969, 30.7133],
    'taksim': [41.0370, 28.9850],
    'kadıköy': [40.9927, 29.0378],
    'beşiktaş': [41.0422, 29.0067],
    'eminönü': [41.0166, 28.9709],
    'bakırköy': [40.9807, 28.8725],
    'üsküdar': [41.0256, 29.0150],
    'ataşehir': [40.9832, 29.1171],
    'şişli': [41.0603, 28.9877],
    'levent': [41.0819, 29.0159],
    'mecidiyeköy': [41.0677, 29.0056],
    'default': [41.0082, 28.9784], // Istanbul center
};

function getCoordinates(location: string): [number, number] {
    const normalized = location.toLowerCase().trim();

    for (const [key, coords] of Object.entries(locationCoords)) {
        if (normalized.includes(key)) {
            return coords;
        }
    }

    // Return default with slight random offset for variety
    const defaultCoords = locationCoords['default'];
    const offset = () => (Math.random() - 0.5) * 0.05;
    return [defaultCoords[0] + offset(), defaultCoords[1] + offset()];
}

export function LocationMap({ payments, isOpen, onClose }: LocationMapProps) {
    const [isClient, setIsClient] = useState(false);
    const [leafletLoaded, setLeafletLoaded] = useState(false);

    useEffect(() => {
        setIsClient(true);

        // Dynamic import Leaflet only on client
        if (typeof window !== 'undefined') {
            Promise.all([
                import('react-leaflet'),
                import('leaflet'),
                // @ts-ignore
                import('leaflet/dist/leaflet.css'),
            ]).then(([reactLeaflet, L]) => {
                MapContainer = reactLeaflet.MapContainer;
                TileLayer = reactLeaflet.TileLayer;
                Marker = reactLeaflet.Marker;
                Popup = reactLeaflet.Popup;

                // Fix default marker icon
                delete (L.Icon.Default.prototype as any)._getIconUrl;
                L.Icon.Default.mergeOptions({
                    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                });

                setLeafletLoaded(true);
            });
        }
    }, []);

    if (!isOpen) return null;

    const markers = payments.slice(0, 20).map((p, i) => ({
        id: p.id,
        position: getCoordinates(p.location),
        amount: p.amount,
        location: p.location,
        user: p.user,
        time: p.createdAt instanceof Date
            ? `${p.createdAt.getHours().toString().padStart(2, '0')}:${p.createdAt.getMinutes().toString().padStart(2, '0')}`
            : '--:--',
    }));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl mx-4 bg-white dark:bg-zinc-900 rounded-3xl p-4 animate-scale-in">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                            <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                            Konum Haritası
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    >
                        <X className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                    </button>
                </div>

                {/* Map */}
                <div className="w-full h-[400px] rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    {isClient && leafletLoaded && MapContainer ? (
                        <MapContainer
                            center={[41.0082, 28.9784]}
                            zoom={12}
                            style={{ height: '100%', width: '100%' }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {markers.map((marker) => (
                                <Marker key={marker.id} position={marker.position}>
                                    <Popup>
                                        <div className="text-sm">
                                            <p className="font-bold">₺{marker.amount.toFixed(2)}</p>
                                            <p>{marker.user}</p>
                                            <p className="text-gray-500">{marker.location}</p>
                                            <p className="text-gray-400">{marker.time}</p>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-2" />
                                <p className="text-sm text-zinc-500">Harita yükleniyor...</p>
                            </div>
                        </div>
                    )}
                </div>

                <p className="text-xs text-zinc-500 text-center mt-3">
                    {markers.length} konum gösteriliyor
                </p>
            </div>

            <style jsx>{`
                @keyframes scale-in {
                    from {
                        transform: scale(0.9);
                        opacity: 0;
                    }
                    to {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
                .animate-scale-in {
                    animation: scale-in 0.2s ease-out;
                }
            `}</style>
        </div>
    );
}

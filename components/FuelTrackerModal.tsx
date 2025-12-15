'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Play, Square, Fuel, MapPin, Gauge, DollarSign, RefreshCw, Settings, History, Car, Navigation } from 'lucide-react';
import { useFuelTracker, TripSummary } from '@/hooks/useFuelTracker';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import dynamic from 'next/dynamic';

// Dynamically import map to avoid SSR issues
const MapContainer = dynamic(
    () => import('react-leaflet').then(mod => mod.MapContainer),
    { ssr: false }
);
const TileLayer = dynamic(
    () => import('react-leaflet').then(mod => mod.TileLayer),
    { ssr: false }
);
const Polyline = dynamic(
    () => import('react-leaflet').then(mod => mod.Polyline),
    { ssr: false }
);
const Marker = dynamic(
    () => import('react-leaflet').then(mod => mod.Marker),
    { ssr: false }
);

interface FuelTrackerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function FuelTrackerModal({ isOpen, onClose }: FuelTrackerModalProps) {
    const { user } = useAuth();
    const tracker = useFuelTracker();

    const [view, setView] = useState<'tracker' | 'settings' | 'history'>('tracker');
    const [fuelPrice, setFuelPrice] = useState(48.50);
    const [consumptionPer100km, setConsumptionPer100km] = useState(7.0);
    const [isLoadingPrice, setIsLoadingPrice] = useState(false);
    const [priceUpdatedAt, setPriceUpdatedAt] = useState<string | null>(null);
    const [tripHistory, setTripHistory] = useState<TripSummary[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    // Load settings and history on mount
    useEffect(() => {
        if (isOpen && user) {
            loadSettings();
            loadTripHistory();
            fetchFuelPrice();
        }
    }, [isOpen, user]);

    const loadSettings = async () => {
        if (!user) return;
        const { data } = await supabase
            .from('fuel_settings')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (data) {
            setConsumptionPer100km(data.consumption_per_100km || 7.0);
            if (data.fuel_price) setFuelPrice(data.fuel_price);
        }
    };

    const saveSettings = async () => {
        if (!user) return;
        await supabase.from('fuel_settings').upsert({
            user_id: user.id,
            consumption_per_100km: consumptionPer100km,
            fuel_price: fuelPrice,
            updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
    };

    const loadTripHistory = async () => {
        if (!user) return;
        const { data } = await supabase
            .from('trip_history')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10);

        if (data) {
            setTripHistory(data.map(trip => ({
                id: trip.id,
                startTime: new Date(trip.start_time),
                endTime: new Date(trip.end_time),
                totalDistance: trip.total_distance,
                fuelUsed: trip.fuel_used,
                fuelCost: trip.fuel_cost,
                consumptionPer100km: trip.consumption_per_100km,
                fuelPrice: trip.fuel_price,
            })));
        }
    };

    const fetchFuelPrice = async (forceRefresh = false) => {
        setIsLoadingPrice(true);
        try {
            const response = await fetch('/api/fuel-price', {
                method: forceRefresh ? 'POST' : 'GET',
            });
            const data = await response.json();
            if (data.price) {
                setFuelPrice(data.price);
                setPriceUpdatedAt(data.updatedAt);
            }
        } catch (error) {
            console.error('Error fetching fuel price:', error);
        }
        setIsLoadingPrice(false);
    };

    const handleStartTracking = () => {
        tracker.startTracking();
    };

    const handleStopTracking = async () => {
        const result = tracker.stopTracking();
        const { fuelUsed, fuelCost } = tracker.calculateFuel(consumptionPer100km, fuelPrice);

        // Save trip to database (only summary, not coordinates)
        if (user && result.totalDistance > 0.1) {
            setIsSaving(true);
            await supabase.from('trip_history').insert({
                user_id: user.id,
                start_time: result.startTime?.toISOString(),
                end_time: new Date().toISOString(),
                total_distance: result.totalDistance,
                fuel_used: fuelUsed,
                fuel_cost: fuelCost,
                consumption_per_100km: consumptionPer100km,
                fuel_price: fuelPrice,
            });
            await loadTripHistory();
            setIsSaving(false);
        }
    };

    const { fuelUsed, fuelCost } = tracker.calculateFuel(consumptionPer100km, fuelPrice);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full sm:max-w-lg bg-zinc-900 rounded-t-3xl sm:rounded-3xl max-h-[95vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                            <Fuel className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Yakıt Takip</h2>
                            <p className="text-xs text-zinc-500">Sürüş ve yakıt hesaplama</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setView('settings')}
                            className={`p-2 rounded-full transition-colors ${view === 'settings' ? 'bg-orange-500 text-white' : 'text-zinc-400 hover:text-white'}`}
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setView('history')}
                            className={`p-2 rounded-full transition-colors ${view === 'history' ? 'bg-orange-500 text-white' : 'text-zinc-400 hover:text-white'}`}
                        >
                            <History className="w-5 h-5" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-4">
                    {view === 'tracker' && (
                        <div className="space-y-4">
                            {/* Map */}
                            <div className="h-48 rounded-2xl overflow-hidden bg-zinc-800 relative">
                                {typeof window !== 'undefined' && tracker.coordinates.length > 0 ? (
                                    <MapContainer
                                        center={[tracker.coordinates[tracker.coordinates.length - 1].lat, tracker.coordinates[tracker.coordinates.length - 1].lng]}
                                        zoom={15}
                                        style={{ height: '100%', width: '100%' }}
                                        zoomControl={false}
                                    >
                                        <TileLayer
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            attribution=""
                                        />
                                        <Polyline
                                            positions={tracker.coordinates.map(c => [c.lat, c.lng])}
                                            color="#f97316"
                                            weight={4}
                                        />
                                    </MapContainer>
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-zinc-500">
                                        <div className="text-center">
                                            <Navigation className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">Takip başladığında harita burada görünecek</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                {/* Distance */}
                                <div className="p-4 rounded-2xl bg-zinc-800/50 border border-zinc-700/50">
                                    <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1">
                                        <MapPin className="w-4 h-4" />
                                        Mesafe
                                    </div>
                                    <p className="text-2xl font-bold text-white">
                                        {tracker.totalDistance.toFixed(2)} <span className="text-sm font-normal text-zinc-500">km</span>
                                    </p>
                                </div>

                                {/* Speed */}
                                <div className="p-4 rounded-2xl bg-zinc-800/50 border border-zinc-700/50">
                                    <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1">
                                        <Gauge className="w-4 h-4" />
                                        Hız
                                    </div>
                                    <p className="text-2xl font-bold text-white">
                                        {tracker.currentSpeed.toFixed(0)} <span className="text-sm font-normal text-zinc-500">km/s</span>
                                    </p>
                                </div>

                                {/* Fuel Used */}
                                <div className="p-4 rounded-2xl bg-zinc-800/50 border border-zinc-700/50">
                                    <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1">
                                        <Fuel className="w-4 h-4" />
                                        Yakıt
                                    </div>
                                    <p className="text-2xl font-bold text-orange-400">
                                        {fuelUsed.toFixed(2)} <span className="text-sm font-normal text-zinc-500">L</span>
                                    </p>
                                </div>

                                {/* Cost */}
                                <div className="p-4 rounded-2xl bg-zinc-800/50 border border-zinc-700/50">
                                    <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1">
                                        <DollarSign className="w-4 h-4" />
                                        Maliyet
                                    </div>
                                    <p className="text-2xl font-bold text-green-400">
                                        ₺{fuelCost.toFixed(2)}
                                    </p>
                                </div>
                            </div>

                            {/* Fuel Price Info */}
                            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/30 border border-zinc-700/30">
                                <div className="flex items-center gap-2">
                                    <Fuel className="w-4 h-4 text-orange-400" />
                                    <span className="text-sm text-zinc-400">Benzin fiyatı:</span>
                                    <span className="text-white font-medium">₺{fuelPrice.toFixed(2)}/L</span>
                                </div>
                                <button
                                    onClick={() => fetchFuelPrice(true)}
                                    disabled={isLoadingPrice}
                                    className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors disabled:opacity-50"
                                >
                                    <RefreshCw className={`w-4 h-4 ${isLoadingPrice ? 'animate-spin' : ''}`} />
                                </button>
                            </div>

                            {/* Error Message */}
                            {tracker.error && (
                                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                    {tracker.error}
                                </div>
                            )}

                            {/* Start/Stop Button */}
                            <button
                                onClick={tracker.isTracking ? handleStopTracking : handleStartTracking}
                                disabled={isSaving}
                                className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${tracker.isTracking
                                        ? 'bg-red-500 hover:bg-red-600 text-white'
                                        : 'bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 text-white'
                                    }`}
                            >
                                {isSaving ? (
                                    <>
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                        Kaydediliyor...
                                    </>
                                ) : tracker.isTracking ? (
                                    <>
                                        <Square className="w-5 h-5" />
                                        Durdur
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-5 h-5" />
                                        Başlat
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {view === 'settings' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Car className="w-5 h-5 text-orange-400" />
                                Araç Ayarları
                            </h3>

                            {/* Consumption Setting */}
                            <div className="p-4 rounded-2xl bg-zinc-800/50 border border-zinc-700/50">
                                <label className="block text-sm text-zinc-400 mb-2">
                                    100 km'de yakıt tüketimi (Litre)
                                </label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="range"
                                        min="3"
                                        max="20"
                                        step="0.5"
                                        value={consumptionPer100km}
                                        onChange={(e) => setConsumptionPer100km(parseFloat(e.target.value))}
                                        className="flex-1 h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                                    />
                                    <span className="text-xl font-bold text-white min-w-[60px] text-right">
                                        {consumptionPer100km} L
                                    </span>
                                </div>
                            </div>

                            {/* Manual Fuel Price */}
                            <div className="p-4 rounded-2xl bg-zinc-800/50 border border-zinc-700/50">
                                <label className="block text-sm text-zinc-400 mb-2">
                                    Manuel benzin fiyatı (TL/Litre)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={fuelPrice}
                                    onChange={(e) => setFuelPrice(parseFloat(e.target.value) || 0)}
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white"
                                />
                            </div>

                            {/* Save Button */}
                            <button
                                onClick={async () => {
                                    await saveSettings();
                                    setView('tracker');
                                }}
                                className="w-full py-3 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors"
                            >
                                Kaydet
                            </button>
                        </div>
                    )}

                    {view === 'history' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <History className="w-5 h-5 text-orange-400" />
                                Sürüş Geçmişi
                            </h3>

                            {tripHistory.length === 0 ? (
                                <div className="text-center py-8 text-zinc-500">
                                    <Car className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>Henüz kayıtlı sürüş yok</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {tripHistory.map((trip) => (
                                        <div key={trip.id} className="p-4 rounded-2xl bg-zinc-800/50 border border-zinc-700/50">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm text-zinc-400">
                                                    {trip.startTime.toLocaleDateString('tr-TR')}
                                                </span>
                                                <span className="text-xs text-zinc-500">
                                                    {trip.startTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2 text-center">
                                                <div>
                                                    <p className="text-lg font-bold text-white">{trip.totalDistance.toFixed(1)}</p>
                                                    <p className="text-xs text-zinc-500">km</p>
                                                </div>
                                                <div>
                                                    <p className="text-lg font-bold text-orange-400">{trip.fuelUsed.toFixed(1)}</p>
                                                    <p className="text-xs text-zinc-500">litre</p>
                                                </div>
                                                <div>
                                                    <p className="text-lg font-bold text-green-400">₺{trip.fuelCost.toFixed(0)}</p>
                                                    <p className="text-xs text-zinc-500">maliyet</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

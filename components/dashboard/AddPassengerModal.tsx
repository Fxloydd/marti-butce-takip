'use client';

import { useState, useEffect } from 'react';
import { X, MapPin, Wallet, CreditCard, Loader2, Navigation } from 'lucide-react';
import { PaymentType } from '@/types';

interface AddPassengerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (payment: {
        amount: number;
        paymentType: PaymentType;
        user: string;
        location: string;
    }) => void;
    currentUser: string;
}

// Common locations for quick selection
const QUICK_LOCATIONS = ['Kadıköy', 'Beşiktaş', 'Üsküdar', 'Şişli', 'Taksim', 'Bakırköy', 'Ataşehir', 'Maltepe'];

export function AddPassengerModal({
    isOpen,
    onClose,
    onAdd,
    currentUser
}: AddPassengerModalProps) {
    const [amount, setAmount] = useState('');
    const [paymentType, setPaymentType] = useState<PaymentType>('cash');
    const [location, setLocation] = useState('');
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [locationError, setLocationError] = useState('');

    // Auto-detect location when modal opens
    useEffect(() => {
        if (isOpen && !location) {
            detectLocation();
        }
    }, [isOpen]);

    const detectLocation = async () => {
        if (!navigator.geolocation) {
            setLocationError('Konum servisi desteklenmiyor');
            return;
        }

        setIsLoadingLocation(true);
        setLocationError('');

        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000, // Cache for 1 minute
                });
            });

            // Reverse geocoding using free Nominatim API
            const { latitude, longitude } = position.coords;
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1`,
                {
                    headers: {
                        'Accept-Language': 'tr',
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                // Extract neighborhood or suburb
                const address = data.address;
                const locationName = address.neighbourhood ||
                    address.suburb ||
                    address.district ||
                    address.city_district ||
                    address.town ||
                    address.city ||
                    'Bilinmeyen Konum';
                setLocation(locationName);
            } else {
                setLocation('Konum alınamadı');
            }
        } catch (error) {
            console.error('Location error:', error);
            if (error instanceof GeolocationPositionError) {
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        setLocationError('Konum izni reddedildi');
                        break;
                    case error.POSITION_UNAVAILABLE:
                        setLocationError('Konum bilgisi alınamadı');
                        break;
                    case error.TIMEOUT:
                        setLocationError('Konum isteği zaman aşımına uğradı');
                        break;
                }
            } else {
                setLocationError('Konum alınamadı');
            }
        } finally {
            setIsLoadingLocation(false);
        }
    };

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !location) return;

        onAdd({
            amount: parseFloat(amount),
            paymentType,
            user: currentUser,
            location,
        });

        // Reset form
        setAmount('');
        setLocation('');
        setPaymentType('cash');
        setLocationError('');
        onClose();
    };

    const quickAmounts = [50, 75, 100, 150, 200, 250];

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                            Yolcu Ekle
                        </h2>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            {currentUser} olarak kayıt
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    >
                        <X className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                            Tutar (₺)
                        </label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0"
                            className="w-full px-4 py-3 text-2xl font-bold text-center rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                            autoFocus
                        />
                        {/* Quick amounts */}
                        <div className="flex flex-wrap gap-2 mt-3">
                            {quickAmounts.map((q) => (
                                <button
                                    key={q}
                                    type="button"
                                    onClick={() => setAmount(q.toString())}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${amount === q.toString()
                                            ? 'bg-indigo-500 text-white'
                                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30'
                                        }`}
                                >
                                    ₺{q}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Payment Type */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                            Ödeme Türü
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setPaymentType('cash')}
                                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-medium transition-all ${paymentType === 'cash'
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 ring-2 ring-green-500'
                                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                                    }`}
                            >
                                <Wallet className="w-5 h-5" />
                                Nakit
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaymentType('iban')}
                                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-medium transition-all ${paymentType === 'iban'
                                        ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 ring-2 ring-indigo-500'
                                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                                    }`}
                            >
                                <CreditCard className="w-5 h-5" />
                                IBAN
                            </button>
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                            <MapPin className="w-4 h-4 inline mr-1" />
                            Konum
                        </label>

                        {/* Location Input with Auto-detect */}
                        <div className="relative">
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder={isLoadingLocation ? 'Konum alınıyor...' : 'Konum girin veya seçin'}
                                className="w-full px-4 py-3 pr-12 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                            <button
                                type="button"
                                onClick={detectLocation}
                                disabled={isLoadingLocation}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 disabled:opacity-50"
                                title="Konumu otomatik al"
                            >
                                {isLoadingLocation ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Navigation className="w-5 h-5" />
                                )}
                            </button>
                        </div>

                        {/* Location Error */}
                        {locationError && (
                            <p className="text-sm text-red-500 mt-1">{locationError}</p>
                        )}

                        {/* Quick Location Buttons */}
                        <div className="flex flex-wrap gap-2 mt-3">
                            {QUICK_LOCATIONS.map((loc) => (
                                <button
                                    key={loc}
                                    type="button"
                                    onClick={() => setLocation(loc)}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${location === loc
                                            ? 'bg-indigo-500 text-white'
                                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30'
                                        }`}
                                >
                                    {loc}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={!amount || !location}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        Kaydet
                    </button>
                </form>
            </div>

            <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
        </div>
    );
}

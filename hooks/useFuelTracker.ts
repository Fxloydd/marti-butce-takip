'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export interface Coordinate {
    lat: number;
    lng: number;
    timestamp: number;
}

export interface TripSummary {
    id: string;
    startTime: Date;
    endTime: Date;
    totalDistance: number; // km
    fuelUsed: number; // liters
    fuelCost: number; // TL
    consumptionPer100km: number;
    fuelPrice: number;
}

interface FuelTrackerState {
    isTracking: boolean;
    coordinates: Coordinate[];
    totalDistance: number;
    currentSpeed: number;
    startTime: Date | null;
    error: string | null;
}

// Haversine formula to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export function useFuelTracker() {
    const [state, setState] = useState<FuelTrackerState>({
        isTracking: false,
        coordinates: [],
        totalDistance: 0,
        currentSpeed: 0,
        startTime: null,
        error: null,
    });

    const watchIdRef = useRef<number | null>(null);
    const lastPositionRef = useRef<Coordinate | null>(null);

    const startTracking = useCallback(() => {
        if (!navigator.geolocation) {
            setState(prev => ({ ...prev, error: 'GPS bu cihazda desteklenmiyor' }));
            return;
        }

        setState(prev => ({
            ...prev,
            isTracking: true,
            coordinates: [],
            totalDistance: 0,
            currentSpeed: 0,
            startTime: new Date(),
            error: null,
        }));

        lastPositionRef.current = null;

        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                const newCoord: Coordinate = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    timestamp: Date.now(),
                };

                setState(prev => {
                    let newDistance = prev.totalDistance;
                    let speed = position.coords.speed ? position.coords.speed * 3.6 : 0; // m/s to km/h

                    // Calculate distance from last position
                    if (lastPositionRef.current) {
                        const dist = calculateDistance(
                            lastPositionRef.current.lat,
                            lastPositionRef.current.lng,
                            newCoord.lat,
                            newCoord.lng
                        );
                        // Only add distance if movement is significant (> 5 meters)
                        if (dist > 0.005) {
                            newDistance += dist;
                            lastPositionRef.current = newCoord;
                        }
                    } else {
                        lastPositionRef.current = newCoord;
                    }

                    return {
                        ...prev,
                        coordinates: [...prev.coordinates, newCoord],
                        totalDistance: newDistance,
                        currentSpeed: speed,
                        error: null,
                    };
                });
            },
            (error) => {
                let errorMessage = 'Konum alınamadı';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Konum izni reddedildi. Lütfen ayarlardan izin verin.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Konum bilgisi alınamıyor';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Konum isteği zaman aşımına uğradı';
                        break;
                }
                setState(prev => ({ ...prev, error: errorMessage }));
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 5000,
            }
        );
    }, []);

    const stopTracking = useCallback((): { coordinates: Coordinate[], totalDistance: number, startTime: Date | null } => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }

        const result = {
            coordinates: state.coordinates,
            totalDistance: state.totalDistance,
            startTime: state.startTime,
        };

        setState(prev => ({
            ...prev,
            isTracking: false,
        }));

        return result;
    }, [state.coordinates, state.totalDistance, state.startTime]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, []);

    // Calculate fuel and cost
    const calculateFuel = useCallback((consumptionPer100km: number, fuelPrice: number) => {
        const fuelUsed = (state.totalDistance / 100) * consumptionPer100km;
        const fuelCost = fuelUsed * fuelPrice;
        return { fuelUsed, fuelCost };
    }, [state.totalDistance]);

    return {
        ...state,
        startTracking,
        stopTracking,
        calculateFuel,
    };
}

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
    isPaused: boolean;
    coordinates: Coordinate[];
    totalDistance: number;
    currentSpeed: number;
    startTime: Date | null;
    pausedTime: number; // Total time spent paused in ms
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
        isPaused: false,
        coordinates: [],
        totalDistance: 0,
        currentSpeed: 0,
        startTime: null,
        pausedTime: 0,
        error: null,
    });

    const watchIdRef = useRef<number | null>(null);
    const lastPositionRef = useRef<Coordinate | null>(null);
    const pauseStartRef = useRef<number | null>(null);

    const startTracking = useCallback(() => {
        if (!navigator.geolocation) {
            setState(prev => ({ ...prev, error: 'GPS bu cihazda desteklenmiyor' }));
            return;
        }

        setState(prev => ({
            ...prev,
            isTracking: true,
            isPaused: false,
            coordinates: [],
            totalDistance: 0,
            currentSpeed: 0,
            startTime: new Date(),
            pausedTime: 0,
            error: null,
        }));

        lastPositionRef.current = null;
        pauseStartRef.current = null;

        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                setState(prev => {
                    // Don't update if paused
                    if (prev.isPaused) return prev;

                    const newCoord: Coordinate = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        timestamp: Date.now(),
                    };

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

    const pauseTracking = useCallback(() => {
        pauseStartRef.current = Date.now();
        setState(prev => ({
            ...prev,
            isPaused: true,
            currentSpeed: 0,
        }));
    }, []);

    const resumeTracking = useCallback(() => {
        if (pauseStartRef.current) {
            const pauseDuration = Date.now() - pauseStartRef.current;
            setState(prev => ({
                ...prev,
                isPaused: false,
                pausedTime: prev.pausedTime + pauseDuration,
            }));
            pauseStartRef.current = null;
        } else {
            setState(prev => ({
                ...prev,
                isPaused: false,
            }));
        }
    }, []);

    const finishTracking = useCallback((): {
        coordinates: Coordinate[],
        totalDistance: number,
        startTime: Date | null,
        endTime: Date,
        duration: number // in minutes, excluding paused time
    } => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }

        const endTime = new Date();
        let totalPausedTime = state.pausedTime;
        if (pauseStartRef.current) {
            totalPausedTime += Date.now() - pauseStartRef.current;
        }

        const totalTime = state.startTime ? endTime.getTime() - state.startTime.getTime() : 0;
        const activeTime = totalTime - totalPausedTime;
        const durationMinutes = Math.max(0, activeTime / 1000 / 60);

        const result = {
            coordinates: state.coordinates,
            totalDistance: state.totalDistance,
            startTime: state.startTime,
            endTime,
            duration: durationMinutes,
        };

        setState({
            isTracking: false,
            isPaused: false,
            coordinates: [],
            totalDistance: 0,
            currentSpeed: 0,
            startTime: null,
            pausedTime: 0,
            error: null,
        });

        return result;
    }, [state.coordinates, state.totalDistance, state.startTime, state.pausedTime]);

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

    // Get elapsed time in minutes (excluding paused time)
    const getElapsedTime = useCallback(() => {
        if (!state.startTime) return 0;

        let totalPausedTime = state.pausedTime;
        if (state.isPaused && pauseStartRef.current) {
            totalPausedTime += Date.now() - pauseStartRef.current;
        }

        const elapsed = Date.now() - state.startTime.getTime() - totalPausedTime;
        return Math.max(0, elapsed / 1000 / 60); // minutes
    }, [state.startTime, state.pausedTime, state.isPaused]);

    return {
        ...state,
        startTracking,
        pauseTracking,
        resumeTracking,
        finishTracking,
        calculateFuel,
        getElapsedTime,
    };
}

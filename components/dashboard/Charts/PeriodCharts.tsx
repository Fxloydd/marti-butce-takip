'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';

type TimePeriod = 'daily' | 'weekly' | 'monthly';

interface PeriodData {
    label: string;
    earnings: number;
    cash: number;
    iban: number;
}

interface PeriodChartsProps {
    dailyData: PeriodData[];
    weeklyData: PeriodData[];
    monthlyData: PeriodData[];
}

const PERIODS: { key: TimePeriod; label: string }[] = [
    { key: 'daily', label: 'Günlük' },
    { key: 'weekly', label: 'Haftalık' },
    { key: 'monthly', label: 'Aylık' },
];

export function PeriodCharts({ dailyData, weeklyData, monthlyData }: PeriodChartsProps) {
    const [activePeriod, setActivePeriod] = useState<TimePeriod>('daily');
    const containerRef = useRef<HTMLDivElement>(null);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    const minSwipeDistance = 50;

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        const currentIndex = PERIODS.findIndex(p => p.key === activePeriod);

        if (isLeftSwipe && currentIndex < PERIODS.length - 1) {
            setActivePeriod(PERIODS[currentIndex + 1].key);
        }
        if (isRightSwipe && currentIndex > 0) {
            setActivePeriod(PERIODS[currentIndex - 1].key);
        }
    };

    const getData = () => {
        switch (activePeriod) {
            case 'daily': return dailyData;
            case 'weekly': return weeklyData;
            case 'monthly': return monthlyData;
        }
    };

    const getTotal = () => {
        const data = getData();
        return data.reduce((sum, d) => sum + d.earnings, 0);
    };

    const data = getData();
    const total = getTotal();

    const goToPrevious = () => {
        const currentIndex = PERIODS.findIndex(p => p.key === activePeriod);
        if (currentIndex > 0) {
            setActivePeriod(PERIODS[currentIndex - 1].key);
        }
    };

    const goToNext = () => {
        const currentIndex = PERIODS.findIndex(p => p.key === activePeriod);
        if (currentIndex < PERIODS.length - 1) {
            setActivePeriod(PERIODS[currentIndex + 1].key);
        }
    };

    const currentIndex = PERIODS.findIndex(p => p.key === activePeriod);
    const canGoPrevious = currentIndex > 0;
    const canGoNext = currentIndex < PERIODS.length - 1;

    return (
        <Card className="mx-4">
            {/* Header with tabs (desktop) and swipe indicator (mobile) */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                        <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Kazanç Grafiği</p>
                        <p className="text-lg font-bold text-zinc-900 dark:text-white">{formatCurrency(total)}</p>
                    </div>
                </div>

                {/* Navigation arrows for mobile */}
                <div className="flex items-center gap-2 md:hidden">
                    <button
                        onClick={goToPrevious}
                        disabled={!canGoPrevious}
                        className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 disabled:opacity-30"
                    >
                        <ChevronLeft className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                    </button>
                    <span className="text-sm font-medium text-zinc-900 dark:text-white min-w-[60px] text-center">
                        {PERIODS.find(p => p.key === activePeriod)?.label}
                    </span>
                    <button
                        onClick={goToNext}
                        disabled={!canGoNext}
                        className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 disabled:opacity-30"
                    >
                        <ChevronRight className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                    </button>
                </div>

                {/* Tabs for desktop */}
                <div className="hidden md:flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1">
                    {PERIODS.map((period) => (
                        <button
                            key={period.key}
                            onClick={() => setActivePeriod(period.key)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activePeriod === period.key
                                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                                }`}
                        >
                            {period.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart with touch gestures */}
            <div
                ref={containerRef}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                className="h-[200px] -mx-2"
            >
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#8b5cf6" />
                                <stop offset="100%" stopColor="#6366f1" />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="label"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#71717a', fontSize: 11 }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#71717a', fontSize: 11 }}
                            tickFormatter={(value) => `₺${value}`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(24, 24, 27, 0.9)',
                                border: 'none',
                                borderRadius: '12px',
                                padding: '8px 12px',
                            }}
                            labelStyle={{ color: '#a1a1aa', fontSize: 12 }}
                            itemStyle={{ color: '#fff', fontSize: 14 }}
                            formatter={(value: number) => [`₺${value}`, 'Kazanç']}
                        />
                        <Bar
                            dataKey="earnings"
                            fill="url(#barGradient)"
                            radius={[6, 6, 0, 0]}
                            maxBarSize={40}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Swipe indicator for mobile */}
            <div className="flex justify-center gap-2 mt-4 md:hidden">
                {PERIODS.map((period) => (
                    <div
                        key={period.key}
                        className={`h-1.5 rounded-full transition-all ${activePeriod === period.key
                            ? 'w-6 bg-indigo-500'
                            : 'w-1.5 bg-zinc-300 dark:bg-zinc-700'
                            }`}
                    />
                ))}
            </div>
        </Card>
    );
}

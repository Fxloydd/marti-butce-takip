'use client';

import { Card } from '@/components/ui/Card';
import { TrendingUp, TrendingDown, Minus, Calendar, DollarSign, Users, Target } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface AnalyticsData {
    todayTotal: number;
    yesterdayTotal: number;
    weekTotal: number;
    lastWeekTotal: number;
    avgPerPassenger: number;
    totalPassengers: number;
    goalProgress: number;
}

interface AnalyticsCardProps {
    data: AnalyticsData;
}

function TrendIndicator({ current, previous }: { current: number; previous: number }) {
    if (previous === 0) return null;

    const percentChange = ((current - previous) / previous) * 100;
    const isUp = percentChange > 0;
    const isFlat = Math.abs(percentChange) < 1;

    if (isFlat) {
        return (
            <span className="flex items-center gap-1 text-xs text-zinc-500">
                <Minus className="w-3 h-3" />
                Sabit
            </span>
        );
    }

    return (
        <span className={`flex items-center gap-1 text-xs ${isUp ? 'text-green-500' : 'text-red-500'}`}>
            {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {isUp ? '+' : ''}{percentChange.toFixed(1)}%
        </span>
    );
}

export function AnalyticsCard({ data }: AnalyticsCardProps) {
    return (
        <Card className="mx-4">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                    <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="font-semibold text-zinc-900 dark:text-white">İstatistikler</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Today vs Yesterday */}
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                    <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-zinc-400" />
                        <span className="text-xs text-zinc-500">Bugün</span>
                    </div>
                    <p className="text-lg font-bold text-zinc-900 dark:text-white">
                        {formatCurrency(data.todayTotal)}
                    </p>
                    <TrendIndicator current={data.todayTotal} previous={data.yesterdayTotal} />
                </div>

                {/* Week vs Last Week */}
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                    <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-zinc-400" />
                        <span className="text-xs text-zinc-500">Bu Hafta</span>
                    </div>
                    <p className="text-lg font-bold text-zinc-900 dark:text-white">
                        {formatCurrency(data.weekTotal)}
                    </p>
                    <TrendIndicator current={data.weekTotal} previous={data.lastWeekTotal} />
                </div>

                {/* Avg per passenger */}
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                    <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="w-4 h-4 text-zinc-400" />
                        <span className="text-xs text-zinc-500">Ortalama</span>
                    </div>
                    <p className="text-lg font-bold text-zinc-900 dark:text-white">
                        {formatCurrency(data.avgPerPassenger)}
                    </p>
                    <span className="text-xs text-zinc-500">/ yolcu</span>
                </div>

                {/* Total passengers */}
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                    <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-zinc-400" />
                        <span className="text-xs text-zinc-500">Yolcu</span>
                    </div>
                    <p className="text-lg font-bold text-zinc-900 dark:text-white">
                        {data.totalPassengers}
                    </p>
                    <span className="text-xs text-zinc-500">bugün</span>
                </div>
            </div>

            {/* Goal Progress Bar */}
            <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-indigo-500" />
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Hedef İlerlemesi
                        </span>
                    </div>
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                        %{Math.min(data.goalProgress, 100).toFixed(0)}
                    </span>
                </div>
                <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
                        style={{ width: `${Math.min(data.goalProgress, 100)}%` }}
                    />
                </div>
            </div>
        </Card>
    );
}

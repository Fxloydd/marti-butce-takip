'use client';

import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatCurrency, calculatePercentage } from '@/lib/utils';
import { Target, TrendingUp, TrendingDown, Edit3, Calendar } from 'lucide-react';

interface GoalData {
    target: number;
    current: number;
}

interface GoalCardProps {
    dailyGoal: GoalData;
    weeklyGoal: GoalData;
    onEditClick?: () => void;
    isPersonalView?: boolean;
}

export function GoalCard({ dailyGoal, weeklyGoal, onEditClick, isPersonalView = false }: GoalCardProps) {
    const dailyPercentage = calculatePercentage(dailyGoal.current, dailyGoal.target);
    const weeklyPercentage = calculatePercentage(weeklyGoal.current, weeklyGoal.target);
    const dailyRemaining = Math.max(dailyGoal.target - dailyGoal.current, 0);
    const weeklyRemaining = Math.max(weeklyGoal.target - weeklyGoal.current, 0);
    const isDailyAchieved = dailyPercentage >= 100;
    const isWeeklyAchieved = weeklyPercentage >= 100;

    return (
        <div className="mx-4 space-y-4">
            {/* Daily Goal Card */}
            <Card gradient>
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-xl ${isDailyAchieved
                                ? 'bg-green-100 dark:bg-green-900/30'
                                : 'bg-indigo-100 dark:bg-indigo-900/30'
                            }`}>
                            <Target className={`w-5 h-5 ${isDailyAchieved
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-indigo-600 dark:text-indigo-400'
                                }`} />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                {isPersonalView ? 'Günlük Hedefim' : 'Günlük Hedef'}
                            </h3>
                            <p className="text-xl font-bold text-zinc-900 dark:text-white">
                                {formatCurrency(dailyGoal.target)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Edit Button - Only in combined view */}
                        {onEditClick && !isPersonalView && (
                            <button
                                onClick={onEditClick}
                                className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                            >
                                <Edit3 className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                            </button>
                        )}

                        {/* Percentage Badge */}
                        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${isDailyAchieved
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                            }`}>
                            {isDailyAchieved ? (
                                <TrendingUp className="w-4 h-4" />
                            ) : (
                                <TrendingDown className="w-4 h-4" />
                            )}
                            %{dailyPercentage}
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <ProgressBar value={dailyGoal.current} max={dailyGoal.target} size="lg" />

                {/* Stats Row */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Mevcut</p>
                        <p className="text-lg font-bold text-zinc-900 dark:text-white">
                            {formatCurrency(dailyGoal.current)}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {isDailyAchieved ? 'Aşıldı' : 'Kalan'}
                        </p>
                        <p className={`text-lg font-bold ${isDailyAchieved
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-amber-600 dark:text-amber-400'
                            }`}>
                            {isDailyAchieved ? '+' : ''}{formatCurrency(isDailyAchieved ? dailyGoal.current - dailyGoal.target : dailyRemaining)}
                        </p>
                    </div>
                </div>
            </Card>

            {/* Weekly Goal Card */}
            <Card>
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-xl ${isWeeklyAchieved
                                ? 'bg-green-100 dark:bg-green-900/30'
                                : 'bg-purple-100 dark:bg-purple-900/30'
                            }`}>
                            <Calendar className={`w-5 h-5 ${isWeeklyAchieved
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-purple-600 dark:text-purple-400'
                                }`} />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                {isPersonalView ? 'Haftalık Hedefim' : 'Haftalık Hedef'}
                            </h3>
                            <p className="text-lg font-bold text-zinc-900 dark:text-white">
                                {formatCurrency(weeklyGoal.target)}
                            </p>
                        </div>
                    </div>

                    {/* Percentage Badge */}
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${isWeeklyAchieved
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                        }`}>
                        %{weeklyPercentage}
                    </div>
                </div>

                {/* Progress Bar */}
                <ProgressBar value={weeklyGoal.current} max={weeklyGoal.target} size="md" />

                {/* Stats Row */}
                <div className="flex items-center justify-between mt-3 text-sm">
                    <span className="text-zinc-500 dark:text-zinc-400">
                        Mevcut: <span className="font-medium text-zinc-900 dark:text-white">{formatCurrency(weeklyGoal.current)}</span>
                    </span>
                    <span className={`font-medium ${isWeeklyAchieved
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}>
                        {isWeeklyAchieved ? '+' : ''}{formatCurrency(isWeeklyAchieved ? weeklyGoal.current - weeklyGoal.target : weeklyRemaining)} {isWeeklyAchieved ? 'aşıldı' : 'kalan'}
                    </span>
                </div>
            </Card>
        </div>
    );
}

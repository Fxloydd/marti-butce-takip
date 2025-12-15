'use client';

import { cn } from '@/lib/utils';

interface ProgressBarProps {
    value: number;
    max?: number;
    className?: string;
    showLabel?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export function ProgressBar({
    value,
    max = 100,
    className,
    showLabel = false,
    size = 'md'
}: ProgressBarProps) {
    const percentage = Math.min(Math.round((value / max) * 100), 100);

    const sizeClasses = {
        sm: 'h-2',
        md: 'h-3',
        lg: 'h-4',
    };

    return (
        <div className={cn('w-full', className)}>
            <div className={cn(
                'w-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden',
                sizeClasses[size]
            )}>
                <div
                    className={cn(
                        'h-full rounded-full transition-all duration-500 ease-out',
                        'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'
                    )}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            {showLabel && (
                <div className="flex justify-between mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    <span>{value.toLocaleString('tr-TR')}</span>
                    <span>{max.toLocaleString('tr-TR')}</span>
                </div>
            )}
        </div>
    );
}

'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={cn(
                'animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800',
                className
            )}
        />
    );
}

export function CardSkeleton() {
    return (
        <div className="rounded-2xl p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-8 w-32" />
        </div>
    );
}

export function ChartSkeleton() {
    return (
        <div className="rounded-2xl p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <Skeleton className="h-4 w-32 mb-4" />
            <Skeleton className="h-48 w-full rounded-xl" />
        </div>
    );
}

export function ListSkeleton() {
    return (
        <div className="rounded-2xl p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <Skeleton className="h-4 w-32 mb-4" />
            <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1">
                            <Skeleton className="h-4 w-full mb-2" />
                            <Skeleton className="h-3 w-2/3" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

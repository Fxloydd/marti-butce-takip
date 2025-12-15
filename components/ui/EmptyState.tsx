'use client';

import { cn } from '@/lib/utils';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    className?: string;
}

export function EmptyState({
    icon: Icon = Inbox,
    title,
    description,
    className
}: EmptyStateProps) {
    return (
        <div className={cn(
            'flex flex-col items-center justify-center py-12 px-4 text-center',
            className
        )}>
            <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                <Icon className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
            </div>
            <h3 className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                {title}
            </h3>
            {description && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs">
                    {description}
                </p>
            )}
        </div>
    );
}

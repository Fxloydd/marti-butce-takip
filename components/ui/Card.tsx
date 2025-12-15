'use client';

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    gradient?: boolean;
}

export function Card({ children, className, onClick, gradient }: CardProps) {
    return (
        <div
            onClick={onClick}
            className={cn(
                'rounded-2xl p-4 transition-all duration-200',
                'bg-white dark:bg-zinc-900',
                'border border-zinc-200 dark:border-zinc-800',
                'shadow-sm hover:shadow-md',
                gradient && 'bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20',
                onClick && 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]',
                className
            )}
        >
            {children}
        </div>
    );
}

interface CardHeaderProps {
    children: ReactNode;
    className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
    return (
        <div className={cn('flex items-center justify-between mb-3', className)}>
            {children}
        </div>
    );
}

interface CardTitleProps {
    children: ReactNode;
    className?: string;
}

export function CardTitle({ children, className }: CardTitleProps) {
    return (
        <h3 className={cn('text-sm font-medium text-zinc-500 dark:text-zinc-400', className)}>
            {children}
        </h3>
    );
}

interface CardValueProps {
    children: ReactNode;
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function CardValue({ children, className, size = 'lg' }: CardValueProps) {
    const sizeClasses = {
        sm: 'text-lg',
        md: 'text-xl',
        lg: 'text-2xl',
        xl: 'text-3xl',
    };

    return (
        <p className={cn('font-bold text-zinc-900 dark:text-white', sizeClasses[size], className)}>
            {children}
        </p>
    );
}

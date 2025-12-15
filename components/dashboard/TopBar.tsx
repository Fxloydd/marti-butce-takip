'use client';

import { formatDate } from '@/lib/utils';
import { RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { UserSelector } from './UserSelector';

interface TopBarProps {
    currentView: 'personal' | 'combined';
    currentUserName: string;
    onViewChange: (view: 'personal' | 'combined') => void;
    onRefresh: () => void;
    isLoading?: boolean;
}

export function TopBar({ currentView, currentUserName, onViewChange, onRefresh, isLoading }: TopBarProps) {
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = () => {
        setIsRefreshing(true);
        onRefresh();
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    return (
        <div className="sticky top-0 z-50 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-lg border-b border-zinc-200 dark:border-zinc-800">
            <div className="px-4 py-3 flex items-center justify-between">
                {/* Date */}
                <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                        Bugün
                    </p>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        {formatDate(new Date())}
                    </p>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-3">
                    {/* User Selector */}
                    <UserSelector
                        currentView={currentView}
                        currentUserName={currentUserName}
                        onViewChange={onViewChange}
                    />

                    {/* Refresh Button */}
                    <button
                        onClick={handleRefresh}
                        disabled={isLoading || isRefreshing}
                        className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw
                            className={`w-5 h-5 text-zinc-600 dark:text-zinc-400 ${isRefreshing ? 'animate-spin' : ''
                                }`}
                        />
                    </button>
                </div>
            </div>
        </div>
    );
}

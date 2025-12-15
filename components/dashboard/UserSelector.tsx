'use client';

import { useState } from 'react';
import { User, Users, ChevronDown } from 'lucide-react';

interface UserSelectorProps {
    currentView: 'personal' | 'combined';
    currentUserName: string; // Logged in user's display name
    onViewChange: (view: 'personal' | 'combined') => void;
}

export function UserSelector({ currentView, currentUserName, onViewChange }: UserSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);

    const isPersonal = currentView === 'personal';

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${!isPersonal
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                        : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
                    }`}
            >
                {!isPersonal ? (
                    <Users className="w-4 h-4" />
                ) : (
                    <User className="w-4 h-4" />
                )}
                <span className="text-sm">{isPersonal ? currentUserName : 'Tüm Ekip'}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Menu */}
                    <div className="absolute top-full right-0 mt-2 w-56 py-2 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 z-50 animate-fade-in">
                        {/* Personal View Option */}
                        <button
                            onClick={() => {
                                onViewChange('personal');
                                setIsOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${isPersonal
                                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400'
                                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                                }`}
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isPersonal
                                    ? 'bg-indigo-500 text-white'
                                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                                }`}>
                                {currentUserName.charAt(0)}
                            </div>
                            <div>
                                <p className="font-medium">{currentUserName}</p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">Kişisel görünüm</p>
                            </div>
                        </button>

                        <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-2" />

                        {/* Combined View Option */}
                        <button
                            onClick={() => {
                                onViewChange('combined');
                                setIsOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${!isPersonal
                                    ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
                                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                                }`}
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${!isPersonal
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                                }`}>
                                <Users className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="font-medium">Tüm Ekip</p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">Toplu görünüm</p>
                            </div>
                        </button>
                    </div>
                </>
            )}

            <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.15s ease-out;
        }
      `}</style>
        </div>
    );
}

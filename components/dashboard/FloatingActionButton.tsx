'use client';

import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
    onClick: () => void;
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all z-40 flex items-center justify-center"
            aria-label="Yolcu Ekle"
        >
            <Plus className="w-7 h-7" />
        </button>
    );
}

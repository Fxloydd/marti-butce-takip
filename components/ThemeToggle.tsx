'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
    const [isDark, setIsDark] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Always start with dark mode
        document.documentElement.classList.add('dark');
        setIsDark(true);
    }, []);

    const toggleTheme = () => {
        const newIsDark = !isDark;
        setIsDark(newIsDark);

        if (newIsDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    // Don't render until mounted to avoid hydration mismatch
    if (!mounted) {
        return (
            <div className="fixed bottom-4 right-4 p-3 rounded-full bg-zinc-800 shadow-lg z-50">
                <Sun className="w-5 h-5 text-amber-500" />
            </div>
        );
    }

    return (
        <button
            onClick={toggleTheme}
            className="fixed bottom-4 right-4 p-3 rounded-full bg-zinc-100 dark:bg-zinc-800 shadow-lg hover:scale-105 active:scale-95 transition-transform z-50"
            aria-label="Toggle theme"
        >
            {isDark ? (
                <Sun className="w-5 h-5 text-amber-500" />
            ) : (
                <Moon className="w-5 h-5 text-indigo-500" />
            )}
        </button>
    );
}

'use client';

import { useState } from 'react';
import { X, Target } from 'lucide-react';

interface EditGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentGoal: number;
    onSave: (newGoal: number) => void;
}

export function EditGoalModal({ isOpen, onClose, currentGoal, onSave }: EditGoalModalProps) {
    const [goal, setGoal] = useState(currentGoal.toString());

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newGoal = parseFloat(goal);
        if (newGoal > 0) {
            onSave(newGoal);
            onClose();
        }
    };

    const presetGoals = [2000, 2500, 3000, 3500, 4000, 5000];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-sm mx-4 bg-white dark:bg-zinc-900 rounded-3xl p-6 animate-scale-in">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                            <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                            Günlük Hedef
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    >
                        <X className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Goal Input */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                            Hedef Tutar (₺)
                        </label>
                        <input
                            type="number"
                            inputMode="decimal"
                            pattern="[0-9]*"
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            placeholder="0"
                            className="w-full px-4 py-4 text-3xl font-bold text-center rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                    </div>

                    {/* Preset Goals */}
                    <div>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">Hızlı Seçim</p>
                        <div className="grid grid-cols-3 gap-2">
                            {presetGoals.map((preset) => (
                                <button
                                    key={preset}
                                    type="button"
                                    onClick={() => setGoal(preset.toString())}
                                    className={`px-3 py-2 text-sm font-medium rounded-xl transition-all ${goal === preset.toString()
                                        ? 'bg-indigo-500 text-white'
                                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30'
                                        }`}
                                >
                                    ₺{preset.toLocaleString('tr-TR')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-lg hover:opacity-90 active:scale-[0.98] transition-all"
                    >
                        Kaydet
                    </button>
                </form>
            </div>

            <style jsx>{`
        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
        </div>
    );
}

'use client';

import { Card } from '@/components/ui/Card';
import { PaymentTypeData } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Wallet, CreditCard } from 'lucide-react';

interface PaymentTypeChartProps {
    data: PaymentTypeData[];
}

export function PaymentTypeChart({ data }: PaymentTypeChartProps) {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const cashData = data.find(d => d.name === 'Nakit') || { name: 'Nakit', value: 0, color: '#22c55e' };
    const ibanData = data.find(d => d.name === 'IBAN') || { name: 'IBAN', value: 0, color: '#6366f1' };

    const cashPercentage = total > 0 ? Math.round((cashData.value / total) * 100) : 0;
    const ibanPercentage = total > 0 ? Math.round((ibanData.value / total) * 100) : 0;

    return (
        <Card className="mx-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Ödeme Türü</h3>
                <span className="text-sm font-bold text-zinc-900 dark:text-white">{formatCurrency(total)}</span>
            </div>

            {/* Progress Bar */}
            <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
                {cashPercentage > 0 && (
                    <div
                        className="h-full bg-green-500 transition-all duration-500"
                        style={{ width: `${cashPercentage}%` }}
                    />
                )}
                {ibanPercentage > 0 && (
                    <div
                        className="h-full bg-indigo-500 transition-all duration-500"
                        style={{ width: `${ibanPercentage}%` }}
                    />
                )}
            </div>

            {/* Legend - Compact */}
            <div className="flex items-center justify-between mt-3 gap-4">
                {/* Cash */}
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30">
                        <Wallet className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Nakit</p>
                        <p className="text-sm font-bold text-zinc-900 dark:text-white">
                            {formatCurrency(cashData.value)} <span className="text-xs font-normal text-zinc-400">%{cashPercentage}</span>
                        </p>
                    </div>
                </div>

                {/* IBAN */}
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                        <CreditCard className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">IBAN</p>
                        <p className="text-sm font-bold text-zinc-900 dark:text-white">
                            {formatCurrency(ibanData.value)} <span className="text-xs font-normal text-zinc-400">%{ibanPercentage}</span>
                        </p>
                    </div>
                </div>
            </div>
        </Card>
    );
}

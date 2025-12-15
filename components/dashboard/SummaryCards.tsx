'use client';

import { Card, CardTitle, CardValue } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import { UserEarnings } from '@/types';
import { TrendingUp, Wallet, CreditCard, Users } from 'lucide-react';

interface SummaryCardsProps {
    totalEarnings: number;
    cashTotal: number;
    ibanTotal: number;
    userEarnings: UserEarnings[];
    isPersonalView?: boolean;
}

export function SummaryCards({
    totalEarnings,
    cashTotal,
    ibanTotal,
    userEarnings,
    isPersonalView = false
}: SummaryCardsProps) {
    return (
        <div className="px-4 -mx-4 overflow-x-auto scrollbar-hide">
            <div className="flex gap-3 px-4 pb-2" style={{ width: 'max-content' }}>
                {/* Total Earnings Card */}
                <Card className="min-w-[160px] bg-gradient-to-br from-indigo-500 to-purple-600 border-0 text-white">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 rounded-lg bg-white/20">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-medium text-white/80">
                            {isPersonalView ? 'Kazancım' : 'Toplam'}
                        </span>
                    </div>
                    <CardValue className="text-white" size="xl">
                        {formatCurrency(totalEarnings)}
                    </CardValue>
                </Card>

                {/* Cash Card */}
                <Card className="min-w-[140px]">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30">
                            <Wallet className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Nakit</span>
                    </div>
                    <CardValue size="md" className="text-green-600 dark:text-green-400">
                        {formatCurrency(cashTotal)}
                    </CardValue>
                </Card>

                {/* IBAN Card */}
                <Card className="min-w-[140px]">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                            <CreditCard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">IBAN</span>
                    </div>
                    <CardValue size="md" className="text-indigo-600 dark:text-indigo-400">
                        {formatCurrency(ibanTotal)}
                    </CardValue>
                </Card>

                {/* User Cards - Only show in combined view */}
                {!isPersonalView && userEarnings.map((user) => (
                    <Card key={user.user} className="min-w-[140px]">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                                <Users className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            </div>
                            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{user.user}</span>
                        </div>
                        <CardValue size="md">
                            {formatCurrency(user.total)}
                        </CardValue>
                        <div className="flex gap-2 mt-1 text-xs">
                            <span className="text-green-600 dark:text-green-400">₺{user.cash}</span>
                            <span className="text-zinc-400">/</span>
                            <span className="text-indigo-600 dark:text-indigo-400">₺{user.iban}</span>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}

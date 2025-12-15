'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { EditPaymentModal } from './EditPaymentModal';
import { Payment, PaymentType } from '@/types';
import { formatCurrency, formatTime } from '@/lib/utils';
import { MapPin, Clock, Wallet, CreditCard, User, Car, Edit2 } from 'lucide-react';

interface RecentPassengersProps {
    payments: Payment[];
    limit?: number;
    onEdit?: (id: string, data: { amount: number; paymentType: PaymentType; location: string }) => void;
    onDelete?: (id: string) => void;
}

export function RecentPassengers({ payments, limit = 5, onEdit, onDelete }: RecentPassengersProps) {
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const recentPayments = payments.slice(0, limit);

    const handleSave = (id: string, data: { amount: number; paymentType: PaymentType; location: string }) => {
        if (onEdit) {
            onEdit(id, data);
        }
    };

    const handleDelete = (id: string) => {
        if (onDelete) {
            onDelete(id);
        }
    };

    if (recentPayments.length === 0) {
        return (
            <Card className="mx-4">
                <CardHeader>
                    <CardTitle>Son Yolcular</CardTitle>
                </CardHeader>
                <EmptyState
                    icon={Car}
                    title="Henüz kayıt yok"
                    description="Bugün henüz yolcu kaydı bulunmuyor."
                />
            </Card>
        );
    }

    return (
        <>
            <Card className="mx-4">
                <CardHeader>
                    <CardTitle>Son Yolcular</CardTitle>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-full">
                        {payments.length} kayıt
                    </span>
                </CardHeader>

                <div className="space-y-3">
                    {recentPayments.map((payment, index) => (
                        <div
                            key={payment.id}
                            onClick={() => setSelectedPayment(payment)}
                            className={`flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${index === 0 ? 'ring-2 ring-indigo-500/20' : ''
                                }`}
                        >
                            {/* Time */}
                            <div className="flex flex-col items-center min-w-[50px]">
                                <Clock className="w-4 h-4 text-zinc-400 mb-1" />
                                <span className="text-sm font-medium text-zinc-900 dark:text-white">
                                    {formatTime(payment.createdAt)}
                                </span>
                            </div>

                            {/* Divider */}
                            <div className="w-px h-10 bg-zinc-200 dark:bg-zinc-700" />

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-lg font-bold text-zinc-900 dark:text-white">
                                        {formatCurrency(payment.amount)}
                                    </span>
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${payment.paymentType === 'cash'
                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                            : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
                                        }`}>
                                        {payment.paymentType === 'cash' ? (
                                            <>
                                                <Wallet className="w-3 h-3" />
                                                Nakit
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard className="w-3 h-3" />
                                                IBAN
                                            </>
                                        )}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                                    <span className="flex items-center gap-1">
                                        <User className="w-3 h-3" />
                                        {payment.user}
                                    </span>
                                    <span className="flex items-center gap-1 truncate">
                                        <MapPin className="w-3 h-3" />
                                        {payment.location}
                                    </span>
                                </div>
                            </div>

                            {/* Edit Icon */}
                            <div className="p-2 text-zinc-400 hover:text-indigo-500 transition-colors">
                                <Edit2 className="w-4 h-4" />
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Edit Modal */}
            <EditPaymentModal
                isOpen={!!selectedPayment}
                payment={selectedPayment}
                onClose={() => setSelectedPayment(null)}
                onSave={handleSave}
                onDelete={handleDelete}
            />
        </>
    );
}

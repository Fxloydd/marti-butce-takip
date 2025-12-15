'use client';

import { useState, useEffect } from 'react';
import { Payment, PaymentType } from '@/types';
import { X, Save, Trash2, MapPin, Wallet, CreditCard } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface EditPaymentModalProps {
    isOpen: boolean;
    payment: Payment | null;
    onClose: () => void;
    onSave: (id: string, data: { amount: number; paymentType: PaymentType; location: string }) => void;
    onDelete: (id: string) => void;
}

export function EditPaymentModal({ isOpen, payment, onClose, onSave, onDelete }: EditPaymentModalProps) {
    const [amount, setAmount] = useState('');
    const [paymentType, setPaymentType] = useState<PaymentType>('cash');
    const [location, setLocation] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (payment) {
            setAmount(payment.amount.toString());
            setPaymentType(payment.paymentType);
            setLocation(payment.location);
            setIsDeleting(false);
        }
    }, [payment]);

    if (!isOpen || !payment) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) return;

        onSave(payment.id, {
            amount: numAmount,
            paymentType,
            location: location.trim() || 'Bilinmiyor',
        });
        onClose();
    };

    const handleDelete = () => {
        if (isDeleting) {
            onDelete(payment.id);
            onClose();
        } else {
            setIsDeleting(true);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full sm:max-w-md bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl p-6 animate-slide-up sm:mx-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                        Kaydı Düzenle
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    >
                        <X className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                            Tutar (₺)
                        </label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            min="1"
                            step="0.01"
                            required
                        />
                    </div>

                    {/* Payment Type */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                            Ödeme Türü
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setPaymentType('cash')}
                                className={`flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${paymentType === 'cash'
                                        ? 'bg-green-500 text-white'
                                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                                    }`}
                            >
                                <Wallet className="w-5 h-5" />
                                Nakit
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaymentType('iban')}
                                className={`flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${paymentType === 'iban'
                                        ? 'bg-indigo-500 text-white'
                                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                                    }`}
                            >
                                <CreditCard className="w-5 h-5" />
                                IBAN
                            </button>
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                            Konum
                        </label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Konum girin"
                            />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2">
                        {/* Delete Button */}
                        <button
                            type="button"
                            onClick={handleDelete}
                            className={`flex-1 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${isDeleting
                                    ? 'bg-red-500 text-white'
                                    : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                }`}
                        >
                            <Trash2 className="w-5 h-5" />
                            {isDeleting ? 'Emin misin?' : 'Sil'}
                        </button>

                        {/* Save Button */}
                        <button
                            type="submit"
                            className="flex-1 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            <Save className="w-5 h-5" />
                            Kaydet
                        </button>
                    </div>
                </form>
            </div>

            <style jsx>{`
                @keyframes slide-up {
                    from {
                        transform: translateY(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
                .animate-slide-up {
                    animation: slide-up 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}

'use client';

import { useState } from 'react';
import { Payment } from '@/types';
import { X, FileText, Table, Download, Loader2 } from 'lucide-react';
import { generatePDFReport, generateExcelReport } from '@/lib/report-generator';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    payments: Payment[];
}

type ReportPeriod = 'today' | 'week' | 'month';

export function ReportModal({ isOpen, onClose, payments }: ReportModalProps) {
    const [period, setPeriod] = useState<ReportPeriod>('today');
    const [isGenerating, setIsGenerating] = useState(false);

    if (!isOpen) return null;

    const getDateRange = (p: ReportPeriod): string => {
        const now = new Date();
        switch (p) {
            case 'today':
                return now.toLocaleDateString('tr-TR');
            case 'week':
                const weekStart = new Date(now);
                weekStart.setDate(now.getDate() - now.getDay() + 1);
                return `${weekStart.toLocaleDateString('tr-TR')} - ${now.toLocaleDateString('tr-TR')}`;
            case 'month':
                return `${now.toLocaleString('tr-TR', { month: 'long', year: 'numeric' })}`;
        }
    };

    const getTitle = (p: ReportPeriod): string => {
        switch (p) {
            case 'today': return 'Günlük Rapor';
            case 'week': return 'Haftalık Rapor';
            case 'month': return 'Aylık Rapor';
        }
    };

    const handleGeneratePDF = async () => {
        setIsGenerating(true);
        try {
            await generatePDFReport(payments, getTitle(period), getDateRange(period));
        } catch (error) {
            console.error('PDF generation error:', error);
        }
        setIsGenerating(false);
    };

    const handleGenerateExcel = async () => {
        setIsGenerating(true);
        try {
            await generateExcelReport(payments, getTitle(period));
        } catch (error) {
            console.error('Excel generation error:', error);
        }
        setIsGenerating(false);
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
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                            Rapor Oluştur
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    >
                        <X className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                    </button>
                </div>

                {/* Period Selection */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        Dönem Seçin
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {(['today', 'week', 'month'] as ReportPeriod[]).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`py-2 px-3 rounded-xl text-sm font-medium transition-all ${period === p
                                        ? 'bg-indigo-500 text-white'
                                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                                    }`}
                            >
                                {p === 'today' ? 'Bugün' : p === 'week' ? 'Hafta' : 'Ay'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Info */}
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 mb-6">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        <span className="font-medium">{getTitle(period)}</span>
                        <br />
                        <span className="text-xs">{getDateRange(period)}</span>
                        <br />
                        <span className="text-xs">{payments.length} kayıt</span>
                    </p>
                </div>

                {/* Export Buttons */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={handleGeneratePDF}
                        disabled={isGenerating || payments.length === 0}
                        className="flex items-center justify-center gap-2 py-4 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {isGenerating ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <FileText className="w-5 h-5" />
                                PDF
                            </>
                        )}
                    </button>

                    <button
                        onClick={handleGenerateExcel}
                        disabled={isGenerating || payments.length === 0}
                        className="flex items-center justify-center gap-2 py-4 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {isGenerating ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <Table className="w-5 h-5" />
                                Excel
                            </>
                        )}
                    </button>
                </div>

                {payments.length === 0 && (
                    <p className="text-center text-sm text-zinc-500 mt-4">
                        Rapor oluşturmak için kayıt gerekli
                    </p>
                )}
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

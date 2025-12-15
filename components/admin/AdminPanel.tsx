'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { X, Shield, Trash2, Users, AlertCircle } from 'lucide-react';

interface AdminPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
    const { user, users, allUsers, deleteUserAsAdmin } = useAuth();
    const [deletePassword, setDeletePassword] = useState('');
    const [userToDelete, setUserToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen || !user) return null;

    const handleDeleteUser = async (username: string) => {
        if (!deletePassword) {
            setError('Admin şifrenizi girin');
            return;
        }

        setIsDeleting(true);
        setError('');

        const result = await deleteUserAsAdmin(username, deletePassword);

        if (result.success) {
            setUserToDelete(null);
            setDeletePassword('');
        } else {
            setError(result.error || 'Silme işlemi başarısız');
        }

        setIsDeleting(false);
    };

    const handleClearAllData = () => {
        if (confirm('TÜM VERİLER SİLİNECEK! Emin misiniz?')) {
            localStorage.clear();
            window.location.reload();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-zinc-900 rounded-3xl p-6 animate-scale-in max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/30">
                            <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                            Admin Paneli
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    >
                        <X className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 mb-4">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm">{error}</span>
                    </div>
                )}

                {/* Users List */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <Users className="w-4 h-4 text-zinc-500" />
                        <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                            Kayıtlı Kullanıcılar ({allUsers?.length || 0})
                        </h3>
                    </div>

                    {allUsers && allUsers.length > 0 ? (
                        <div className="space-y-2">
                            {allUsers.map((u) => (
                                <div
                                    key={u.username}
                                    className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                                            {u.displayName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-zinc-900 dark:text-white">
                                                {u.displayName}
                                            </p>
                                            <p className="text-xs text-zinc-500">@{u.username}</p>
                                        </div>
                                    </div>

                                    {userToDelete === u.username ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="password"
                                                value={deletePassword}
                                                onChange={(e) => setDeletePassword(e.target.value)}
                                                placeholder="Şifreniz"
                                                className="w-24 px-2 py-1 text-sm rounded-lg border border-red-300 dark:border-red-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                                            />
                                            <button
                                                onClick={() => handleDeleteUser(u.username)}
                                                disabled={isDeleting}
                                                className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
                                            >
                                                {isDeleting ? (
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setUserToDelete(null);
                                                    setDeletePassword('');
                                                    setError('');
                                                }}
                                                className="p-2 rounded-lg bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setUserToDelete(u.username)}
                                            className="p-2 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-zinc-500 py-4">Kayıtlı kullanıcı yok</p>
                    )}
                </div>

                {/* Danger Zone */}
                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <button
                        onClick={handleClearAllData}
                        className="w-full py-3 rounded-xl border-2 border-red-500 text-red-500 font-medium hover:bg-red-500 hover:text-white transition-colors"
                    >
                        Tüm Verileri Sil
                    </button>
                    <p className="text-xs text-zinc-500 text-center mt-2">
                        Bu işlem tüm kullanıcıları ve ödeme verilerini siler
                    </p>
                </div>
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

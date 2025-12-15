'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { X, User, Key, Save, AlertCircle, Check, Trash2 } from 'lucide-react';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
    const { user, updateProfile, deleteAccount } = useAuth();
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [username, setUsername] = useState(user?.username || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [deletePassword, setDeletePassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    if (!isOpen || !user) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!displayName.trim()) {
            setError('Görünen isim gerekli');
            return;
        }

        if (!username.trim()) {
            setError('Kullanıcı adı gerekli');
            return;
        }

        if (newPassword && newPassword !== confirmPassword) {
            setError('Yeni şifreler eşleşmiyor');
            return;
        }

        if (newPassword && newPassword.length < 4) {
            setError('Şifre en az 4 karakter olmalı');
            return;
        }

        if (newPassword && !currentPassword) {
            setError('Mevcut şifrenizi girin');
            return;
        }

        setIsLoading(true);

        const result = await updateProfile({
            displayName: displayName.trim(),
            username: username.trim().toLowerCase(),
            currentPassword: currentPassword || undefined,
            newPassword: newPassword || undefined,
        });

        if (result.success) {
            setSuccess('Profil güncellendi');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => {
                onClose();
                setSuccess('');
            }, 1500);
        } else {
            setError(result.error || 'Güncelleme başarısız');
        }

        setIsLoading(false);
    };

    const handleDeleteAccount = async () => {
        if (!deletePassword) {
            setError('Hesabı silmek için şifrenizi girin');
            return;
        }

        setIsDeleting(true);
        setError('');

        const result = await deleteAccount(deletePassword);

        if (!result.success) {
            setError(result.error || 'Hesap silinemedi');
            setIsDeleting(false);
        }
        // If successful, user will be logged out automatically
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md mx-4 bg-white dark:bg-zinc-900 rounded-3xl p-6 animate-scale-in max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                            <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                            Profil Ayarları
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
                    {/* Error/Success Messages */}
                    {error && (
                        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}
                    {success && (
                        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500">
                            <Check className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm">{success}</span>
                        </div>
                    )}

                    {/* Display Name */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                            Görünen İsim
                        </label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                    </div>

                    {/* Username */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                            Kullanıcı Adı
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                    </div>

                    {/* Password Change Divider */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
                        <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                            <Key className="w-4 h-4" />
                            <span className="text-xs font-medium">Şifre Değiştir</span>
                        </div>
                        <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
                    </div>

                    {/* Current Password */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                            Mevcut Şifre
                        </label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Şifre değiştirmek için girin"
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* New Password */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                            Yeni Şifre
                        </label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="En az 4 karakter"
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                            Yeni Şifre (Tekrar)
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Şifreyi tekrar girin"
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Kaydet
                            </>
                        )}
                    </button>
                </form>

                {/* Delete Account Section */}
                <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex-1 h-px bg-red-200 dark:bg-red-900/30" />
                        <div className="flex items-center gap-2 text-red-500 dark:text-red-400">
                            <Trash2 className="w-4 h-4" />
                            <span className="text-xs font-medium">Tehlikeli Bölge</span>
                        </div>
                        <div className="flex-1 h-px bg-red-200 dark:bg-red-900/30" />
                    </div>

                    {!showDeleteConfirm ? (
                        <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(true)}
                            className="w-full py-3 rounded-xl border-2 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                            Hesabımı Sil
                        </button>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-sm text-red-600 dark:text-red-400">
                                ⚠️ Bu işlem geri alınamaz! Tüm verileriniz silinecektir.
                            </p>
                            <input
                                type="password"
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                placeholder="Şifrenizi girin"
                                className="w-full px-4 py-3 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 text-zinc-900 dark:text-white placeholder-red-300 dark:placeholder-red-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowDeleteConfirm(false);
                                        setDeletePassword('');
                                        setError('');
                                    }}
                                    className="flex-1 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                                >
                                    İptal
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDeleteAccount}
                                    disabled={isDeleting}
                                    className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isDeleting ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Trash2 className="w-4 h-4" />
                                            Sil
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
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

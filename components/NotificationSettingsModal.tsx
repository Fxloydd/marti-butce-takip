'use client';

import { useState, useEffect } from 'react';
import { X, Bell, BellOff, Users, Target, Check, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import {
    getNotificationPermission,
    requestNotificationPermission,
    subscribeToPush,
    unsubscribeFromPush,
    getNotificationSettings,
    updateNotificationSettings,
} from '@/lib/notifications';

interface NotificationSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function NotificationSettingsModal({ isOpen, onClose }: NotificationSettingsModalProps) {
    const { user } = useAuth();
    const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [settings, setSettings] = useState({ new_payment: true, goal_reached: true });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen && user) {
            loadSettings();
        }
    }, [isOpen, user]);

    const loadSettings = async () => {
        setIsLoading(true);

        // Check permission
        const perm = getNotificationPermission();
        setPermission(perm);

        // Check if subscribed
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            setIsSubscribed(!!subscription);
        }

        // Load settings from database
        if (user) {
            const dbSettings = await getNotificationSettings(user.id);
            setSettings({
                new_payment: dbSettings.new_payment ?? true,
                goal_reached: dbSettings.goal_reached ?? true,
            });
        }

        setIsLoading(false);
    };

    const handleEnableNotifications = async () => {
        setIsSaving(true);

        const perm = await requestNotificationPermission();
        setPermission(perm);

        if (perm === 'granted' && user) {
            const success = await subscribeToPush(user.id);
            setIsSubscribed(success);
        }

        setIsSaving(false);
    };

    const handleDisableNotifications = async () => {
        setIsSaving(true);

        if (user) {
            await unsubscribeFromPush(user.id);
            setIsSubscribed(false);
        }

        setIsSaving(false);
    };

    const handleSettingChange = async (key: 'new_payment' | 'goal_reached', value: boolean) => {
        if (!user) return;

        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);

        // Save to database
        await updateNotificationSettings(user.id, { [key]: value });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full sm:max-w-md bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-auto">
                {/* Header */}
                <div className="sticky top-0 flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                            <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Bildirim Ayarları</h2>
                            <p className="text-sm text-zinc-500">Bildirimleri özelleştirin</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <X className="w-5 h-5 text-zinc-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                        </div>
                    ) : (
                        <>
                            {/* Permission Status */}
                            <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {isSubscribed ? (
                                            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                                <Bell className="w-5 h-5 text-green-600 dark:text-green-400" />
                                            </div>
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                                                <BellOff className="w-5 h-5 text-zinc-500" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-medium text-zinc-900 dark:text-white">
                                                {isSubscribed ? 'Bildirimler Açık' : 'Bildirimler Kapalı'}
                                            </p>
                                            <p className="text-sm text-zinc-500">
                                                {permission === 'denied'
                                                    ? 'Tarayıcı ayarlarından izin verin'
                                                    : isSubscribed
                                                        ? 'Yeni yolculuklardan haberdar olun'
                                                        : 'Hiçbir bildirim almayacaksınız'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={isSubscribed ? handleDisableNotifications : handleEnableNotifications}
                                        disabled={isSaving || permission === 'denied'}
                                        className={`px-4 py-2 rounded-xl font-medium text-sm transition-colors disabled:opacity-50 ${isSubscribed
                                                ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600'
                                                : 'bg-indigo-500 text-white hover:bg-indigo-600'
                                            }`}
                                    >
                                        {isSaving ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : isSubscribed ? (
                                            'Kapat'
                                        ) : (
                                            'Aç'
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Notification Types */}
                            {isSubscribed && (
                                <div className="space-y-3">
                                    <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                                        Bildirim Türleri
                                    </h3>

                                    {/* New Payment Notifications */}
                                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-zinc-900 dark:text-white">Yeni Yolculuklar</p>
                                                <p className="text-sm text-zinc-500">Ekip üyeleri yolculuk eklediğinde</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleSettingChange('new_payment', !settings.new_payment)}
                                            className={`w-12 h-7 rounded-full transition-colors relative ${settings.new_payment
                                                    ? 'bg-indigo-500'
                                                    : 'bg-zinc-300 dark:bg-zinc-600'
                                                }`}
                                        >
                                            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${settings.new_payment ? 'left-6' : 'left-1'
                                                }`}>
                                                {settings.new_payment && (
                                                    <Check className="w-3 h-3 text-indigo-500 absolute top-1 left-1" />
                                                )}
                                            </div>
                                        </button>
                                    </div>

                                    {/* Goal Reached Notifications */}
                                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                                                <Target className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-zinc-900 dark:text-white">Hedef Bildirimleri</p>
                                                <p className="text-sm text-zinc-500">Günlük/haftalık hedefe ulaşıldığında</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleSettingChange('goal_reached', !settings.goal_reached)}
                                            className={`w-12 h-7 rounded-full transition-colors relative ${settings.goal_reached
                                                    ? 'bg-indigo-500'
                                                    : 'bg-zinc-300 dark:bg-zinc-600'
                                                }`}
                                        >
                                            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${settings.goal_reached ? 'left-6' : 'left-1'
                                                }`}>
                                                {settings.goal_reached && (
                                                    <Check className="w-3 h-3 text-indigo-500 absolute top-1 left-1" />
                                                )}
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
                    <button
                        onClick={onClose}
                        className="w-full py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                        Kapat
                    </button>
                </div>
            </div>
        </div>
    );
}

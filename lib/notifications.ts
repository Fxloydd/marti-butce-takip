// Check if notifications are supported
export function isNotificationSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
}

// Get current permission status
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
    if (!isNotificationSupported()) return 'unsupported';
    return Notification.permission;
}

// Request notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
    if (!isNotificationSupported()) return 'unsupported';

    try {
        const permission = await Notification.requestPermission();
        return permission;
    } catch (error) {
        console.error('Error requesting notification permission:', error);
        return 'denied';
    }
}

// Show a notification
export function showNotification(title: string, options?: NotificationOptions): void {
    if (!isNotificationSupported()) return;
    if (Notification.permission !== 'granted') return;

    // Use service worker for notifications if available
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification(title, {
                icon: '/icons/icon-192.png',
                badge: '/icons/icon-192.png',
                // @ts-ignore
                vibrate: [200, 100, 200],
                ...options,
            });
        });
    } else {
        // Fallback to regular notification
        new Notification(title, {
            icon: '/icons/icon-192.png',
            ...options,
        });
    }
}

// Quick notification helpers
export function notifyPaymentAdded(amount: number, user: string): void {
    showNotification('Yeni Yolcu Eklendi! 🚖', {
        body: `${user} - ₺${amount.toFixed(2)}`,
        tag: 'payment-added',
    });
}

export function notifyGoalReached(goalType: 'daily' | 'weekly'): void {
    const title = goalType === 'daily' ? 'Günlük Hedef Tamamlandı! 🎉' : 'Haftalık Hedef Tamamlandı! 🏆';
    showNotification(title, {
        body: 'Tebrikler, hedefinize ulaştınız!',
        tag: 'goal-reached',
    });
}

export function notifyPaymentDeleted(): void {
    showNotification('Kayıt Silindi', {
        body: 'Yolcu kaydı başarıyla silindi.',
        tag: 'payment-deleted',
    });
}

// Subscribe to push notifications
export async function subscribeToPush(userId: string): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.log('Push notifications not supported');
        return false;
    }

    try {
        const registration = await navigator.serviceWorker.ready;

        // Check existing subscription
        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
            // Create new subscription
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(
                    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
                ) as BufferSource,
            });
        }

        // Save to database
        const { supabase } = await import('./supabase');
        const subJson = subscription.toJSON();

        await supabase.from('push_subscriptions').upsert({
            user_id: userId,
            endpoint: subscription.endpoint,
            keys: JSON.stringify(subJson.keys),
        }, { onConflict: 'user_id' });

        return true;
    } catch (error) {
        console.error('Error subscribing to push:', error);
        return false;
    }
}

// Unsubscribe from push notifications
export async function unsubscribeFromPush(userId: string): Promise<boolean> {
    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (subscription) {
            await subscription.unsubscribe();
        }

        // Remove from database
        const { supabase } = await import('./supabase');
        await supabase.from('push_subscriptions').delete().eq('user_id', userId);

        return true;
    } catch (error) {
        console.error('Error unsubscribing from push:', error);
        return false;
    }
}

// Get notification settings
export async function getNotificationSettings(userId: string) {
    const { supabase } = await import('./supabase');

    const { data } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

    return data || { new_payment: true, goal_reached: true };
}

// Update notification settings
export async function updateNotificationSettings(
    userId: string,
    settings: { new_payment?: boolean; goal_reached?: boolean }
): Promise<boolean> {
    const { supabase } = await import('./supabase');

    const { error } = await supabase
        .from('notification_settings')
        .upsert({ user_id: userId, ...settings }, { onConflict: 'user_id' });

    return !error;
}

// Notify all users about a new payment (except the one who added it)
export async function notifyAllUsersNewPayment(
    excludeUserId: string,
    userName: string,
    amount: number,
    location: string
): Promise<void> {
    try {
        const response = await fetch('/api/notify-all', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                excludeUserId,
                title: 'Yeni Yolculuk! 🚖',
                body: `${userName}, ${location} - ₺${amount.toFixed(2)}`,
                type: 'new_payment',
            }),
        });

        if (!response.ok) {
            console.error('Failed to send notifications');
        }
    } catch (error) {
        console.error('Error notifying users:', error);
    }
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

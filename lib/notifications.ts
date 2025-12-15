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

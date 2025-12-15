import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Configure web-push with VAPID keys
if (process.env.VAPID_PRIVATE_KEY && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
    webpush.setVapidDetails(
        'mailto:admin@marti-takip.vercel.app',
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
}

export async function POST(request: NextRequest) {
    try {
        const { excludeUserId, title, body, type } = await request.json();

        // Get all push subscriptions except the sender
        const { data: subscriptions, error } = await supabase
            .from('push_subscriptions')
            .select('*, notification_settings(*)')
            .neq('user_id', excludeUserId);

        if (error) {
            console.error('Error fetching subscriptions:', error);
            return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
        }

        if (!subscriptions || subscriptions.length === 0) {
            return NextResponse.json({ message: 'No subscribers to notify' });
        }

        // Send notifications to all subscribers
        const notificationPromises = subscriptions.map(async (sub: any) => {
            // Check if user wants this type of notification
            const settings = sub.notification_settings?.[0];
            if (type === 'new_payment' && settings?.new_payment === false) {
                return { success: false, reason: 'disabled' };
            }
            if (type === 'goal_reached' && settings?.goal_reached === false) {
                return { success: false, reason: 'disabled' };
            }

            try {
                const pushSubscription = {
                    endpoint: sub.endpoint,
                    keys: JSON.parse(sub.keys),
                };

                await webpush.sendNotification(
                    pushSubscription,
                    JSON.stringify({
                        title,
                        body,
                        icon: '/icons/icon-192.png',
                        badge: '/icons/icon-192.png',
                        data: { type },
                    })
                );

                return { success: true };
            } catch (pushError: any) {
                // If subscription is invalid, remove it
                if (pushError.statusCode === 410 || pushError.statusCode === 404) {
                    await supabase.from('push_subscriptions').delete().eq('id', sub.id);
                }
                console.error('Push error:', pushError.message);
                return { success: false, error: pushError.message };
            }
        });

        const results = await Promise.all(notificationPromises);
        const successCount = results.filter(r => r.success).length;

        return NextResponse.json({
            message: `Sent ${successCount}/${subscriptions.length} notifications`
        });
    } catch (error) {
        console.error('Error sending notifications:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

import { supabase } from './supabase';
import { Payment, DashboardData, HourlyData, UserEarnings, PaymentTypeData } from '@/types';

export interface PeriodData {
    label: string;
    earnings: number;
    cash: number;
    iban: number;
}

export interface ExtendedDashboardData extends DashboardData {
    weeklyGoal: { target: number; current: number };
    periodData: {
        daily: PeriodData[];
        weekly: PeriodData[];
        monthly: PeriodData[];
    };
}

// Date helpers
function getWeekStart(): Date {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now);
    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
}

function getMonthStart(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
}

function getTodayStart(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
}

function getTodayEnd(): Date {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return today;
}

// Get all users
export async function getUsers(): Promise<{ username: string; displayName: string }[]> {
    const { data, error } = await supabase
        .from('users')
        .select('username, display_name');

    if (error) {
        console.error('Error fetching users:', error);
        return [];
    }

    return data.map(u => ({ username: u.username, displayName: u.display_name }));
}

// Get daily goal from settings
export async function getDailyGoal(): Promise<number> {
    const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'daily_goal')
        .single();

    if (error || !data) {
        return 3000;
    }

    return parseInt(data.value, 10) || 3000;
}

// Update daily goal
export async function updateDailyGoal(newGoal: number): Promise<void> {
    await supabase
        .from('settings')
        .upsert({ key: 'daily_goal', value: newGoal.toString() }, { onConflict: 'key' });
}

// Add payment
export async function addPayment(payment: {
    amount: number;
    paymentType: 'cash' | 'iban';
    user: string;
    location: string;
    userId?: string;
}): Promise<Payment | null> {
    const now = new Date();

    const { data, error } = await supabase
        .from('payments')
        .insert({
            user_id: payment.userId || null,
            user_display_name: payment.user,
            amount: payment.amount,
            payment_type: payment.paymentType,
            location: payment.location || 'Bilinmiyor',
            hour: now.getHours(),
        })
        .select()
        .single();

    if (error) {
        console.error('Error adding payment:', error);
        return null;
    }

    return {
        id: data.id,
        amount: data.amount,
        paymentType: data.payment_type,
        user: data.user_display_name,
        location: data.location,
        hour: data.hour,
        createdAt: new Date(data.created_at),
    };
}

// Update payment
export async function updatePayment(
    id: string,
    data: { amount: number; paymentType: 'cash' | 'iban'; location: string }
): Promise<boolean> {
    const { error } = await supabase
        .from('payments')
        .update({
            amount: data.amount,
            payment_type: data.paymentType,
            location: data.location,
        })
        .eq('id', id);

    if (error) {
        console.error('Error updating payment:', error);
        return false;
    }

    return true;
}

// Delete payment
export async function deletePayment(id: string): Promise<boolean> {
    const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting payment:', error);
        return false;
    }

    return true;
}

// Get dashboard data
export async function getDashboardData(filterUser: string | null = null): Promise<ExtendedDashboardData> {
    const todayStart = getTodayStart().toISOString();
    const todayEnd = getTodayEnd().toISOString();
    const weekStart = getWeekStart().toISOString();
    const monthStart = getMonthStart().toISOString();

    // Fetch payments
    let query = supabase
        .from('payments')
        .select('*')
        .gte('created_at', monthStart)
        .order('created_at', { ascending: false });

    if (filterUser) {
        query = query.eq('user_display_name', filterUser);
    }

    const { data: paymentsData, error } = await query;

    if (error) {
        console.error('Error fetching payments:', error);
    }

    const payments: Payment[] = (paymentsData || []).map(p => ({
        id: p.id,
        amount: parseFloat(p.amount),
        paymentType: p.payment_type as 'cash' | 'iban',
        user: p.user_display_name,
        location: p.location,
        hour: p.hour,
        createdAt: new Date(p.created_at),
    }));

    // Filter by date ranges
    const todayPayments = payments.filter(p => {
        const created = new Date(p.createdAt);
        return created >= new Date(todayStart) && created <= new Date(todayEnd);
    });

    const weekPayments = payments.filter(p => {
        const created = new Date(p.createdAt);
        return created >= new Date(weekStart);
    });

    // Calculate totals
    const dailyEarnings = todayPayments.reduce((sum, p) => sum + p.amount, 0);
    const weeklyEarnings = weekPayments.reduce((sum, p) => sum + p.amount, 0);
    const cashTotal = todayPayments.filter(p => p.paymentType === 'cash').reduce((sum, p) => sum + p.amount, 0);
    const ibanTotal = todayPayments.filter(p => p.paymentType === 'iban').reduce((sum, p) => sum + p.amount, 0);

    // Get goal and users count
    const dailyGoalTarget = await getDailyGoal();
    const users = await getUsers();
    const userCount = Math.max(users.length, 1);

    const personalGoal = filterUser ? Math.round(dailyGoalTarget / userCount) : dailyGoalTarget;
    const weeklyGoalTarget = personalGoal * 7;

    // Calculate hourly data for today
    const hourlyData: HourlyData[] = [];
    const currentHour = new Date().getHours();
    for (let h = 6; h <= Math.max(currentHour, 6); h++) {
        const hourPayments = todayPayments.filter(p => p.hour === h);
        hourlyData.push({
            hour: `${h.toString().padStart(2, '0')}:00`,
            earnings: hourPayments.reduce((sum, p) => sum + p.amount, 0),
        });
    }

    // Calculate user earnings
    const userEarnings: UserEarnings[] = [];
    const userNames = filterUser ? [filterUser] : users.map(u => u.displayName);
    for (const userName of userNames) {
        const userPayments = todayPayments.filter(p => p.user === userName);
        userEarnings.push({
            user: userName,
            total: userPayments.reduce((sum, p) => sum + p.amount, 0),
            cash: userPayments.filter(p => p.paymentType === 'cash').reduce((sum, p) => sum + p.amount, 0),
            iban: userPayments.filter(p => p.paymentType === 'iban').reduce((sum, p) => sum + p.amount, 0),
        });
    }

    // Payment type data
    const paymentTypeData: PaymentTypeData[] = [
        { name: 'Nakit', value: cashTotal, color: '#22c55e' },
        { name: 'IBAN', value: ibanTotal, color: '#6366f1' },
    ];

    // Period data
    const dailyPeriodData: PeriodData[] = [];
    for (let h = 6; h <= Math.max(currentHour, 6); h++) {
        const hourPayments = todayPayments.filter(p => p.hour === h);
        dailyPeriodData.push({
            label: `${h.toString().padStart(2, '0')}:00`,
            earnings: hourPayments.reduce((sum, p) => sum + p.amount, 0),
            cash: hourPayments.filter(p => p.paymentType === 'cash').reduce((sum, p) => sum + p.amount, 0),
            iban: hourPayments.filter(p => p.paymentType === 'iban').reduce((sum, p) => sum + p.amount, 0),
        });
    }

    // Weekly period data
    const days = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
    const weeklyPeriodData: PeriodData[] = [];
    const weekStartDate = getWeekStart();
    for (let i = 0; i < 7; i++) {
        const day = new Date(weekStartDate);
        day.setDate(day.getDate() + i);
        const dayPayments = payments.filter(p => {
            const created = new Date(p.createdAt);
            return created.getDate() === day.getDate() &&
                created.getMonth() === day.getMonth() &&
                created.getFullYear() === day.getFullYear();
        });
        weeklyPeriodData.push({
            label: days[day.getDay()],
            earnings: dayPayments.reduce((sum, p) => sum + p.amount, 0),
            cash: dayPayments.filter(p => p.paymentType === 'cash').reduce((sum, p) => sum + p.amount, 0),
            iban: dayPayments.filter(p => p.paymentType === 'iban').reduce((sum, p) => sum + p.amount, 0),
        });
    }

    // Monthly period data (by week)
    const monthlyPeriodData: PeriodData[] = [];
    const monthStartDate = getMonthStart();
    const now = new Date();
    let weekNum = 1;
    let currentWeekStart = new Date(monthStartDate);
    while (currentWeekStart <= now && weekNum <= 5) {
        const weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        const weekPaymentsInMonth = payments.filter(p => {
            const created = new Date(p.createdAt);
            return created >= currentWeekStart && created < weekEnd && created.getMonth() === now.getMonth();
        });
        if (weekPaymentsInMonth.length > 0 || currentWeekStart <= now) {
            monthlyPeriodData.push({
                label: `${weekNum}. Hafta`,
                earnings: weekPaymentsInMonth.reduce((sum, p) => sum + p.amount, 0),
                cash: weekPaymentsInMonth.filter(p => p.paymentType === 'cash').reduce((sum, p) => sum + p.amount, 0),
                iban: weekPaymentsInMonth.filter(p => p.paymentType === 'iban').reduce((sum, p) => sum + p.amount, 0),
            });
        }
        currentWeekStart = weekEnd;
        weekNum++;
    }

    return {
        payments: todayPayments,
        dailyGoal: { target: personalGoal, current: dailyEarnings },
        weeklyGoal: { target: weeklyGoalTarget, current: weeklyEarnings },
        hourlyData,
        userEarnings,
        paymentTypeData,
        totalEarnings: dailyEarnings,
        cashTotal,
        ibanTotal,
        periodData: {
            daily: dailyPeriodData.length > 0 ? dailyPeriodData : [{ label: '06:00', earnings: 0, cash: 0, iban: 0 }],
            weekly: weeklyPeriodData,
            monthly: monthlyPeriodData.length > 0 ? monthlyPeriodData : [{ label: '1. Hafta', earnings: 0, cash: 0, iban: 0 }],
        },
    };
}

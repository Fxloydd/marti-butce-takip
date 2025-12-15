import { Payment, DashboardData, HourlyData, UserEarnings, PaymentTypeData } from '@/types';

export interface PeriodData {
    label: string;
    earnings: number;
    cash: number;
    iban: number;
}

// Get stored payments from localStorage
function getStoredPayments(): Payment[] {
    if (typeof window === 'undefined') return [];

    const stored = localStorage.getItem('marti_payments');
    if (stored) {
        try {
            const payments = JSON.parse(stored);
            return payments.map((p: Payment & { createdAt: string }) => ({
                ...p,
                createdAt: new Date(p.createdAt),
            }));
        } catch {
            return [];
        }
    }
    return [];
}

// Save payments to localStorage
function savePayments(payments: Payment[]) {
    localStorage.setItem('marti_payments', JSON.stringify(payments));
}

// Get stored daily goal
function getStoredDailyGoal(): number {
    if (typeof window === 'undefined') return 3000;

    const stored = localStorage.getItem('marti_daily_goal');
    if (stored) {
        const goal = parseInt(stored, 10);
        if (!isNaN(goal)) return goal;
    }
    return 3000;
}

// Save daily goal
function saveDailyGoal(goal: number) {
    localStorage.setItem('marti_daily_goal', goal.toString());
}

// Get all registered users
function getRegisteredUsers(): string[] {
    if (typeof window === 'undefined') return ['Ali'];

    const stored = localStorage.getItem('marti_users');
    if (stored) {
        try {
            const users = JSON.parse(stored);
            return users.map((u: { displayName: string }) => u.displayName);
        } catch {
            return ['Ali'];
        }
    }
    return ['Ali'];
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

function isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
}

function isThisWeek(date: Date): boolean {
    const weekStart = getWeekStart();
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    return date >= weekStart && date < weekEnd;
}

function isThisMonth(date: Date): boolean {
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
}

// Calculate hourly earnings for today
function calculateHourlyData(payments: Payment[]): HourlyData[] {
    const hourlyMap = new Map<number, number>();

    const currentHour = new Date().getHours();
    for (let h = 6; h <= Math.max(currentHour, 6); h++) {
        hourlyMap.set(h, 0);
    }

    payments
        .filter(p => isToday(p.createdAt))
        .forEach(payment => {
            const current = hourlyMap.get(payment.hour) || 0;
            hourlyMap.set(payment.hour, current + payment.amount);
        });

    return Array.from(hourlyMap.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([hour, earnings]) => ({
            hour: `${hour.toString().padStart(2, '0')}:00`,
            earnings,
        }));
}

// Calculate daily data for the period chart (last 7 days hourly breakdown)
function calculateDailyPeriodData(payments: Payment[]): PeriodData[] {
    const currentHour = new Date().getHours();
    const data: PeriodData[] = [];

    for (let h = 6; h <= Math.max(currentHour, 6); h++) {
        const hourPayments = payments.filter(p =>
            isToday(p.createdAt) && p.hour === h
        );

        data.push({
            label: `${h.toString().padStart(2, '0')}:00`,
            earnings: hourPayments.reduce((sum, p) => sum + p.amount, 0),
            cash: hourPayments.filter(p => p.paymentType === 'cash').reduce((sum, p) => sum + p.amount, 0),
            iban: hourPayments.filter(p => p.paymentType === 'iban').reduce((sum, p) => sum + p.amount, 0),
        });
    }

    return data;
}

// Calculate weekly data (last 7 days)
function calculateWeeklyPeriodData(payments: Payment[]): PeriodData[] {
    const days = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
    const data: PeriodData[] = [];
    const weekStart = getWeekStart();

    for (let i = 0; i < 7; i++) {
        const day = new Date(weekStart);
        day.setDate(day.getDate() + i);

        const dayPayments = payments.filter(p =>
            p.createdAt.getDate() === day.getDate() &&
            p.createdAt.getMonth() === day.getMonth() &&
            p.createdAt.getFullYear() === day.getFullYear()
        );

        data.push({
            label: days[day.getDay()],
            earnings: dayPayments.reduce((sum, p) => sum + p.amount, 0),
            cash: dayPayments.filter(p => p.paymentType === 'cash').reduce((sum, p) => sum + p.amount, 0),
            iban: dayPayments.filter(p => p.paymentType === 'iban').reduce((sum, p) => sum + p.amount, 0),
        });
    }

    return data;
}

// Calculate monthly data (last 4 weeks)
function calculateMonthlyPeriodData(payments: Payment[]): PeriodData[] {
    const data: PeriodData[] = [];
    const monthStart = getMonthStart();
    const now = new Date();

    // Group by week
    let weekNum = 1;
    let currentWeekStart = new Date(monthStart);

    while (currentWeekStart <= now && weekNum <= 5) {
        const weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);

        const weekPayments = payments.filter(p =>
            p.createdAt >= currentWeekStart &&
            p.createdAt < weekEnd &&
            p.createdAt.getMonth() === now.getMonth()
        );

        if (weekPayments.length > 0 || currentWeekStart <= now) {
            data.push({
                label: `${weekNum}. Hafta`,
                earnings: weekPayments.reduce((sum, p) => sum + p.amount, 0),
                cash: weekPayments.filter(p => p.paymentType === 'cash').reduce((sum, p) => sum + p.amount, 0),
                iban: weekPayments.filter(p => p.paymentType === 'iban').reduce((sum, p) => sum + p.amount, 0),
            });
        }

        currentWeekStart = weekEnd;
        weekNum++;
    }

    return data.length > 0 ? data : [{ label: '1. Hafta', earnings: 0, cash: 0, iban: 0 }];
}

// Calculate user earnings
function calculateUserEarnings(payments: Payment[], users: string[]): UserEarnings[] {
    const userMap = new Map<string, { total: number; cash: number; iban: number }>();

    users.forEach(user => {
        userMap.set(user, { total: 0, cash: 0, iban: 0 });
    });

    payments
        .filter(p => isToday(p.createdAt))
        .forEach(payment => {
            const current = userMap.get(payment.user) || { total: 0, cash: 0, iban: 0 };
            current.total += payment.amount;
            if (payment.paymentType === 'cash') {
                current.cash += payment.amount;
            } else {
                current.iban += payment.amount;
            }
            userMap.set(payment.user, current);
        });

    return Array.from(userMap.entries()).map(([user, data]) => ({
        user,
        ...data,
    }));
}

// Calculate payment type distribution
function calculatePaymentTypeData(payments: Payment[]): PaymentTypeData[] {
    let cash = 0;
    let iban = 0;

    payments
        .filter(p => isToday(p.createdAt))
        .forEach(payment => {
            if (payment.paymentType === 'cash') {
                cash += payment.amount;
            } else {
                iban += payment.amount;
            }
        });

    return [
        { name: 'Nakit', value: cash, color: '#22c55e' },
        { name: 'IBAN', value: iban, color: '#6366f1' },
    ];
}

// Extended dashboard data type
export interface ExtendedDashboardData extends DashboardData {
    weeklyGoal: { target: number; current: number };
    periodData: {
        daily: PeriodData[];
        weekly: PeriodData[];
        monthly: PeriodData[];
    };
}

// Main function to get all dashboard data
export function getMockDashboardData(filterUser: string | null = null): ExtendedDashboardData {
    const allPayments = getStoredPayments();
    const users = getRegisteredUsers();
    const storedDailyGoal = getStoredDailyGoal();

    // Filter payments by user if specified
    const filteredPayments = filterUser
        ? allPayments.filter(p => p.user === filterUser)
        : allPayments;

    const todayPayments = filteredPayments.filter(p => isToday(p.createdAt));
    const weeklyPayments = filteredPayments.filter(p => isThisWeek(p.createdAt));

    const dailyEarnings = todayPayments.reduce((sum, p) => sum + p.amount, 0);
    const weeklyEarnings = weeklyPayments.reduce((sum, p) => sum + p.amount, 0);
    const cashTotal = todayPayments.filter(p => p.paymentType === 'cash').reduce((sum, p) => sum + p.amount, 0);
    const ibanTotal = todayPayments.filter(p => p.paymentType === 'iban').reduce((sum, p) => sum + p.amount, 0);

    const userCount = Math.max(users.length, 1);
    const dailyGoalTarget = filterUser ? Math.round(storedDailyGoal / userCount) : storedDailyGoal;
    const weeklyGoalTarget = dailyGoalTarget * 7;

    return {
        payments: todayPayments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
        dailyGoal: {
            target: dailyGoalTarget,
            current: dailyEarnings,
        },
        weeklyGoal: {
            target: weeklyGoalTarget,
            current: weeklyEarnings,
        },
        hourlyData: calculateHourlyData(filteredPayments),
        userEarnings: filterUser
            ? calculateUserEarnings(filteredPayments, [filterUser])
            : calculateUserEarnings(allPayments, users),
        paymentTypeData: calculatePaymentTypeData(filteredPayments),
        totalEarnings: dailyEarnings,
        cashTotal,
        ibanTotal,
        periodData: {
            daily: calculateDailyPeriodData(filteredPayments),
            weekly: calculateWeeklyPeriodData(filteredPayments),
            monthly: calculateMonthlyPeriodData(filteredPayments),
        },
    };
}

// Add new payment
export function addPayment(payment: Omit<Payment, 'id' | 'createdAt' | 'hour'>): Payment {
    const payments = getStoredPayments();

    const now = new Date();
    const newPayment: Payment = {
        ...payment,
        id: `payment-${Date.now()}`,
        createdAt: now,
        hour: now.getHours(),
    };

    const updatedPayments = [newPayment, ...payments];
    savePayments(updatedPayments);

    return newPayment;
}

// Update daily goal
export function updateDailyGoal(newGoal: number): void {
    saveDailyGoal(newGoal);
}

// Get daily goal
export function getDailyGoal(): number {
    return getStoredDailyGoal();
}

// Get all registered users
export function getUsers(): string[] {
    return getRegisteredUsers();
}

// Update existing payment
export function updatePayment(id: string, data: { amount: number; paymentType: 'cash' | 'iban'; location: string }): boolean {
    const payments = getStoredPayments();
    const index = payments.findIndex(p => p.id === id);

    if (index === -1) return false;

    payments[index] = {
        ...payments[index],
        amount: data.amount,
        paymentType: data.paymentType,
        location: data.location,
    };

    savePayments(payments);
    return true;
}

// Delete payment
export function deletePayment(id: string): boolean {
    const payments = getStoredPayments();
    const filtered = payments.filter(p => p.id !== id);

    if (filtered.length === payments.length) return false;

    savePayments(filtered);
    return true;
}

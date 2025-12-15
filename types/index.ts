// Types for the Martı Takip Dashboard

export type PaymentType = 'cash' | 'iban';

export interface Payment {
    id: string;
    amount: number;
    paymentType: PaymentType;
    user: string;
    location: string;
    createdAt: Date;
    hour: number;
}

export interface DailyGoal {
    target: number;
    current: number;
}

export interface HourlyData {
    hour: string;
    earnings: number;
}

export interface UserEarnings {
    user: string;
    total: number;
    cash: number;
    iban: number;
}

export interface PaymentTypeData {
    name: string;
    value: number;
    color: string;
}

export interface DashboardData {
    payments: Payment[];
    dailyGoal: DailyGoal;
    hourlyData: HourlyData[];
    userEarnings: UserEarnings[];
    paymentTypeData: PaymentTypeData[];
    totalEarnings: number;
    cashTotal: number;
    ibanTotal: number;
}

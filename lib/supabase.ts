import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string;
                    username: string;
                    display_name: string;
                    password_hash: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    username: string;
                    display_name: string;
                    password_hash: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    username?: string;
                    display_name?: string;
                    password_hash?: string;
                };
            };
            payments: {
                Row: {
                    id: string;
                    user_id: string;
                    user_display_name: string;
                    amount: number;
                    payment_type: 'cash' | 'iban';
                    location: string;
                    hour: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    user_display_name: string;
                    amount: number;
                    payment_type: 'cash' | 'iban';
                    location: string;
                    hour: number;
                    created_at?: string;
                };
                Update: {
                    amount?: number;
                    payment_type?: 'cash' | 'iban';
                    location?: string;
                };
            };
            settings: {
                Row: {
                    id: string;
                    key: string;
                    value: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    key: string;
                    value: string;
                };
                Update: {
                    value?: string;
                };
            };
            push_subscriptions: {
                Row: {
                    id: string;
                    user_id: string;
                    endpoint: string;
                    keys: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    endpoint: string;
                    keys: string;
                };
                Update: {
                    endpoint?: string;
                    keys?: string;
                };
            };
            notification_settings: {
                Row: {
                    id: string;
                    user_id: string;
                    new_payment: boolean;
                    goal_reached: boolean;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    new_payment?: boolean;
                    goal_reached?: boolean;
                };
                Update: {
                    new_payment?: boolean;
                    goal_reached?: boolean;
                };
            };
        };
    };
};

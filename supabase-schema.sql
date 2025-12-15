-- Martı Takip Database Schema
-- Run this in Supabase SQL Editor

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    user_display_name TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_type TEXT CHECK (payment_type IN ('cash', 'iban')) NOT NULL,
    location TEXT DEFAULT 'Bilinmiyor',
    hour INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings table (for daily goal etc.)
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default daily goal
INSERT INTO settings (key, value) VALUES ('daily_goal', '3000')
ON CONFLICT (key) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Policies: Allow all operations for now (you can restrict later)
CREATE POLICY "Allow all users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all payments" ON payments FOR ALL USING (true);
CREATE POLICY "Allow all settings" ON settings FOR ALL USING (true);

'use client';

import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { HourlyData } from '@/types';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart
} from 'recharts';

interface HourlyEarningsChartProps {
    data: HourlyData[];
}

export function HourlyEarningsChart({ data }: HourlyEarningsChartProps) {
    return (
        <Card className="mx-4">
            <CardHeader>
                <CardTitle>Saatlik Kazanç</CardTitle>
            </CardHeader>
            <div className="h-48 -mx-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="hour"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#71717a' }}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#71717a' }}
                            tickFormatter={(value) => `₺${value}`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#18181b',
                                border: 'none',
                                borderRadius: '12px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                            }}
                            labelStyle={{ color: '#a1a1aa', fontSize: 12 }}
                            itemStyle={{ color: '#ffffff', fontSize: 14, fontWeight: 600 }}
                            formatter={(value: number | undefined) => [`₺${value ?? 0}`, 'Kazanç']}
                        />
                        <Area
                            type="monotone"
                            dataKey="earnings"
                            stroke="#6366f1"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorEarnings)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}

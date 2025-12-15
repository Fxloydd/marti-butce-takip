'use client';

import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { UserEarnings } from '@/types';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

interface UserComparisonChartProps {
    data: UserEarnings[];
}

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#8b5cf6'];

export function UserComparisonChart({ data }: UserComparisonChartProps) {
    return (
        <Card className="mx-4">
            <CardHeader>
                <CardTitle>Kullanıcı Karşılaştırması</CardTitle>
            </CardHeader>
            <div className="h-48 -mx-2">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis
                            dataKey="user"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#71717a' }}
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
                            formatter={(value: number | undefined, name: string) => {
                                const label = name === 'cash' ? 'Nakit' : name === 'iban' ? 'IBAN' : 'Toplam';
                                return [`₺${value ?? 0}`, label];
                            }}
                        />
                        <Bar
                            dataKey="total"
                            radius={[8, 8, 0, 0]}
                            maxBarSize={50}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}

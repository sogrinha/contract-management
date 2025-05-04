import React from 'react';
import {
    LineChart as RechartsLineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

interface LineChartProps {
    data: {
        name: string;
        value: number;
    }[];
    title: string;
    color?: string;
}

export const LineChart: React.FC<LineChartProps> = ({ data, title, color = '#2563eb' }) => {
    return (
        <div className="w-full h-[300px] bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart
                    data={data}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="name"
                        tick={{ fill: '#6B7280' }}
                        tickLine={{ stroke: '#6B7280' }}
                    />
                    <YAxis
                        tick={{ fill: '#6B7280' }}
                        tickLine={{ stroke: '#6B7280' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #E5E7EB',
                            borderRadius: '0.375rem',
                        }}
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke={color}
                        strokeWidth={2}
                        dot={{ fill: color }}
                        activeDot={{ r: 8 }}
                    />
                </RechartsLineChart>
            </ResponsiveContainer>
        </div>
    );
}; 

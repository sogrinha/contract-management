import React from 'react';
import { formatCurrency } from '../utils/formatters';

interface KPICardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    isMonetary?: boolean;
    isPercentage?: boolean;
    trend?: {
        value: number;
        isPositive: boolean;
    };
}

export const KPICard: React.FC<KPICardProps> = ({
    title,
    value,
    icon,
    isMonetary = false,
    isPercentage = false,
    trend
}) => {
    const formattedValue = React.useMemo(() => {
        if (isMonetary) {
            return formatCurrency(Number(value));
        }
        if (isPercentage) {
            return `${value}%`;
        }
        return value;
    }, [value, isMonetary, isPercentage]);

    return (
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <span className="text-gray-500 font-medium">{title}</span>
                <div className="text-blue-600">{icon}</div>
            </div>

            <div className="flex items-end justify-between">
                <div>
                    <h4 className="text-2xl font-bold text-gray-800">{formattedValue}</h4>
                    {trend && (
                        <div className={`flex items-center mt-2 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            <span className="text-sm font-medium">
                                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                            </span>
                            <span className="text-xs text-gray-500 ml-1">vs. mês anterior</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}; 

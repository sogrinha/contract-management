import { ArrowDown, ArrowUp } from 'lucide-react';

interface KPICardProps {
    title: string;
    value: string | number;
    icon?: React.ReactNode;
    trend?: number;
    trendLabel?: string;
    color?: string;
}

const KPICard = ({ title, value, icon, trend, trendLabel, color = 'pink' }: KPICardProps) => {
    const colorVariants = {
        pink: 'bg-pink-100 text-pink-800',
        blue: 'bg-blue-100 text-blue-800',
        green: 'bg-green-100 text-green-800',
        yellow: 'bg-yellow-100 text-yellow-800',
    };

    const trendColor = trend && trend > 0 ? 'text-green-500' : 'text-red-500';

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
                {icon && <div className={`p-2 rounded-full ${colorVariants[color as keyof typeof colorVariants]}`}>{icon}</div>}
            </div>
            <div className="flex items-end justify-between">
                <div>
                    <p className="text-2xl font-bold text-gray-800">{value}</p>
                    {trend && (
                        <div className={`flex items-center mt-2 ${trendColor}`}>
                            {trend > 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                            <span className="text-sm ml-1">
                                {Math.abs(trend)}% {trendLabel}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default KPICard; 

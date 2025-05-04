import { Line, LineChart as RechartsLineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { formatCurrency } from '../../utils/formatters';

interface LineChartProps {
    data: Array<{
        [key: string]: string | number;
    }>;
    dataKey: string;
    lineKey: string;
    title?: string;
}

const LineChart = ({ data, dataKey, lineKey, title }: LineChartProps) => {
    return (
        <div className="w-full h-[300px]">
            {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
            <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={dataKey} />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip
                        formatter={(value: number) => [formatCurrency(value), '']}
                        labelFormatter={(label) => `${label}`}
                    />
                    <Line
                        type="monotone"
                        dataKey={lineKey}
                        stroke="#8884d8"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 8 }}
                    />
                </RechartsLineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default LineChart; 

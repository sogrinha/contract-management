import {
    BarChart as RechartsBarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

interface BarChartProps {
    data: any[];
    dataKey: string;
    barKey: string;
    title: string;
    color?: string;
}

const BarChart = ({ data, dataKey, barKey, title, color = '#FF69B4' }: BarChartProps) => {
    return (
        <div className="w-full h-[300px] bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={dataKey} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey={barKey} fill={color} />
                </RechartsBarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default BarChart; 

import {
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

interface PieChartProps {
    data: Array<{
        name: string;
        value: number;
    }>;
    title: string;
    colors?: string[];
}

const COLORS = ['#FF69B4', '#36B9CC', '#4E73DF', '#1CC88A', '#F6C23E'];

const PieChart = ({ data, title, colors = COLORS }: PieChartProps) => {
    return (
        <div className="w-full h-[300px] bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </RechartsPieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PieChart; 

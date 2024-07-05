import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import usePieGraph from '@/hooks/usePieGraph';
import { processTransactions } from '@/utils/processTransactions';

interface ChartProps {
    fromDate: Date;
    toDate: Date;
    accounts: string[];
    type: string;
    groupBy: string;
}

interface ProcessedData {
    category: string;
    amount: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6B6B', '#82ca9d'];

const PieChartComponent: React.FC<ChartProps> = ({ fromDate, toDate, accounts, type, groupBy }) => {
    const transactions = usePieGraph({ fromDate, toDate, accounts, type, groupBy });
    const [data, setData] = useState<ProcessedData[]>([]);
    const [activeCategories, setActiveCategories] = useState<string[]>([]);

    useEffect(() => {
        if (transactions.length > 0) {
            const processedData = processTransactions(transactions, groupBy);
            setData(processedData);
            setActiveCategories(processedData.map(d => d.category));
        }
    }, [transactions, groupBy]);

    const handleDoubleClick = (category: string) => {
        setActiveCategories(prev =>
            prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
        );
    };

    const filteredData = data.filter(d => activeCategories.includes(d.category));

    return (
        <PieChart width={600} height={300}>
            <Pie
                data={filteredData}
                dataKey="amount"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                onDoubleClick={(data, index) => handleDoubleClick(data.category)}
                isAnimationActive={false}
            >
                {filteredData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
            </Pie>
            <Tooltip />
            <Legend />
        </PieChart>
    );
};

export default PieChartComponent;

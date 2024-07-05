import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import useGraph from '@/hooks/useGraph';
import { processTransactions } from '@/utils/processTransactions';

interface ChartProps {
    fromDate: Date;
    toDate: Date;
    accounts: string[];
    type: string;
}

interface ProcessedData {
    category: string;
    amount: number;
}

const ExpenseMainCategoryChart: React.FC<ChartProps> = ({ fromDate, toDate, accounts, type }) => {
    const transactions = useGraph({ fromDate, toDate, accounts, type, groupBy: 'main' });
    const [data, setData] = useState<ProcessedData[]>([]);
    useEffect(() => {
        if (transactions.length > 0) {
            const processedData = processTransactions(transactions, 'main');
            setData(processedData);
        }
    }, [transactions]);

    return (
        <BarChart
            width={1000}
            height={500}
            data={data}
            margin={{
                top: 5, right: 30, left: 20, bottom: 5,
            }}
        >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="amount" fill="#FF6B6B" />
        </BarChart>
    );
}

export default ExpenseMainCategoryChart;

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

const IncomeSubcategoryChart: React.FC<ChartProps> = ({ fromDate, toDate, accounts, type }) => {
    const transactions = useGraph({ fromDate, toDate, accounts, type, groupBy: 'subcategory' });
    const [data, setData] = useState<ProcessedData[]>([]);

    useEffect(() => {
        if (transactions.length > 0) {
            const processedData = processTransactions(transactions, 'subcategory');
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
            <Bar dataKey="amount" fill="#82ca9d" />
        </BarChart>
    );
}

export default IncomeSubcategoryChart;

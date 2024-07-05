import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import useGraph from '@/hooks/useGraph';
import { processTransactions } from '@/utils/processTransactions';

interface ChartProps {
    fromDate: Date;
    toDate: Date;
    accounts: string[];
}

interface ProcessedData {
    type: string;
    amount: number;
}


const sumUpTypes = (incomeData: ProcessedData[], expenseData: ProcessedData[]): ProcessedData[] => {
    const result: { [key: string]: number } = { Income: 0, Expense: 0 };
    incomeData.forEach(({ amount }) => {
        result.Income += amount;
    });
    expenseData.forEach(({ amount }) => {
        result.Expense += amount;
    });
    return [
        { type: 'Income', amount: result.Income },
        { type: 'Expense', amount: result.Expense }
    ];
};

const BothChart: React.FC<ChartProps> = ({ fromDate, toDate, accounts }) => {
    const incomeTransactions = useGraph({ fromDate, toDate, accounts, type: '1', groupBy: 'type' });
    const expenseTransactions = useGraph({ fromDate, toDate, accounts, type: '0', groupBy: 'type' });
    const [data, setData] = useState<ProcessedData[]>([]);
    useEffect(() => {
        if (incomeTransactions.length > 0 || expenseTransactions.length > 0) {
            const processedIncomeData = processTransactions(incomeTransactions, 'type');
            const processedExpenseData = processTransactions(expenseTransactions, 'type');
            const combinedData = sumUpTypes(
                processedIncomeData.map((item) => ({ ...item, type: 'Income' })),
                processedExpenseData.map((item) => ({ ...item, type: 'Expense' }))
            );
            setData(combinedData);
        }
    }, [incomeTransactions, expenseTransactions]);
    console.log(data);

    return (
        <BarChart
            width={600}
            height={300}
            data={data}
            margin={{
                top: 5, right: 30, left: 20, bottom: 5,
            }}
        >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="type" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="amount" fill="#82ca9d" />
        </BarChart>
    );
}

export default BothChart;

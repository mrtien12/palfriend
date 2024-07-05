import { Transaction } from '@/types/transaction';

interface ProcessedData {
    category: string;
    amount: number;
}

export function processTransactions(transactions: Transaction[], groupBy: string): ProcessedData[] {
    const groupedData: { [key: string]: number } = {};
    transactions.forEach(transaction => {
        const key = groupBy === 'subcategory' && transaction.category.includes('/')
            ? transaction.category
            : transaction.category.split(' / ')[0];
        
        if (!groupedData[key]) {
            groupedData[key] = 0;
        }
        groupedData[key] += transaction.amount;
    });

    return Object.keys(groupedData).map(key => ({
        category: key,
        amount: groupedData[key],
    }));
}

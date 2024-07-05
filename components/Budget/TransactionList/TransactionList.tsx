
import {Text,Flex, Table, Button, Modal} from '@mantine/core'; 
import { useState } from 'react';
import useTransactionByBudget from '@/hooks/useTransactionByBudget';
import useAccounts from '@/hooks/useAccount';
interface TransactionListProps {
    budgetId: string;
    opened: boolean;
    onClose: () => void;
}
export default function TransactionList({budgetId, opened, onClose}: TransactionListProps){
    const accounts = useAccounts()
    const transactions = useTransactionByBudget(budgetId);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
        direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedTransactions = [...transactions].sort((a, b) => {
        if (!sortConfig) return 0;

        const aValue = sortConfig.key === 'date' ? a.date.getTime() : a.amount;
        const bValue = sortConfig.key === 'date' ? b.date.getTime() : b.amount;

        if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });
    const rows = sortedTransactions.map((transaction) => {
        const accountName = accounts.find(acc => acc.id === transaction.account)?.name || 'Unknown Account';
        return (
            <Table.Tr key={transaction.id}>
                <Table.Td>{accountName}</Table.Td>
                <Table.Td>{transaction.date.getDate() + "/" + (transaction.date.getMonth() + 1) + "/" + transaction.date.getFullYear()}</Table.Td>
                <Table.Td>{transaction.category}</Table.Td>
                <Table.Td>{transaction.memo}</Table.Td>
                <Table.Td>{transaction.amount}</Table.Td>
                
            </Table.Tr>
        );
    }); 
    return (
        <>
            <Modal opened={opened} onClose={onClose} title="Transaction List">
            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Tài khoản</Table.Th>
                        <Table.Th onClick={() => handleSort('date')}>Ngày</Table.Th>
                        <Table.Th>Danh mục</Table.Th>
                        <Table.Th>Ghi nhớ</Table.Th>
                        <Table.Th onClick={() => handleSort('amount')}>Số tiền</Table.Th>
                    </Table.Tr>
                    
                </Table.Thead>
                <Table.Tbody>
                    
                    {rows}
                </Table.Tbody>
            </Table>
            </Modal>
        </>
    )
}
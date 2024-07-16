import {Text,Flex, Table, Button, Modal} from '@mantine/core'; 
import { useState } from 'react';
import useTransactionByBudget from '@/hooks/useTransactionByBudget';
import useAccounts from '@/hooks/useAccount';
import { Transaction } from '@/types/transaction';

interface SupportListProps {
    transactions: Transaction[];
    opened: boolean;
    onClose: () => void;
}
export default function SupportList({transactions, opened, onClose}: SupportListProps){
    const accounts = useAccounts()
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
    console.log(transactions)
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
                <Table.Td>
                    <span
                    style={{
                        width: '5px',
                        height: '100%',
                        border:
                        transaction.type === '0'
                            ? '3px solid red'
                            : transaction.type === '1'
                            ? '3px solid green'
                            : transaction.type === '2'? '3px solid blue':'2px solid',
                    }}
                    /></Table.Td>
                <Table.Td>{accountName}</Table.Td>
                <Table.Td>{transaction.date.getDate() + "/" + (transaction.date.getMonth() + 1) + "/" + transaction.date.getFullYear()}</Table.Td>
                <Table.Td>{transaction.category}</Table.Td>
                <Table.Td>{transaction.memo}</Table.Td>
                <Table.Td>
                    {transaction.type === '0' ||
                    (transaction.type === '2' && transaction.from === true)
                    ? '-'
                    : ''}
                    {transaction.amount}
                </Table.Td>       
                
            </Table.Tr>
        );

        
    }); 


    return (
        <>
            <Modal opened={opened} onClose={onClose} size="lg" title="Danh sách giao dịch">
            <Table>
                <Table.Thead>
                    <Table.Tr>
                    <Table.Th
                        style={{
                            width: '10px',
                        }}
                        ></Table.Th>
                        <Table.Th>Account</Table.Th>
                        <Table.Th onClick={() => handleSort('date')}>Date</Table.Th>
                        <Table.Th>Category</Table.Th>
                        <Table.Th>Memo</Table.Th>
                        <Table.Th onClick={() => handleSort('amount')}>Amount</Table.Th>
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
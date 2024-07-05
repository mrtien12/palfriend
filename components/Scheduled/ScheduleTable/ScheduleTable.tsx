import { useState } from 'react'

import {Table,Button, Flex, Collapse } from '@mantine/core'
import { ScheduleTransaction} from '@/types/transaction';
import useTransactionByAccount from '@/hooks/useTransactionByAccount';
interface TransactionTableProps {
    // transactions : Transaction[];
    scheduled : ScheduleTransaction[];
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;

    
}


export default function TransactionTable({ scheduled,onEdit,onDelete }: TransactionTableProps) {
    

    

    const handleEdit = (id: string) => {
        onEdit(id)
    }

    const handleDelete = (id: string) => {
        onDelete(id)
    }
    // const handleEdit = (id: string) => {
    //     onEdit(id, type);
    //   };
    
    //   const handleDelete = (id: string) => {
    //     onDelete(id, type);
    //   };

   

    const rows = scheduled.map((transaction) => (
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
            <Table.Td>{transaction.upcomingDate.getDate() + "/" + (transaction.date.getMonth() + 1) + "/" + transaction.date.getFullYear() }</Table.Td>
            <Table.Td>{transaction.category}</Table.Td>
            <Table.Td>{transaction.memo}</Table.Td>
            <Table.Td>{transaction.amount}</Table.Td>
            <Table.Td>
                <Flex gap="md">
                    <Button size="xs" variant="outline" onClick={() => handleEdit(transaction.id)}>Sửa</Button>
                    <Button size="xs" variant="outline" onClick={() => handleDelete(transaction.id)}>Xóa</Button>
                </Flex>
                
            </Table.Td>
        </Table.Tr>
        
    ));  
    
    return (
        <>
            <Table>
                <Table.Thead>
                    <Table.Tr>
                    <Table.Th
                        style={{
                            width: '10px',
                        }}
                        ></Table.Th>
                        <Table.Th>Ngày</Table.Th>
                        <Table.Th>Danh mục</Table.Th>
                        <Table.Th>Ghi nhớ</Table.Th>
                        <Table.Th>Số tiền</Table.Th>
                    </Table.Tr>
                    
                </Table.Thead>
                <Table.Tbody>
                    
                    {rows}
                </Table.Tbody>
            </Table>
        </>
    )
}
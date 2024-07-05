import { useState } from 'react';

import { Transaction } from '@/types/transaction';
import { Button, Flex, Table } from '@mantine/core';
interface TransactionTableProps {
  transactions: Transaction[];
  // scheduled : ScheduleTransaction[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onNavigate: (id: string) => void;
}

export default function TransactionTable({
  transactions,
  onNavigate,
  onEdit,
  onDelete,
}: TransactionTableProps) {
  const handleEdit = (id: string) => {
    onEdit(id);
  };

  const handleDelete = (id: string) => {
    onDelete(id);
  };

  const handleNavigate = (id: string) => {
    onNavigate(id);
  };
  // const handleEdit = (id: string) => {
  //     onEdit(id, type);
  //   };

  //   const handleDelete = (id: string) => {
  //     onDelete(id, type);
  //   };

  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'asc'
    ) {
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

  const rows = sortedTransactions.map((transaction) => (
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
        />
      </Table.Td>
      <Table.Td>
        {transaction.date.getDate() +
          '/' +
          (transaction.date.getMonth() + 1) +
          '/' +
          transaction.date.getFullYear()}
      </Table.Td>
      <Table.Td>{transaction.category}</Table.Td>
      <Table.Td>{transaction.memo}</Table.Td>
      <Table.Td>
        {transaction.type === '0' ||
        (transaction.type === '2' && transaction.from === true)
          ? '-'
          : ''}
        {transaction.amount}
      </Table.Td>
      <Table.Td>
        <Flex gap="md">
          {transaction.from !== false && (
            <Button
              size="xs"
              variant="outline"
              onClick={() => handleEdit(transaction.id)}
            >
              Sửa
            </Button>
          )}
          {transaction.from == false && (
            <Button
              size="xs"
              variant="outline"
              onClick={() => handleNavigate(transaction.id)}
            >
              Đi đến
            </Button>
          )}
          <Button
            size="xs"
            variant="outline"
            onClick={() => handleDelete(transaction.id)}
          >
            Xoá
          </Button>
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
            <Table.Th onClick={() => handleSort('date')}>Ngày</Table.Th>
            <Table.Th>Danh mục</Table.Th>
            <Table.Th>Ghi chú</Table.Th>
            <Table.Th onClick={() => handleSort('amount')}>Số tiền</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </>
  );
}

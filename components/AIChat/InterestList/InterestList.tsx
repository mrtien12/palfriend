import { Text, Flex, Table, Button, Modal } from '@mantine/core';
import { useState } from 'react';
import { Interest } from '@/types/interest';

interface InterestListProps {
  options: Interest[];
  opened: boolean;
  onClose: () => void;
}

export default function InterestList({
  options,
  opened,
  onClose,
}: InterestListProps) {
  // const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  // console.log(options)
  // const handleSort = (key: string) => {
  //     let direction: 'asc' | 'desc' = 'asc';
  //     if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
  //     direction = 'desc';
  //     }
  //     setSortConfig({ key, direction });
  // };

  // const sortedOptions = [...options].sort((a, b) => {
  //     if (!sortConfig) return 0;

  //     const aValue = sortConfig.key === 'interest1' ? a.interest1 : a.interest3;
  //     const bValue = sortConfig.key === 'interest1' ? b.interest1 : b.interest3;

  //     if (aValue < bValue) {
  //     return sortConfig.direction === 'asc' ? -1 : 1;
  //     }
  //     if (aValue > bValue) {
  //     return sortConfig.direction === 'asc' ? 1 : -1;
  //     }
  //     return 0;

  // });

  const rows = options.map((option) => {
    return (
      <Table.Tr key={option.bank}>
        <Table.Td>{option.bank}</Table.Td>
        <Table.Td>{option.interest1}</Table.Td>
        <Table.Td>{option.interest3}</Table.Td>
        <Table.Td>{option.interest6}</Table.Td>
        <Table.Td>{option.interest9}</Table.Td>
        <Table.Td>{option.interest12}</Table.Td>
        <Table.Td>{option.interest18}</Table.Td>
        <Table.Td>{option.interest24}</Table.Td>
      </Table.Tr>
    );
  });

  return (
    <>
      <Modal opened={opened} onClose={onClose} size="lg" title="Danh sách lãi suất">
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Bank</Table.Th>
              <Table.Th>1 Month</Table.Th>
              <Table.Th>3 Months</Table.Th>
              <Table.Th>6 Months</Table.Th>
              <Table.Th>9 Months</Table.Th>
              <Table.Th>12 Months</Table.Th>
              <Table.Th>18 Months</Table.Th>
              <Table.Th>24 Months</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Modal>
    </>
  );
}

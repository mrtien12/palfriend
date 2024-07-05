import useScheduleByAccount from '@/hooks/useScheduleByAccount';
import { ScheduleTransaction } from '@/types/transaction';
import { ActionIcon } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconMinus, IconPlus, IconTransfer } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import DeleteScheduleModal from './DeleteScheduleModal/DeleteScheduleModal';
import EditScheduleModal from './EditScheduleModal/EditScheduleModal';
import classes from './ScheduleScreen.module.css';
import ScheduleTable from './ScheduleTable/ScheduleTable';
import AddScheduleTransactionModal from './ScheduleTransactionModal/ScheduleTransactionModal';

export default function ScheduleScreen() {
  const [openedExpense, AddExpenseHandler] = useDisclosure(false);
  const [openedIncome, AddIncomeHandler] = useDisclosure(false);
  const [openedTransfer, AddTransferHandler] = useDisclosure(false);
  const [openedEdit, EditHandler] = useDisclosure(false);
  const [openedDelete, DeleteHandler] = useDisclosure(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<ScheduleTransaction | null>(null);

  const scheduled = useScheduleByAccount();
  const [scheduledTransactions, setScheduledTransactions] =
    useState<ScheduleTransaction[]>(scheduled);

  useEffect(() => {
    setScheduledTransactions(scheduled);
  }, [scheduled]);

  const handleDelete = (id: string) => {
    const transactionToDelete = scheduledTransactions.find(
      (transaction) => transaction.id === id
    );
    if (transactionToDelete) {
      setSelectedTransaction(transactionToDelete);
      DeleteHandler.open();
    }
  };

  const handleEdit = (id: string) => {
    const transactionToEdit = scheduledTransactions.find(
      (transaction) => transaction.id === id
    );
    if (transactionToEdit) {
      setSelectedTransaction(transactionToEdit);
      EditHandler.open();
    }
    console.log(`Edit ${id}`);
  };

  const handleUpdate = (updatedTransaction: ScheduleTransaction) => {
    console.log(updatedTransaction);
    const updatedScheduled = scheduledTransactions.map((transaction) =>
      transaction.id === updatedTransaction.id
        ? updatedTransaction
        : transaction
    );
    console.log(updatedScheduled);
    setScheduledTransactions(updatedScheduled);
  };

  const handleDeleteConfirmed = (id: string) => {
    const updatedScheduled = scheduledTransactions.filter(
      (transaction) => transaction.id !== id
    );
    setScheduledTransactions(updatedScheduled);
  };

  return (
    <>
      <AddScheduleTransactionModal
        opened={openedExpense}
        onClose={AddExpenseHandler.close}
        type="0"
      />
      <AddScheduleTransactionModal
        opened={openedIncome}
        onClose={AddIncomeHandler.close}
        type="1"
      />
      <AddScheduleTransactionModal
        opened={openedTransfer}
        onClose={AddTransferHandler.close}
        type="2"
      />
      {selectedTransaction && (
        <EditScheduleModal
          opened={openedEdit}
          onClose={EditHandler.close}
          transaction={selectedTransaction}
          onUpdate={handleUpdate}
        />
      )}
      {selectedTransaction && (
        <DeleteScheduleModal
          opened={openedDelete}
          onClose={DeleteHandler.close}
          transaction={selectedTransaction}
          onDelete={handleDeleteConfirmed}
        />
      )}

      <ActionIcon
        className={classes.expensebutton}
        color="red"
        variant="filled"
        size="xl"
        radius="xl"
        onClick={AddExpenseHandler.open}
      >
        <IconMinus style={{ width: '100%', height: '100%' }} stroke={1.5} />
      </ActionIcon>

      <ActionIcon
        className={classes.incomebutton}
        color="green"
        variant="filled"
        size="xl"
        radius="xl"
        onClick={AddIncomeHandler.open}
      >
        <IconPlus style={{ width: '100%', height: '100%' }} stroke={1.5} />
      </ActionIcon>

      <ActionIcon
        className={classes.transferbutton}
        color="blue"
        variant="filled"
        size="xl"
        radius="xl"
        onClick={AddTransferHandler.open}
      >
        <IconTransfer style={{ width: '100%', height: '100%' }} stroke={1.5} />
      </ActionIcon>

      <ScheduleTable
        scheduled={scheduledTransactions}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </>
  );
}

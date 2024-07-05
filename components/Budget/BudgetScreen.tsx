'use client';
import BudgetList from '@/components/Budget/BudgetList/BudgetList';
import DeleteBudgetModal from '@/components/Budget/DeleteBudgetModal/DeleteBudgetModal';
import EditBudgetModal from '@/components/Budget/EditBudgetModal/EditBudgetModal';
import useBudgets from '@/hooks/useBudgets';
import { Budget } from '@/types/budget';
import { ActionIcon } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus } from '@tabler/icons-react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useState } from 'react';
import AddBudgetModal from './AddBudgetModal/AddBudgetModal';
import classes from './BudgetScreen.module.css';
import TransactionList from './TransactionList/TransactionList';
export default function BudgetScreen() {
  const session = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/signin');
    },
  });

  const [openDelete, DeleteHandler] = useDisclosure(false);
  const [openEdit, EditHandler] = useDisclosure(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [openAddBudget, AddBudgetHandler] = useDisclosure(false);
  const [openTransactionList, TransactionListHandler] = useDisclosure(false);

  const budgets = useBudgets();
  const handleDelete = (id: string) => {
    let budgetToDelete: Budget | undefined;
    budgetToDelete = budgets.find((budget) => budget.id === id);
    if (budgetToDelete) {
      setSelectedBudget(budgetToDelete);
      DeleteHandler.open();
    }
  };

  const handleEdit = (id: string) => {
    let budgetToEdit: Budget | undefined;
    budgetToEdit = budgets.find((budget) => budget.id === id);
    if (budgetToEdit) {
      setSelectedBudget(budgetToEdit);
      EditHandler.open();
    }
    console.log(`Edit ${id}`);
  };

  const handleDetail = (id: string) => {
    let budgetToDetail: Budget | undefined;
    budgetToDetail = budgets.find((budget) => budget.id === id);
    if (budgetToDetail) {
      setSelectedBudget(budgetToDetail);
      TransactionListHandler.open();
    }
    console.log(`Detail ${id}`);
  };

  return (
    <>
      <AddBudgetModal opened={openAddBudget} onClose={AddBudgetHandler.close} />
      <ActionIcon
        className={classes.incomebutton}
        color="green"
        variant="filled"
        size="xl"
        radius="xl"
        onClick={AddBudgetHandler.open}
      >
        <IconPlus style={{ width: '100%', height: '100%' }} stroke={1.5} />
      </ActionIcon>
      {selectedBudget && (
        <TransactionList
          budgetId={selectedBudget.id}
          opened={openTransactionList}
          onClose={TransactionListHandler.close}
        />
      )}
      {selectedBudget && (
        <DeleteBudgetModal
          budget={selectedBudget}
          onClose={DeleteHandler.close}
          opened={openDelete}
        />
      )}
      {selectedBudget && (
        <EditBudgetModal
          budget={selectedBudget}
          onClose={EditHandler.close}
          opened={openEdit}
        />
      )}
      {budgets && (
        <BudgetList
          budgets={budgets}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onDetail={handleDetail}
        />
      )}
    </>
  );
}

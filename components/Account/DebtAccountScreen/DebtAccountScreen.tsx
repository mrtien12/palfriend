import TransactionTable from '@/components/Transaction/TransactionTable/TransactionTable';
import useDebtStat from '@/hooks/useDebtStat';
import useTransactionByAccount from '@/hooks/useTransactionByAccount';
import { Transaction } from '@/types/transaction';
import { ActionIcon, Paper } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSettings,IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import classes from './DebtAccountScreen.module.css';
import DebtState from './DebtState/DebtState';
import EditDebtModal from './EditDebtAccount/EditDebtAccount';
import DeleteAccountModal from '@/components/Account/DeleteAccountModal/DeleteAccount';
import DeleteTransactionModal from '@/components/Transaction/TransactionTable/DeleteTransactionModal/DeleteTransactionModal';
import EditExpenseModal from '@/components/Transaction/EditExpenseModal/EditExpenseModal';

interface DebtAccountScreenProps {
  id: string;
}

export default function DebtAccountScreen({ id }: DebtAccountScreenProps) {
  console.log(id);
  const data = useDebtStat(id);
  const transactions = useTransactionByAccount(id);

  const [openSetting, AddSettingHandler] = useDisclosure(false);

  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [openedDelete, Deletehandler] = useDisclosure(false);
  const [openedExpenseEdit, EditExpensehandler] = useDisclosure(false);
  const [openedRemove, RemoveHandler] = useDisclosure(false);

  const router = useRouter();

  const handleNavigate = (id: string) => {
    const transactionToNavigate = transactions.find(
      (transaction) => transaction.id === id
    );
    if (transactionToNavigate) {
      router.push(`/accounts/${transactionToNavigate.toAccount}`);
    }
  };

  const [transactionList, setTransactionList] =
    useState<Transaction[]>(transactions);
  useEffect(() => {
    setTransactionList(transactions);
  }, [transactions]);

  const handleDelete = (id: string) => {
    const transactionToDelete = transactions.find(
      (transaction) => transaction.id === id
    );

    console.log(transactionToDelete);
    if (transactionToDelete) {
      setSelectedTransaction(transactionToDelete);
      Deletehandler.open();
    }
  };

  const handleEdit = (id: string) => {
    const transactionToEdit = transactions.find(
      (transaction) => transaction.id === id
    );
    if (transactionToEdit) {
      setSelectedTransaction(transactionToEdit);
      if (transactionToEdit.type === '0') {
        EditExpensehandler.open();
      }
    }
    console.log(transactionToEdit);
    console.log(`Edit ${id}`);
  };
  const handleTransactionUpdate = (updatedTransaction: Transaction) => {
    const updatedTransactions = transactionList.map((transaction) =>
      transaction.id === updatedTransaction.id
        ? updatedTransaction
        : transaction
    );
    setTransactionList(updatedTransactions);
  };

  return (
    <>
      {data && <DebtState account={data} />}
      {data && (
        <EditDebtModal
          opened={openSetting}
          onClose={AddSettingHandler.close}
          account={data}
        />
      )}

      {data &&
        <DeleteAccountModal 
          opened={openedRemove}
          onClose={RemoveHandler.close}
          accountId={id}
   
        />
      }

      {selectedTransaction && (
        <DeleteTransactionModal
          opened={openedDelete}
          onClose={Deletehandler.close}
          accountId={id}
          transaction={selectedTransaction}
        />
      )}


      {selectedTransaction && selectedTransaction.type === '0' && (
        <EditExpenseModal
          opened={openedExpenseEdit}
          onClose={EditExpensehandler.close}
          accountId={id}
          transaction={selectedTransaction}
          onUpdate={handleTransactionUpdate}
        />
      )}
      <div className={classes.buttonContainer}>
        <ActionIcon
          className={classes.settingbutton}
          color="green"
          variant="filled"
          size="xl"
          radius="xl"
          onClick={AddSettingHandler.open}
        >
          <IconSettings
            style={{ width: '100%', height: '100%' }}
            stroke={1.5}
          />
        </ActionIcon>

        <ActionIcon
          className={classes.removebutton}
          color="orange"
          variant="filled"
          size="xl"
          radius="xl"
          onClick={RemoveHandler.open}
        >
          <IconTrash
            style={{ width: '100%', height: '100%' }}
            stroke={1.5}
          />
        </ActionIcon>
      </div>

      <Paper
        radius="md"
        shadow="sm"
        withBorder
        className={classes.card}
        mb={40}
      >
        <TransactionTable
          transactions={transactions}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onNavigate={handleNavigate}
        />
      </Paper>
    </>
  );
}

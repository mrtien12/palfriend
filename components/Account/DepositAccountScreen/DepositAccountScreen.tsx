import EditTransferModal from '@/components/Transaction/EditExpenseModal/EditTransferModal';
import SavingAddTransferModal from '@/components/Transaction/SavingAccount/AddTransferModal/AddTransferModal';
import TransactionTable from '@/components/Transaction/TransactionTable/TransactionTable';
import useAccountStat from '@/hooks/useAccountStat';
import useTransactionByAccount from '@/hooks/useTransactionByAccount';
import { Transaction } from '@/types/transaction';
import { ActionIcon, Paper } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSettings,IconTrash , IconTransfer } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import classes from './DepositAccountScreen.module.css';
import DepositChart from './DepositChart/DepositChart';
import DepositState from './DepositState/DepositState';
import EditDepositModal from './EditDepositModal/EditDepositModal';
import DeleteAccountModal from '@/components/Account/DeleteAccountModal/DeleteAccount';

import DeleteTransactionModal from '@/components/Transaction/TransactionTable/DeleteTransactionModal/DeleteTransactionModal';
interface DepositAccountScreenProps {
  id: string;
}

export default function DepositAccountScreen({
  id,
}: DepositAccountScreenProps) {
  const data = useAccountStat(id);
  const transactions = useTransactionByAccount(id);
  // const [openedExpense, AddExpenseHandler] = useDisclosure(false);
  // const [openedIncome, AddIncomeHandler] = useDisclosure(false);
  const [openedTransfer, AddTransferHandler] = useDisclosure(false);
  const [openedSetting, AddSettingHandler] = useDisclosure(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [openedDelete, Deletehandler] = useDisclosure(false);
  const [openedTransferEdit, EditTransferhandler] = useDisclosure(false);
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
      if (transactionToEdit.type === '2') {
        EditTransferhandler.open();
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
      {data && <DepositState account={data} />}
      {data && (
        <DepositChart
          principal={data.amount}
          interest={data.interestRate}
          startDate={data.startDate}
        />
      )}
      {data && (
        <EditDepositModal
          opened={openedSetting}
          onClose={AddSettingHandler.close}
          deposit={data}
        />
      )}
      {data && (
        <SavingAddTransferModal
          opened={openedTransfer}
          onClose={AddTransferHandler.close}
          accountid={data.id}
          phase={data.phase}
          settlementDate={data.settlementDate}
        />
      )}

        {data && (
          <DeleteAccountModal
          
            opened={openedRemove}
            onClose={RemoveHandler.close}
            accountId={id}
          />
        )}

      {data && selectedTransaction && (
        <DeleteTransactionModal
          opened={openedDelete}
          onClose={Deletehandler.close}
          transaction={selectedTransaction}
          accountId={data.id}
        />
      )}
      {data && selectedTransaction && (
        <EditTransferModal
          opened={openedTransferEdit}
          onClose={EditTransferhandler.close}
          fromAccount={data.id}
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
          className={classes.transferbutton}
          color="blue"
          variant="filled"
          size="xl"
          radius="xl"
          onClick={AddTransferHandler.open}
        >
          <IconTransfer
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

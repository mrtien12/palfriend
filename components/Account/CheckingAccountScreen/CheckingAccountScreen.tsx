import AddExpenseModal from '@/components/Transaction/AddExpenseModal/AddExpenseModal';
import AddIncomeModal from '@/components/Transaction/AddIncomeModal/AddIncomeModal';
import AddTransferModal from '@/components/Transaction/AddTransferModal/AddTransferModal';
import EditExpenseModal from '@/components/Transaction/EditExpenseModal/EditExpenseModal';
import EditIncomeModal from '@/components/Transaction/EditExpenseModal/EditIncomeModal';
import EditTransferModal from '@/components/Transaction/EditExpenseModal/EditTransferModal';
import DeleteTransactionModal from '@/components/Transaction/TransactionTable/DeleteTransactionModal/DeleteTransactionModal';
import TransactionTable from '@/components/Transaction/TransactionTable/TransactionTable';
import useCheckingAccountStat from '@/hooks/useCheckingAccountStat';
import useTransactionByAccount from '@/hooks/useTransactionByAccount';
import DeleteAccountModal from '../DeleteAccountModal/DeleteAccount';
import { Transaction } from '@/types/transaction';
import { ActionIcon, Paper } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconMinus,
  IconPlus,
  IconSettings,
  IconTransfer,
  IconTrash,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import classes from './CheckingAccountScreen.module.css';
import CheckingStat from './CheckingStat/CheckingStat';
import EditCheckingModal from './EditCheckingModal/EditCheckingModal';
interface CheckingAccountScreenProps {
  id: string;
}

export default function CheckingAccountScreen({
  id,
}: CheckingAccountScreenProps) {
  const [openedExpense, AddExpenseHandler] = useDisclosure(false);
  const [openedTransfer, AddTransferHandler] = useDisclosure(false);
  const [openedIncome, AddIncomeHandler] = useDisclosure(false);
  const [openedExpenseEdit, EditExpensehandler] = useDisclosure(false);
  const [openedIncomeEdit, EditIncomehandler] = useDisclosure(false);
  const [openedTransferEdit, EditTransferhandler] = useDisclosure(false);
  const [openedDelete, Deletehandler] = useDisclosure(false);
  const [openedSetting, AddSettingHandler] = useDisclosure(false);
  const [openedRemove, RemoveHandler] = useDisclosure(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const router = useRouter();

  const transactions = useTransactionByAccount(id);
  console.log(transactions);
  const accountStat = useCheckingAccountStat(id);

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
      } else if (transactionToEdit.type === '1') {
        EditIncomehandler.open();
      } else if (transactionToEdit.type === '2') {
        EditTransferhandler.open();
      }
    }
    console.log(transactionToEdit);
    console.log(`Edit ${id}`);
  };

  const handleNavigate = (id: string) => {
    const transactionToNavigate = transactions.find(
      (transaction) => transaction.id === id
    );
    if (transactionToNavigate) {
      router.push(`/accounts/${transactionToNavigate.toAccount}`);
    }
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
      {accountStat && <CheckingStat account={accountStat} />}
      {selectedTransaction && (
        <DeleteTransactionModal
          opened={openedDelete}
          onClose={Deletehandler.close}
          accountId={id}
          transaction={selectedTransaction}
        />
      )}

      {/** Add Transaction here **/}
      {accountStat && (
        <AddExpenseModal
          opened={openedExpense}
          onClose={AddExpenseHandler.close}
          accountId={id}
        />
      )}
      {accountStat && (
        <AddIncomeModal
          opened={openedIncome}
          onClose={AddIncomeHandler.close}
          accountId={id}
        />
      )}
      {accountStat && (
        <AddTransferModal
          opened={openedTransfer}
          onClose={AddTransferHandler.close}
          fromAccount={id}
        />
      )}

      {/** Edit Transaction here **/}
      {selectedTransaction && selectedTransaction.type === '0' && (
        <EditExpenseModal
          opened={openedExpenseEdit}
          onClose={EditExpensehandler.close}
          accountId={id}
          transaction={selectedTransaction}
          onUpdate={handleTransactionUpdate}
        />
      )}
      {selectedTransaction && selectedTransaction.type === '1' && (
        <EditIncomeModal
          opened={openedIncomeEdit}
          onClose={EditIncomehandler.close}
          accountId={id}
          transaction={selectedTransaction}
          onUpdate={handleTransactionUpdate}
        />
      )}

      {selectedTransaction && selectedTransaction.type === '2' && (
        <EditTransferModal
          opened={openedTransferEdit}
          onClose={EditTransferhandler.close}
          fromAccount={id}
          transaction={selectedTransaction}
          onUpdate={handleTransactionUpdate}
        />
      )}

      {/* Edit Account */}
      {accountStat && (
        <EditCheckingModal
          opened={openedSetting}
          onClose={AddSettingHandler.close}
          account={accountStat}
        />
      )}

      {/* Remove Account */}
      {accountStat && (
        <DeleteAccountModal
          opened={openedRemove}
          onClose={RemoveHandler.close}
          accountId={id}
        />
      )}
      <div className={classes.buttonContainer}>
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
          transactions={transactionList}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onNavigate={handleNavigate}
        />
      </Paper>
    </>
  );
}

import CreditAddExpenseModal from '@/components/Transaction/CreditAccount/AddExpenseModal/AddExpenseModal';
import CreditEditExpenseModal from '@/components/Transaction/CreditAccount/EditExpenseModal/EditExpenseModal';
import DeleteTransactionModal from '@/components/Transaction/TransactionTable/DeleteTransactionModal/DeleteTransactionModal';
import TransactionTable from '@/components/Transaction/TransactionTable/TransactionTable';
import useCreditStat from '@/hooks/useCreditStat';
import useTransactionByAccount from '@/hooks/useTransactionByAccount';
import { Transaction } from '@/types/transaction';
import { ActionIcon,  Paper } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconMinus, IconTrash, IconSettings } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import CreditAccountStat from './CreditAccountStat/CreditAccountStat';
import classes from './CreditCardAccountScreen.module.css';
import EditCreditAccountModal from './EditCreditCardAccountModal/EditCreditCardAccountModal';
import DeleteAccountModal from '@/components/Account/DeleteAccountModal/DeleteAccount';

interface CreditCardAccountScreenProps {
  id: string;
}

export default function CreditCardAccountScreen({
  id,
}: CreditCardAccountScreenProps) {
  const [openSetting, AddSettingHandler] = useDisclosure(false);
  const [openExpense, AddExpenseHandler] = useDisclosure(false);
  const [openedDelete, Deletehandler] = useDisclosure(false);
  const [openedExpenseEdit, EditExpensehandler] = useDisclosure(false);
  const [openedRemove, RemoveHandler] = useDisclosure(false);

  const router = useRouter();
  const transactions = useTransactionByAccount(id);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const data = useCreditStat(id);

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
      EditExpensehandler.open();
    }
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
      {data && <CreditAccountStat account={data} />}
      {data && (
        <CreditAddExpenseModal
          opened={openExpense}
          onClose={AddExpenseHandler.close}
          accountid={id}
        />
      )}
      {data && (
        <EditCreditAccountModal
          opened={openSetting}
          onClose={AddSettingHandler.close}
          account={data}
        />
      )}

      {data && (
        <DeleteAccountModal
        
          opened={openedRemove}
          onClose={RemoveHandler.close}
          accountId={id}
        />
      )}

      {selectedTransaction && (
        <CreditEditExpenseModal
          opened={openedExpenseEdit}
          onClose={EditExpensehandler.close}
          accountId={id}
          transaction={selectedTransaction}
          onUpdate={handleTransactionUpdate}
        />
      )}
      {selectedTransaction && (
        <DeleteTransactionModal
          opened={openedDelete}
          onClose={Deletehandler.close}
          transaction={selectedTransaction}
          accountId={id}
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
          onDelete={handleDelete}
          onEdit={handleEdit}
          onNavigate={handleNavigate}
        />
      </Paper>
    </>
  );
}

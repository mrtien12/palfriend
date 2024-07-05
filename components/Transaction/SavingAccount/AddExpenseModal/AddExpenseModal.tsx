import { db } from '@/firebase';
import useCategory from '@/hooks/useCategory';
import { Button, Modal, NumberInput, Select, TextInput } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  increment,
  updateDoc,
} from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import classes from './AddExpenseModal.module.css';

interface SavingAddExpenseModalProps {
  opened: boolean;
  onClose: () => void;
  accountid: string;
}

export default function SavingAddExpenseModal({
  opened,
  onClose,
  accountid,
}: SavingAddExpenseModalProps) {
  const session = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/signin');
    },
  });

  const form = useForm({
    initialValues: {
      amount: 0,
      account: accountid,
      category: '',
      date: new Date(),
      memo: '',
      type: '0',
    },
  });
  const handleClose = () => {
    form.reset();
    onClose();
  };

  const handleAddExpense = async (values: any) => {
    values.account = accountid;
    const isBalanceUpdated = await updateAccountBalance(values);
    if (isBalanceUpdated) {
      await addDoc(
        collection(
          db,
          'users',
          session.data?.user?.email as string,
          'transactions'
        ),
        values
      );
      notifications.show({
        title: 'Expense Added',
        message: 'Expense has been added successfully',
        color: 'teal',
        icon: null,
      });
    }
  };

  const updateAccountBalance = async (transaction: any) => {
    const accountRef = doc(
      db,
      'users',
      session.data?.user?.email as string,
      'accounts',
      transaction.account
    );
    const accountDoc = await getDoc(accountRef);
    const accountData = accountDoc.data();

    if (!accountData) {
      notifications.show({
        title: 'Account Error',
        message: 'Account does not exist',
        color: 'red',
        icon: null,
      });
      return false;
    }

    const currentBalance = accountData.amount;

    if (transaction.type === '0') {
      if (transaction.amount > currentBalance) {
        notifications.show({
          title: 'Insufficient Balance',
          message: 'The expense amount exceeds the current account balance',
          color: 'red',
          icon: null,
        });
        return false;
      }
      await updateDoc(accountRef, {
        amount: increment(-transaction.amount),
      });
    } else if (transaction.type === '1') {
      await updateDoc(accountRef, {
        amount: increment(transaction.amount),
      });
    }
    return true;
  };

  const category = useCategory('0');
  // const account = useAccounts();
  // const accountOption = account.map((account) => ({
  //     value: account.id,
  //     label: account.name,
  // }));
  return (
    <>
      <Modal opened={opened} onClose={handleClose} title="Thêm giao dịch">
        <form
          onSubmit={form.onSubmit((values) =>
            handleAddExpense(values).then(() => {
              handleClose();
            })
          )}
          className={classes.formWrapper}
        >
          {/* <Select
                        label="Account"
                        placeholder="Select Account"
                        data={accountOption}
                        required
                        {...form.getInputProps('account')}
                    /> */}
          <NumberInput
            label="Số tiền"
            placeholder="Chọn số tiền"
            required
            {...form.getInputProps('amount')}
          />
          <Select
            label="Danh mục"
            placeholder="Chọn danh mục"
            data={category}
            required
            {...form.getInputProps('category')}
          />
          <DatePickerInput
            label="Ngày"
            placeholder="Chọn ngày"
            required
            maxDate={new Date()}
            {...form.getInputProps('date')}
          />
          <TextInput
            label="Ghi chú"
            placeholder="Chọn ghi chú"
            {...form.getInputProps('memo')}
          />
          <Button type="submit" mt="md">
            Thêm giao dịch
          </Button>
        </form>
      </Modal>
    </>
  );
}

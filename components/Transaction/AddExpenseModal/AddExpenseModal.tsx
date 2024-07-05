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
  getDocs,
  increment,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import classes from './AddExpenseModal.module.css';

interface AddExpenseModalProps {
  opened: boolean;
  onClose: () => void;
  accountId: string;
}

export default function AddExpenseModal({
  opened,
  onClose,
  accountId,
}: AddExpenseModalProps) {
  const session = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/signin');
    },
  });

  const form = useForm({
    initialValues: {
      amount: 0,
      account: accountId,
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

  const category = useCategory('0');
  // const account = useAccounts();
  // // const accountOption = account.map((account) => ({
  // //     value: account.id,
  // //     label: account.name,
  // // }));

  const handleAddExpense = async (values: any) => {
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
      updateBudget(values);
      notifications.show({
        title: 'Expense Added',
        message: 'Expense has been added successfully',
        color: 'teal',
        icon: null,
      });
    }
  };
  //update budget
  const updateBudget = async (transaction: any) => {
    const categoryParts = transaction.category.split(' / ');

    if (categoryParts.length === 1) {
      const budgetRef = query(
        collection(db, 'users', session.data?.user?.email as string, 'budgets'),
        where('category', '==', transaction.category),
        where('startDate', '<=', transaction.date),
        where('endDate', '>=', transaction.date),
        where('accounts', 'array-contains', accountId)
      );

      const budgetDoc = await getDocs(budgetRef);
      if (budgetDoc.empty) {
        return;
      }

      budgetDoc.forEach(async (doc) => {
        // const budgetData = doc.data();
        await updateDoc(doc.ref, {
          currentAmount: increment(transaction.amount),
        });
      });
    } else {
      console.log(transaction.category + '\uf8ff' + 'hello');
      const budgetRef = query(
        collection(db, 'users', session.data?.user?.email as string, 'budgets'),
        where('category', '>=', categoryParts[0]),
        where('category', '<', categoryParts[0] + '\uf8ff'),
        where('startDate', '<=', transaction.date),
        where('endDate', '>=', transaction.date),
        where('accounts', 'array-contains', accountId)
      );

      const budgetDoc = await getDocs(budgetRef);

      if (budgetDoc.empty) {
        return;
      }

      budgetDoc.forEach(async (doc) => {
        // const budgetData = doc.data();
        await updateDoc(doc.ref, {
          currentAmount: increment(transaction.amount),
        });
      });
    }
  };

  const updateAccountBalance = async (transaction: any) => {
    transaction.account = accountId;
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
        message: 'Tài khoản không tồn tại',
        color: 'red',
        icon: null,
      });
      return false;
    }

    const currentBalance = accountData.amount;

    if (transaction.amount > currentBalance) {
      notifications.show({
        title: 'Insufficient Balance',
        message: 'Giao dịch vượt quá số dư hiện tại',
        color: 'red',
        icon: null,
      });
      return false;
    }
    await updateDoc(accountRef, {
      amount: increment(-transaction.amount),
    });
    return true;
  };

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
            placeholder="Amount"
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
            placeholder="Ghi chú"
            {...form.getInputProps('memo')}
          />
          <Button type="submit" mt="md">
            Thêm chi tiêu
          </Button>
        </form>
      </Modal>
    </>
  );
}

import { db } from '@/firebase';
import useCategory from '@/hooks/useCategory';
import { Transaction } from '@/types/transaction';
import { Button, Modal, NumberInput, Select, TextInput } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
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
import { useEffect } from 'react';
import classes from './EditExpenseModal.module.css';

interface EditExpenseModalProps {
  opened: boolean;
  onClose: () => void;
  accountId: string;
  transaction: Transaction | null;
  onUpdate: (transaction: Transaction) => void;
}

export default function CreditEditExpenseModal({
  opened,
  onClose,
  accountId,
  transaction,
  onUpdate,
}: EditExpenseModalProps) {
  const session = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/signin');
    },
  });

  const form = useForm({
    initialValues: {
      id: transaction?.id,
      amount: transaction?.amount,
      type: transaction?.type,
      category: transaction?.category,
      date: transaction?.date,
      memo: transaction?.memo,
    },
  });

  useEffect(() => {
    form.setValues({
      id: transaction?.id,
      amount: transaction?.amount,
      type: transaction?.type,
      category: transaction?.category,
      date: transaction?.date,
      memo: transaction?.memo,
    });
  }, [transaction]);

  const category = useCategory('0');
  if (!transaction) return null;
  const handleEditExpense = async (values: any) => {
    try {
      // Fetch current account balance and limit
      const accountDoc = await getDoc(
        doc(
          db,
          'users',
          session.data?.user?.email as string,
          'accounts',
          accountId
        )
      );
      const accountData = accountDoc.data();

      if (!accountData) {
        notifications.show({
          title: 'Error',
          message: 'Tài khoản không tồn tại',
          color: 'red',
        });
        return;
      }

      const currentBalance = accountData.amount;
      const creditLimit = accountData.limit;
      const newAmount = values.amount;
      const oldAmount = transaction.amount;

      // Calculate the new balance after the edit
      const newBalance = currentBalance + oldAmount - newAmount;

      // Check if the new balance exceeds the credit limit
      if (Math.abs(newBalance) > creditLimit) {
        notifications.show({
          title: 'Invalid amount',
          message: 'Chi tiêu vượt quá hạn mức tín dụng',
          color: 'red',
        });
        return;
      }

      // Update the transaction
      await updateDoc(
        doc(
          db,
          'users',
          session.data?.user?.email as string,
          'transactions',
          transaction.id
        ),
        {
          amount: newAmount,
          type: values.type,
          category: values.category,
          date: values.date,
          memo: values.memo,
        }
      );

      // Update the account balance
      await updateDoc(
        doc(
          db,
          'users',
          session.data?.user?.email as string,
          'accounts',
          accountId
        ),
        {
          amount: newBalance,
        }
      );

      const updatedTransaction: Transaction = {
        ...transaction,
        ...values,
      };

      updateBudget(values);

      onUpdate(updatedTransaction);

      notifications.show({
        title: 'Success',
        message: 'Chi tiêu được cập nhật thành công',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Chi tiêu không thể cập nhật',
        color: 'red',
      });
    }
  };

  const updateBudget = async (values: any) => {
    const categoryParts = values.category.split(' / ');

    if (categoryParts.length === 1) {
      const budgetRef = query(
        collection(db, 'users', session.data?.user?.email as string, 'budgets'),
        where('category', '==', values.category),
        where('startDate', '<=', values.date),
        where('endDate', '>=', values.date),
        where('accounts', 'array-contains', accountId)
      );

      const budgetDoc = await getDocs(budgetRef);
      if (budgetDoc.empty) {
        return;
      }

      budgetDoc.forEach(async (doc) => {
        // const budgetData = doc.data();
        await updateDoc(doc.ref, {
          currentAmount: increment(values.amount - transaction.amount),
        });
      });
    } else {
      console.log(values.category + '\uf8ff' + 'hello');
      const budgetRef = query(
        collection(db, 'users', session.data?.user?.email as string, 'budgets'),
        where('category', '>=', categoryParts[0]),
        where('category', '<', categoryParts[0] + '\uf8ff'),
        where('startDate', '<=', values.date),
        where('endDate', '>=', values.date),
        where('accounts', 'array-contains', accountId)
      );

      const budgetDoc = await getDocs(budgetRef);

      if (budgetDoc.empty) {
        return;
      }

      budgetDoc.forEach(async (doc) => {
        // const budgetData = doc.data();
        await updateDoc(doc.ref, {
          currentAmount: increment(values.amount - transaction.amount),
        });
      });
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };
  return (
    <>
      <Modal opened={opened} onClose={handleClose} title="Chỉnh sửa giao dịch">
        <form
          onSubmit={form.onSubmit((values) =>
            handleEditExpense(values).then(() => {
              handleClose();
            })
          )}
          className={classes.formWrapper}
        >
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
            Lưu
          </Button>
        </form>
      </Modal>
    </>
  );
}

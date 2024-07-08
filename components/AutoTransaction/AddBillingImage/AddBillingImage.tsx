'use client';
import { db } from '@/firebase';
import useAccounts from '@/hooks/useAccount';
import useCategory from '@/hooks/useCategory';
import {
  Button,
  FileInput,
  Modal,
  NumberInput,
  Select,
  TextInput,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { parse as parseDate } from 'date-fns';
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
import { useState } from 'react';
import classes from './AddBillingImage.module.css';

interface AddBillingImageModalProps {
  onClose: () => void;
  opened: boolean;
}

export default function AddBillingImageModal({
  onClose,
  opened,
}: AddBillingImageModalProps) {
  const [file, setFile] = useState<File | null>();
  const [text, setText] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);
  const session = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/signin');
    },
  });
  const form = useForm({
    initialValues: {
      amount: 0,
      account: '',
      memo: '',
      type: '0',
      date: new Date(),
      category: '',
    },
  });
  const accounts = useAccounts();
  const category = useCategory('0');
  const availableAccount = accounts.filter(
    (account) => account.type === '0' || account.type == '3'
  );
  const handleFileChange = async (file: File | null) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      } else {
        const data = await response.json();
        console.log('Received data:', data); // Debugging line

        const parsedDate = parseDate(data.date, 'dd-MM-yyyy', new Date());
        if (isNaN(parsedDate.getTime())) {
          console.error('Invalid date received:', data.date);
        } else {
          form.setFieldValue('date', parsedDate);
        }

        console.log(data.amount);
        const amount = parseFloat(data.amount);
        console.log(amount);
        if (isNaN(amount)) {
          console.error('Invalid amount received:', data.amount);
        } else {
          form.setFieldValue('amount', amount);
        }
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleAddExpense = async (values: any) => {
    const account = accounts.find((acc) => acc.id === values.account);
    if (!account) {
      notifications.show({
        title: 'Account Error',
        message: 'Tài khoản không tồn tại',
        color: 'red',
      });
      return;
    }
    if (account.type === '0') {
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
          message: 'Chi tiêu dược thêm thành công',
          color: 'teal',
          icon: null,
        });
      }
    } else {
      const isBalanceUpdated = await updateAccountBalanceCredit(values); // Handle normal account type
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
          message: 'Chj tiêu được thêm thành công',
          color: 'teal',
          icon: null,
        });
      }
    }
  };

  const updateBudget = async (transaction: any) => {
    const categoryParts = transaction.category.split(' / ');

    if (categoryParts.length === 1) {
      const budgetRef = query(
        collection(db, 'users', session.data?.user?.email as string, 'budgets'),
        where('category', '==', transaction.category),
        where('startDate', '<=', transaction.date),
        where('endDate', '>=', transaction.date),
        where('accounts', 'array-contains', transaction.account)
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
        where('accounts', 'array-contains', transaction.account)
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
    // transaction.account = accountId;
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
        message: 'Số tiền chi vượt quá số dư hiện tại của tài khoản',
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

  const updateAccountBalanceCredit = async (transaction: any) => {
    // transaction.account = accountid;
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

    const viableBalance = accountData.limit + accountData.amount;

    if (transaction.amount > viableBalance) {
      notifications.show({
        title: 'Insufficient Balance',
        message: 'Số tiền chi vượt quá số dư hiện tại của tài khoản',
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

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Thêm chi tiêu qua hóa đơn"
      size="md"
    >
      <form
        onSubmit={form.onSubmit((values) =>
          handleAddExpense(values).then(() => {
            handleClose();
          })
        )}
        className={classes.formWrapper}
      >
        <Select
          label="Tài khoản"
          placeholder="Chọn tài khoản"
          data={availableAccount.map((account) => ({
            label: account.name,
            value: account.id,
          }))}
          required
          {...form.getInputProps('account')}
        />
        <FileInput
          required
          label="Thêm hình ảnh"
          placeholder="Chọn file"
          accept="image/png,image/jpeg,image/jpg"
          onChange={(file) => {
            setFile(file);
            handleFileChange(file);
          }}
        />
        <NumberInput
          label="Số tiền"
          placeholder="Chọn số tiền"
          required
          {...form.getInputProps('amount')}
        />

        <DatePickerInput
          label="Ngày"
          placeholder="Chọn ngày"
          required
          maxDate={new Date()}
          {...form.getInputProps('date')}
        />
        <Select
          label="Danh mục"
          placeholder="Chọn danh mục"
          data={category}
          required
          {...form.getInputProps('category')}
        />
        <TextInput
          label="Ghi chú"
          placeholder="Chọn ghi chú"
          required
          {...form.getInputProps('memo')}
        />
        <Button type="submit" color="blue" mt="md">
          Xác nhận
        </Button>
      </form>
    </Modal>
  );
}

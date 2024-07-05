import { db } from '@/firebase';
import useAccounts from '@/hooks/useAccount';
import useCategory from '@/hooks/useCategory';
import { ScheduleTransaction } from '@/types/transaction';
import { Button, Modal, NumberInput, Select, TextInput } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { doc, updateDoc } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import classes from './EditScheduleModal.module.css';

interface EditScheduleTransactionModalProps {
  opened: boolean;
  onClose: () => void;
  transaction: ScheduleTransaction | null;
  onUpdate: (transaction: ScheduleTransaction) => void;
}

export default function EditScheduleTransactionModal({
  opened,
  onClose,
  transaction,
  onUpdate,
}: EditScheduleTransactionModalProps) {
  const session = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/signin');
    },
  });

  const accounts = useAccounts();
  const category = useCategory(transaction ? transaction.type : '0');

  const form = useForm({
    initialValues: {
      id: transaction ? transaction.id : '',
      amount: transaction ? transaction.amount : 0,
      account: transaction ? transaction.account : '',
      toAccount: transaction ? transaction.toAccount || '' : '',
      category: transaction ? transaction.category : '',
      date: transaction ? transaction.date : new Date(),
      memo: transaction ? transaction.memo : '',
      frequency: transaction ? transaction.frequency : '4',
    },
  });

  useEffect(() => {
    if (transaction) {
      form.setValues({
        id: transaction.id,
        amount: transaction.amount,
        account: transaction.account,
        toAccount: transaction.toAccount || '',
        category: transaction.category,
        date: transaction.date,
        memo: transaction.memo,
        frequency: transaction.frequency,
      });
    }
  }, [transaction]);

  const handleClose = () => {
    form.reset();
    onClose();
  };
  if (transaction === null) return null;

  const handleEditTransaction = async (values: any) => {
    // try {
    values.email = session.data?.user?.email;
    const upcomingDate = getUpcomingDate(values.date, values.frequency);
    const updatedTransaction = {
      ...values,
      upcomingDate,
    };

    await updateDoc(
      doc(
        db,
        'users',
        session.data?.user?.email as string,
        'scheduled',
        transaction.id
      ),
      updatedTransaction
    );
    console.log(updatedTransaction);
    onUpdate(updatedTransaction);
    console.log(updatedTransaction);

    notifications.show({
      title: 'Success',
      message: 'Giao dịch dự chi đã được cập nhật',
      color: 'green',
    });

    // } catch (error) {
    //     notifications.show({
    //         title: 'Error',
    //         message: 'Failed to update scheduled transaction',
    //         color: 'red',
    //     });
    // }
  };

  const getUpcomingDate = (date: Date, frequency: string): Date => {
    const upcomingDate = new Date(date);
    switch (frequency) {
      case '0': // Daily
        upcomingDate.setDate(upcomingDate.getDate() + 1);
        break;
      case '1': // Weekly
        upcomingDate.setDate(upcomingDate.getDate() + 7);
        break;
      case '2': // Monthly
        const day = date.getDate();
        upcomingDate.setMonth(upcomingDate.getMonth() + 1);
        if (day > 28) {
          const lastDayOfMonth = new Date(
            upcomingDate.getFullYear(),
            upcomingDate.getMonth() + 1,
            0
          ).getDate();
          upcomingDate.setDate(Math.min(day, lastDayOfMonth));
        } else {
          upcomingDate.setDate(day);
        }
        break;
      case '3': // Yearly
        upcomingDate.setFullYear(upcomingDate.getFullYear() + 1);
        break;
      default: // One Time
        break;
    }
    return upcomingDate;
  };

  // Calculate tomorrow's date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const fromAccountOptions = accounts
    .filter((account) => account.type !== '2' || transaction?.type === '2') // Exclude debt accounts for expense and income, include for transfer
    .map((account) => ({
      value: account.id,
      label: account.name,
    }));

  const toAccountOptions = accounts.map((account) => ({
    value: account.id,
    label: account.name,
  }));

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Chỉnh sửa giao dịch dự chi"
    >
      <form
        onSubmit={form.onSubmit((values) =>
          handleEditTransaction(values).then(() => {
            handleClose();
          })
        )}
        className={classes.formWrapper}
      >
        {transaction?.type !== '2' ? (
          <>
            <Select
              label="Tài khoản"
              placeholder="Chọn tài khoản"
              data={fromAccountOptions}
              required
              {...form.getInputProps('account')}
            />
          </>
        ) : (
          <>
            <Select
              label="Từ tài khoản"
              placeholder="Chọn tài khoản"
              data={fromAccountOptions}
              required
              {...form.getInputProps('account')}
            />
            <Select
              label="Tới tài khoản"
              placeholder="Chọn tài khoản"
              data={toAccountOptions}
              required
              {...form.getInputProps('toAccount')}
            />
          </>
        )}
        <NumberInput
          label="Số tiền"
          placeholder="Chọn số tiền"
          required
          {...form.getInputProps('amount')}
        />
        {transaction?.type !== '2' && (
          <Select
            label="Danh mục"
            placeholder="Chọn danh mục"
            data={category}
            required
            {...form.getInputProps('category')}
          />
        )}
        <DatePickerInput
          label="Ngày gần nhất"
          placeholder="Chọn ngày"
          required
          minDate={tomorrow}
          {...form.getInputProps('date')}
        />
        <Select
          label="Tần suất"
          placeholder="Chọn tần suất"
          data={[
            { value: '0', label: 'Hàng ngày' },
            { value: '1', label: 'Hàng tuần' },
            { value: '2', label: 'Hàng tháng' },
            { value: '3', label: 'Hàng năm' },
            { value: '4', label: 'Một lần' },
          ]}
          required
          {...form.getInputProps('frequency')}
        />
        <TextInput
          label="Ghi nhớ"
          placeholder="Chọn ghi nhớ"
          {...form.getInputProps('memo')}
        />
        <Button type="submit" mt="md">
          Xác nhận
        </Button>
      </form>
    </Modal>
  );
}

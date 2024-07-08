import { db } from '@/firebase';
import useAccounts from '@/hooks/useAccount';
import useCategory from '@/hooks/useCategory';
import useSavingAccounts from '@/hooks/useSavingAccount';
import { Button, Modal, NumberInput, Select, TextInput } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { addDoc, collection } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import classes from './ScheduleTransactionModal.module.css';

interface AddScheduleTransactionModalProps {
  opened: boolean;
  onClose: () => void;
  type: '0' | '1' | '2'; // '0' for Expense, '1' for Income, '2' for Transfer
}

export default function AddSchedulenModal({
  opened,
  onClose,
  type,
}: AddScheduleTransactionModalProps) {
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
      toAccount: '', // For transfers
      category: '',
      date: new Date(Date.now() + 24 * 60 * 60 * 1000),
      memo: '',
      type: type,
      frequency: '4', // Default to 'One Time'
      transferid: '',
    },
    validate: {
      account: (value) => (value ? null : 'Account is required'),
      amount: (value) => (value ? null : 'Amount is required'),
      category: (value) => (value || type === '2' ? null : 'Category is required'),
      toAccount: (value, values) =>
        type === '2' && value === values.account
          ? 'To account must be different from from account'
          : null,
    },
  });

  const category = useCategory(type);
  const accounts = useAccounts();
  const savingAccounts = useSavingAccounts();
  const savingAccountIds = new Set(savingAccounts.map((acc) => acc.id));
  const accountOption = accounts
    .filter((account) => !savingAccountIds.has(account.id))

    .map((account) => ({
      id: account.id,
      name: account.name,
      type: account.type,
    }));
  // Filter accounts based on the requirements
  const fromAccountOptions = accounts
    .filter(
      (account) =>
        account.type !== '2' ||
        (account.type === '2' && type !== '0' && type !== '1')
    ) // Exclude debt accounts for expense and income
    .map((account) => ({
      value: account.id,
      label: account.name,
      type: account.type,
    }));

  const toAccountOptions = accountOption
    .filter((account) => account.type !== '2' || type === '2') // Only include debt accounts for transfer in
    .map((account) => ({
      value: account.id,
      label: account.name,
    }));

  const expenseOptions = accounts
    .filter((account) => account.type === '0' || account.type === '3') // Only include debt accounts for transfer in
    .map((account) => ({
      value: account.id,
      label: account.name,
    }));

  const handleClose = () => {
    form.reset();
    onClose();
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

  const handleAddTransaction = async (values: any) => {
    try {
      values.email = session.data?.user?.email;
      const upcomingDate = getUpcomingDate(values.date, values.frequency);
      const newScheduledTransaction = {
        ...values,
        upcomingDate,
      };

      await addDoc(
        collection(
          db,
          'users',
          session.data?.user?.email as string,
          'scheduled'
        ),
        newScheduledTransaction
      );

      notifications.show({
        title: 'Success',
        message: 'Giao dịch dự chi thành công',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Có lỗi xảy ra khi thêm giao dịch dự chi',
        color: 'red',
      });
    }
  };

  return (
    <>
      <Modal
        opened={opened}
        onClose={handleClose}
        title={
          type === '0'
            ? 'Thêm Chi Phí'
            : type === '1'
            ? 'Thêm Thu Nhập'
            : 'Thêm Chuyển Khoản'
        }
      >
        <form
          onSubmit={form.onSubmit((values) =>
            handleAddTransaction(values).then(() => {
              handleClose();
            })
          )}
          className={classes.formWrapper}
        >
          {type !== '2' ? (
            <>
              <Select
                label="Tài khoản"
                placeholder="Chọn tài khoản"
                data={expenseOptions}
                required
                {...form.getInputProps('account')}
              />
            </>
          ) : (
            <>
              <Select
                label="Từ tài khoản"
                placeholder="Chọn tài khoản"
                data={fromAccountOptions.filter(
                  (account) => account.type !== '2'
                )} // Exclude debt accounts for transfers out
                required
                {...form.getInputProps('account')}
              />
              <Select
                label="Đến tài khoản"
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
          {type !== '2' && (
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
            placeholder="Date"
            required
            minDate={new Date(Date.now() + 24 * 60 * 60 * 1000)}
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
            label="Ghi chú"
            placeholder="Chọn ghi chú"
            {...form.getInputProps('memo')}
          />
          <Button type="submit" mt="md">
            Xác nhận
          </Button>
        </form>
      </Modal>
    </>
  );
}

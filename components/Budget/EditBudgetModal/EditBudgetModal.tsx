import { db } from '@/firebase';
import useAccounts from '@/hooks/useAccount';
import useCategory from '@/hooks/useCategory';
import { Budget } from '@/types/budget';
import {
  Button,
  Checkbox,
  Modal,
  MultiSelect,
  NumberInput,
  Select,
  TextInput,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import dayjs from 'dayjs';
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import classes from './EditBudgetModal.module.css';

interface EditBudgetModalProps {
  opened: boolean;
  onClose: () => void;
  budget: Budget;
}

export default function EditBudgetModal({
  opened,
  onClose,
  budget,
}: EditBudgetModalProps) {
  const session = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/signin');
    },
  });

  const categories = useCategory('0');
  const accounts = useAccounts();
  const accountList = accounts.map((account) => ({
    label: account.name,
    value: account.id,
  }));

  const form = useForm({
    initialValues: {
      name: budget.name,
      amount: budget.amount,
      category: budget.category,
      accounts: budget.accounts,
      currentAmount: budget.currentAmount,
      type: budget.type,
      startDate: budget.startDate,
      endDate: budget.endDate,
      recurring: budget.recurring,
    },
  });

  const [time, setTime] = useState<string>(budget.type);
  const [value, setValue] = useState<[Date | null, Date | null]>([
    budget.startDate ? new Date(budget.startDate) : null,
    budget.endDate ? new Date(budget.endDate) : null,
  ]);
  const [checked, setChecked] = useState(budget.recurring);

  const handleTimeChange = (selectedTime: string) => {
    const now = dayjs();
    let dateRange: [Date | null, Date | null] = [null, null];

    switch (selectedTime) {
      case '0':
        dateRange = [now.startOf('week').toDate(), now.endOf('week').toDate()];
        break;
      case '1':
        dateRange = [
          now.startOf('month').toDate(),
          now.endOf('month').toDate(),
        ];
        break;
      case '2':
        dateRange = [now.startOf('year').toDate(), now.endOf('year').toDate()];
        break;
      case '3':
        dateRange = value;
        break;
      default:
        break;
    }
    form.setFieldValue('type', selectedTime);
    setTime(selectedTime);
    setValue(dateRange);
  };

  const handleSubmit = async (values: any) => {
    values.startDate = value[0];
    values.endDate = value[1];
    values.recurring = checked;

    try {
      const user = session.data?.user?.email;
      if (!user) return;

      const transactionsRef = collection(db, 'users', user, 'transactions');
      let transactionsQuery;

      const categoryParts = values.category.split(' / ');
      if (categoryParts.length === 2) {
        transactionsQuery = query(
          transactionsRef,
          where('account', 'in', values.accounts),
          where('date', '>=', values.startDate),
          where('date', '<=', values.endDate),
          where('category', '==', values.category)
        );
      } else {
        transactionsQuery = query(
          transactionsRef,
          where('account', 'in', values.accounts),
          where('date', '>=', values.startDate),
          where('date', '<=', values.endDate),
          where('category', '>=', values.category),
          where('category', '<', values.category + '\uf8ff')
        );
      }

      const transactionsSnapshot = await getDocs(transactionsQuery);
      let currentAmount = 0;
      transactionsSnapshot.forEach((doc) => {
        currentAmount += Math.abs(doc.data().amount);
      });

      values.currentAmount = currentAmount;

      const budgetRef = doc(db, 'users', user, 'budgets', budget.id);
      await updateDoc(budgetRef, values);

      notifications.show({
        title: 'Budget Updated',
        message: 'Hạn mức chi đã được cập nhật thành công',
        color: 'green',
      });

      onClose();
    } catch (error) {
      console.error('Error updating budget:', error);
      notifications.show({
        title: 'Error',
        message: 'Có lỗi xảy ra khi cập nhật hạn mức chi',
        color: 'red',
      });
    }
  };

  useEffect(() => {
    if (budget) {
      form.setValues({
        name: budget.name,
        amount: budget.amount,
        category: budget.category,
        accounts: budget.accounts,
        currentAmount: budget.currentAmount,
        type: budget.type,
        startDate: budget.startDate,
        endDate: budget.endDate,
        recurring: budget.recurring,
      });
      setTime(budget.type);
      setValue([new Date(budget.startDate), new Date(budget.endDate)]);
      setChecked(budget.recurring);
    }
  }, [budget]);

  const handleClose = () => {
    onClose();
    form.reset();
  };
  return (
    <>
      <Modal opened={opened} onClose={handleClose} title="Điều chỉnh hạn mức">
        <form
          onSubmit={form.onSubmit((values) => handleSubmit(values))}
          className={classes.formWrapper}
        >
          <TextInput
            label="Tên hạn mức"
            placeholder="Chọn tên"
            required
            {...form.getInputProps('name')}
          />

          <NumberInput
            label="Số tiền"
            placeholder="Chọn số tiền"
            required
            min={0}
            {...form.getInputProps('amount')}
          />

          <Select
            label="Danh mục"
            placeholder="Chọn danh mục"
            data={categories}
            required
            {...form.getInputProps('category')}
          />
          <MultiSelect
            label="Tài khoản"
            placeholder="Chọn các tài khoản"
            data={accountList}
            required
            {...form.getInputProps('accounts')}
          />
          <Select
            label="Khoảng thời gian"
            placeholder="Chọn khoảng thời gian"
            data={[
              { label: 'Theo tuần', value: '0' },
              { label: 'Theo tháng', value: '1' },
              { label: 'Theo năm', value: '2' },
              { label: 'Tự chọn', value: '3' },
            ]}
            onChange={(value) => handleTimeChange(value as string)}
            value={time}
            required
          />
          {time === '3' && (
            <DatePickerInput
              type="range"
              label="Khoảng thời gian"
              placeholder="Chọn khoảng thời gian"
              value={value}
              onChange={setValue}
              required
            />
          )}
          <Checkbox
            label="Lập lại hạn mức"
            checked={checked}
            onChange={(event) => setChecked(event.currentTarget.checked)}
          />
          <Button type="submit">Cập nhật hạn mức</Button>
        </form>
      </Modal>
    </>
  );
}

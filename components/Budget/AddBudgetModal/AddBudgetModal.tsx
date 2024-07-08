import { db } from '@/firebase';
import useAccounts from '@/hooks/useAccount';
import useCategory from '@/hooks/useCategory';
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
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useState } from 'react';
import classes from './AddBudgetModal.module.css';

interface AddBudgetModalProps {
  opened: boolean;
  onClose: () => void;
}

export default function AddBudgetModal({
  opened,
  onClose,
}: AddBudgetModalProps) {
  const session = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/signin');
    },
  });

  const categories = useCategory('0');
  const accounts = useAccounts();
  const accountList = accounts
    .filter((account) => account.type === '0' || account.type === '3')
    .map((account) => ({ label: account.name, value: account.id }));

  const form = useForm({
    initialValues: {
      name: '',
      amount: 0,
      category: '',
      accounts: [],
      currentAmount: 0,
      type: '0',
    },
  });

  const handleUpdateBudget = async (values: any) => {
    try {
      const budgetRef = collection(
        db,
        'users',
        session.data?.user?.email as string,
        'budgets'
      );
      const querySnapshot = await getDocs(
        query(budgetRef, where('name', '==', values.name))
      );

      if (!querySnapshot.empty) {
        notifications.show({
          title: 'Budget already exists',
          message:
            'A budget with the same name already exists. Please choose a different name.',
        });
        return;
      }

      const transactionsRef = collection(
        db,
        'users',
        session.data?.user?.email as string,
        'transactions'
      );

      let transactionsQuery;

      const categoryParts = values.category.split(' / ');
      if (categoryParts.length === 2) {
        // Query transactions with exact subcategory match
        transactionsQuery = query(
          transactionsRef,
          where('account', 'in', values.accounts),
          where('date', '>=', values.startDate),
          where('date', '<=', values.endDate),
          where('category', '==', values.category)
        );
      } else {
        // Query transactions with main category match
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

      await addDoc(budgetRef, values);
      console.log('Budget added successfully!');
      onClose();
    } catch (error) {
      console.error('Error adding budget:', error);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const [time, setTime] = useState<string>('0');
  const [value, setValue] = useState<[Date | null, Date | null]>([null, null]);
  const [checked, setChecked] = useState(false);

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

  const handleSubmit = (values: any) => {
    values.startDate = value[0];
    values.endDate = value[1];
    values.recurring = checked;
    handleUpdateBudget(values);
  };

  return (
    <>
      <Modal opened={opened} onClose={handleClose} title="Add Budget">
        <form
          onSubmit={form.onSubmit((values) => handleSubmit(values))}
          className={classes.formWrapper}
        >
          <TextInput
            label="Name"
            placeholder="Name"
            required
            {...form.getInputProps('name')}
          />

          <NumberInput
            label="Amount"
            placeholder="Amount"
            required
            min={0}
            {...form.getInputProps('amount')}
          />

          <Select
            label="Category"
            placeholder="Select category"
            data={categories}
            required
            {...form.getInputProps('category')}
          />
          <MultiSelect
            label="Accounts"
            placeholder="Select account"
            data={accountList}
            required
            {...form.getInputProps('accounts')}
          />
          <Select
            label="Time Period"
            placeholder="Select time period"
            data={[
              { label: 'Weekly', value: '0' },
              { label: 'Monthly', value: '1' },
              { label: 'Yearly', value: '2' },
              { label: 'Custom', value: '3' },
            ]}
            onChange={(value) => handleTimeChange(value as string)}
            required
          />
          {time === '3' && (
            <DatePickerInput
              type="range"
              label="Pick dates range"
              placeholder="Pick dates range"
              value={value}
              onChange={setValue}
              required
            />
          )}
          {/* <Checkbox
            label="Repeat this budget"
            checked={checked}
            onChange={(event) => setChecked(event.currentTarget.checked)}
          /> */}
          <Button type="submit">Submit</Button>
        </form>
      </Modal>
    </>
  );
}

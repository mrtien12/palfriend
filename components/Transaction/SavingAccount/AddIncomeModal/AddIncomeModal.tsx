import { db } from '@/firebase';
import useCategory from '@/hooks/useCategory';
import { Button, Modal, NumberInput, Select, TextInput } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { isSameDay } from 'date-fns';
import {
  addDoc,
  collection,
  doc,
  increment,
  updateDoc,
} from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import classes from './AddIncomeModal.module.css';

interface SavingAddIncomeModalProps {
  opened: boolean;
  onClose: () => void;
  settlementDate: Date;
  phase: string;
  accountid: string;
}

export default function SavingAddIncomeModal({
  opened,
  onClose,
  settlementDate,
  phase,
  accountid,
}: SavingAddIncomeModalProps) {
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
      type: '1', // Type '1' for income
      rate: 0,
    },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const category = useCategory('1');
  // const account = useAccounts();
  // const accountOption = account.map((account) => ({
  //   value: account.id,
  //   label: account.name,
  // }));

  const handleAddIncome = async (values: any) => {
    values.account = accountid;
    console.log(values);
    if (phase === '0') {
      await updateAccountBalance(values, true);
    } else if (isSameDay(values.date, settlementDate)) {
      await updateAccountBalance(values, true);
    } else {
      await updateAccountBalance(values, false);
    }

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
      title: 'Balance Added',
      message: 'Giao dịch đã được thêm thành công',
      color: 'teal',
      icon: null,
    });
  };

  const updateAccountBalance = async (
    transaction: any,
    isSettlementDay: boolean
  ) => {
    const accountRef = doc(
      db,
      'users',
      session.data?.user?.email as string,
      'accounts',
      transaction.account
    );

    if (isSettlementDay) {
      await updateDoc(accountRef, {
        amount: increment(transaction.amount),
      });
    } else {
      await updateDoc(accountRef, {
        untrack: increment(transaction.amount),
        untrackRate: transaction.rate,
      });
    }
  };

  return (
    <>
      <Modal opened={opened} onClose={handleClose} title="Thêm giao dịch">
        <form
          onSubmit={form.onSubmit((values) =>
            handleAddIncome(values).then(() => {
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
            placeholder="Thêm danh mục"
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
          {isSameDay(settlementDate, new Date()) == false && phase !== '0' && (
            <NumberInput
              label="Input untrack rate"
              placeholder="Untrack rate"
              {...form.getInputProps('rate')}
            />
          )}
          <Button type="submit" mt="md">
            Thêm giao dịch
          </Button>
        </form>
      </Modal>
    </>
  );
}

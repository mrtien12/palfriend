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
  increment,
  updateDoc,
} from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import classes from './AddIncomeModal.module.css';

interface AddIncomeModalProps {
  opened: boolean;
  onClose: () => void;
  accountId: string;
}

export default function AddIncomeModal({
  opened,
  onClose,
  accountId,
}: AddIncomeModalProps) {
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
      type: '1', // Type '1' for income
    },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const category = useCategory('1');
  // const account = useAccounts();
  // const accountOption = account.map((account) => ({
  //     value: account.id,
  //     label: account.name,
  // }));

  const handleAddIncome = async (values: any) => {
    values.account = accountId;
    console.log(values);
    await updateAccountBalance(values);
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
      title: 'Income Added',
      message: 'Thu nhập được thêm vào thành công',
      color: 'teal',
      icon: null,
    });
  };

  const updateAccountBalance = async (transaction: any) => {
    const accountRef = doc(
      db,
      'users',
      session.data?.user?.email as string,
      'accounts',
      transaction.account
    );
    await updateDoc(accountRef, {
      amount: increment(transaction.amount),
    });
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
          {/* <Select
                        label="Account"
                        placeholder="Select Account"
                        data={accountOption}
                        required
                        {...form.getInputProps('account')}
                    /> */}
          <NumberInput
            label="Số tiền"
            placeholder="Chọn só tiền"
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
            Thêm thu nhập
          </Button>
        </form>
      </Modal>
    </>
  );
}

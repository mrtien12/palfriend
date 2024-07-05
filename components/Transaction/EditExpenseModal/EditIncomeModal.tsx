import { db } from '@/firebase';
import useCategory from '@/hooks/useCategory';
import { Transaction } from '@/types/transaction';
import { Button, Modal, NumberInput, Select, TextInput } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import classes from './EditExpenseModal.module.css';

interface EditIncomeModalProps {
  opened: boolean;
  onClose: () => void;
  accountId: string;
  transaction: Transaction | null;
  onUpdate: (transaction: Transaction) => void;
}

export default function EditIncomeModal({
  opened,
  onClose,
  accountId,
  transaction,
  onUpdate,
}: EditIncomeModalProps) {
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

  const category = useCategory('1');

  if (!transaction) return null;

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const handleEditIncome = async (values: any) => {
    try {
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
      const newAmount = values.amount;
      const oldAmount = transaction.amount;

      const newBalance = currentBalance + newAmount - oldAmount;

      if (newBalance < 0) {
        notifications.show({
          title: 'Invalid amount',
          message: 'Số dư không đủ',
          color: 'red',
        });
        return;
      }

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

      onUpdate(updatedTransaction);

      notifications.show({
        title: 'Success',
        message: 'Cập nhật giao dịch thành công',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Câp nhật giao dịch không thành công',
        color: 'red',
      });
    }
  };

  return (
    <Modal opened={opened} onClose={handleClose} title="Chỉnh sửa giao dịch">
      <form
        onSubmit={form.onSubmit((values) =>
          handleEditIncome(values).then(() => {
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
  );
}

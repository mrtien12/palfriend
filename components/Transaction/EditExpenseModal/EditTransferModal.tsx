import { db } from '@/firebase';
import useAccounts from '@/hooks/useAccount';
import { Transaction } from '@/types/transaction';
import { Button, Modal, NumberInput, Select, TextInput } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  increment,
  updateDoc,
} from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import classes from './EditExpenseModal.module.css';

interface EditTransferModalProps {
  opened: boolean;
  onClose: () => void;
  fromAccount: string;
  transaction: Transaction | null;
  onUpdate: (transaction: Transaction) => void;
}

export default function EditTransferModal({
  opened,
  onClose,
  fromAccount,
  transaction,
  onUpdate,
}: EditTransferModalProps) {
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
      account: fromAccount,
      toAccount: transaction?.toAccount,
      date: transaction?.date,
      memo: transaction?.memo,
      type: '2', // Type '2' for transfer
    },
  });

  useEffect(() => {
    form.setValues({
      id: transaction?.id,
      amount: transaction?.amount,
      account: fromAccount,
      toAccount: transaction?.toAccount,
      date: transaction?.date,
      memo: transaction?.memo,
      type: '2',
    });
  }, [transaction]);

  const handleClose = () => {
    form.reset();
    onClose();
  };
  const account = useAccounts();

  if (!transaction) return null;
  const handleEditTransfer = async (values: any) => {
    try {
      if (transaction.from == true) {
        const fromAccountRef = doc(
          db,
          'users',
          session.data?.user?.email as string,
          'accounts',
          fromAccount
        );
        const oldToAccountRef = doc(
          db,
          'users',
          session.data?.user?.email as string,
          'accounts',
          transaction.toAccount
        );
        const newToAccountRef = doc(
          db,
          'users',
          session.data?.user?.email as string,
          'accounts',
          values.toAccount
        );

        const fromAccountDoc = await getDoc(fromAccountRef);
        const oldToAccountDoc = await getDoc(oldToAccountRef);
        const newToAccountDoc = await getDoc(newToAccountRef);

        const fromAccountData = fromAccountDoc.data();
        const oldToAccountData = oldToAccountDoc.data();
        const newToAccountData = newToAccountDoc.data();

        if (!fromAccountData || !oldToAccountData || !newToAccountData) {
          notifications.show({
            title: 'Error',
            message: 'Tài khoản không tồn tại',
            color: 'red',
          });
          return;
        }

        const currentFromBalance = fromAccountData.amount;
        const oldToBalance = oldToAccountData.amount;
        const newAmount = values.amount;
        const oldAmount = transaction.amount;

        const newFromBalance = currentFromBalance - (newAmount - oldAmount);
        const newOldToBalance = oldToBalance - oldAmount;
        const newNewToBalance = newToAccountData.amount + newAmount;

        if (newFromBalance < 0 || newNewToBalance < 0) {
          notifications.show({
            title: 'Invalid amount',
            message: 'Số dư không đủ',
            color: 'red',
          });
          return;
        }

        // Update original fromAccount and old toAccount
        await updateDoc(fromAccountRef, {
          amount: increment(oldAmount - newAmount),
        });
        await updateDoc(oldToAccountRef, {
          amount: increment(-oldAmount),
        });

        // Update new toAccount
        await updateDoc(newToAccountRef, {
          amount: increment(newAmount),
        });

        // Update the transfer transaction
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
            toAccount: values.toAccount,
            date: values.date,
            memo: values.memo,
          }
        );

        if (transaction.transferid) {
          // If the toAccount has changed, delete the old transfer transaction
          if (transaction.toAccount !== values.toAccount) {
            await deleteDoc(
              doc(
                db,
                'users',
                session.data?.user?.email as string,
                'transactions',
                transaction.transferid
              )
            );

            // Create a new transfer transaction for the new toAccount
            const newToTransaction = {
              ...values,
              account: values.toAccount,
              transferid: transaction.id,
            };
            const newToTransactionRef = await addDoc(
              collection(
                db,
                'users',
                session.data?.user?.email as string,
                'transactions'
              ),
              newToTransaction
            );
            await updateDoc(
              doc(
                db,
                'users',
                session.data?.user?.email as string,
                'transactions',
                transaction.id
              ),
              {
                transferid: newToTransactionRef.id,
              }
            );
          } else {
            await updateDoc(
              doc(
                db,
                'users',
                session.data?.user?.email as string,
                'transactions',
                transaction.transferid
              ),
              {
                amount: newAmount,
                account: values.toAccount,
                date: values.date,
                memo: values.memo,
              }
            );
          }
        }

        const updatedTransaction: Transaction = {
          ...transaction,
          ...values,
        };

        onUpdate(updatedTransaction);
      }

      notifications.show({
        title: 'Success',
        message: 'Cập nhật giao dịch thành công',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Cập nhật giao dịch không thành công',
        color: 'red',
      });
    }
  };
  const accountOption = account
    .filter((acc) => acc.id !== fromAccount)
    .map((acc) => ({
      value: acc.id,
      label: acc.name,
    }));

  return (
    <Modal opened={opened} onClose={handleClose} title="Cập nhật giao dịch">
      <form
        onSubmit={form.onSubmit((values) =>
          handleEditTransfer(values).then(() => {
            handleClose();
          })
        )}
        className={classes.formWrapper}
      >
        <Select
          label="Đến tài khoản"
          placeholder="Chọn tài khoản"
          data={accountOption}
          required
          {...form.getInputProps('toAccount')}
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

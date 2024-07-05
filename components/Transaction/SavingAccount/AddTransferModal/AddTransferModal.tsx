import { db } from '@/firebase';
import useAccounts from '@/hooks/useAccount';
import useSavingAccounts from '@/hooks/useSavingAccount';
import { Button, Modal, NumberInput, Select, TextInput } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  increment,
  updateDoc,
} from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import classes from './AddTransferModal.module.css';

interface SavingAddTransferModalProps {
  opened: boolean;
  onClose: () => void;
  settlementDate: Date;
  phase: string;
  accountid: string;
}

export default function SavingAddTransferModal({
  opened,
  onClose,
  settlementDate,
  phase,
  accountid,
}: SavingAddTransferModalProps) {
  const session = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/signin');
    },
  });

  const form = useForm({
    initialValues: {
      amount: 0,
      fromAccount: '',
      toAccount: '',
      date: new Date(),
      category: '',
      memo: '',
      type: '2', // Type '2' for transfer
    },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const accounts = useAccounts();
  const savingAccounts = useSavingAccounts();
  const savingAccountIds = new Set(savingAccounts.map((acc) => acc.id));
  const accountOption = accounts
    .filter(
      (account) => account.id !== accountid && !savingAccountIds.has(account.id)
    )

    .map((account) => ({
      value: account.id,
      label: account.name,
    }));

  // const categories = useCategory();
  const handleAddTransfer = async (values: any) => {
    values.account = accountid;
    const transferId = await createTransferTransaction(values);
    if (transferId) {
      notifications.show({
        title: 'Transfer Completed',
        message: 'Giao dịch chuyển khoản đã được thực hiện',
        color: 'teal',
        icon: null,
      });
    }
  };

  // const calculateInterest = (amount: number, rate: number, days: number) => {
  //     return amount * (rate / 100) * (days / 365);
  // };

  const createTransferTransaction = async (transaction: any) => {
    const fromAccountRef = doc(
      db,
      'users',
      session.data?.user?.email as string,
      'accounts',
      transaction.account
    );
    const toAccountRef = doc(
      db,
      'users',
      session.data?.user?.email as string,
      'accounts',
      transaction.toAccount
    );

    const fromAccountDoc = await getDoc(fromAccountRef);
    const fromAccountData = fromAccountDoc.data();

    if (!fromAccountData || transaction.amount > fromAccountData.amount) {
      notifications.show({
        title: 'Insufficient Balance',
        message: 'Số dư không đủ để thực hiện giao dịch này',
        color: 'red',
        icon: null,
      });
      return null;
    }
    const transferData = {
      ...transaction,
      account: transaction.account,
      from: true,
    };
    const transferDocRef = await addDoc(
      collection(
        db,
        'users',
        session.data?.user?.email as string,
        'transactions'
      ),
      transferData
    );
    console.log(transferData);
    const transferId = transferDocRef.id;

    const toTransaction = {
      ...transaction,
      account: transaction.toAccount,
      toAccount: transaction.account,
      transferid: transferId,
      from: false,
    };
    const toTransactionDocRef = await addDoc(
      collection(
        db,
        'users',
        session.data?.user?.email as string,
        'transactions'
      ),
      toTransaction
    );

    await updateDoc(transferDocRef, { transferid: toTransactionDocRef.id });

    await updateDoc(fromAccountRef, {
      amount: increment(-transaction.amount),
    });
    await updateDoc(toAccountRef, {
      amount: increment(transaction.amount),
    });

    return transferId;
  };

  return (
    <Modal opened={opened} onClose={handleClose} title="Thêm giao dịch">
      <form
        onSubmit={form.onSubmit((values) =>
          handleAddTransfer(values).then(() => {
            handleClose();
          })
        )}
        className={classes.formWrapper}
      >
        <Select
          label="Đến tài khoản"
          placeholder="Chọn tài khoản đến"
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
        {/* <Select 
                    label="Category"
                    placeholder="Select Category"
                    data={categories}
                    required
                    {...form.getInputProps('category')}
                /> */}
        {/* {phase !== '0' && !isSameDay(new Date(), settlementDate) && (
                    <NumberInput
                        label="Demand Deposit Interest Rate"
                        placeholder="Demand Deposit Interest Rate"
                        required
                        {...form.getInputProps('demandrate')}
                    />
                )} */}
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
          Thêm giao dịch
        </Button>
      </form>
    </Modal>
  );
}

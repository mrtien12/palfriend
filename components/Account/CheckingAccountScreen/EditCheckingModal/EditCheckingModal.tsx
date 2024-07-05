import { db } from '@/firebase';
import useAccounts from '@/hooks/useAccount';
import { CheckingAccount } from '@/types/account';
import { Button, Modal, NumberInput, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { doc, updateDoc } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import classes from './EditCheckingModal.module.css';
interface EditCheckingModalProps {
  opened: boolean;
  onClose: () => void;
  account: CheckingAccount | null;
}

export default function EditCheckingModal({
  opened,
  onClose,
  account,
}: EditCheckingModalProps) {
  const session = useSession();
  const form = useForm({
    initialValues: {
      name: account?.name,
      amount: account?.amount,
      bank: account?.bank,
      type: account?.type,
      accountNumber: account?.accountNumber,
    },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };
  useEffect(() => {
    form.setValues({
      name: account?.name,
      amount: account?.amount,
      bank: account?.bank,
      type: account?.type,
      accountNumber: account?.accountNumber,
    });
  }, [account, opened]);
  const account1 = useAccounts();
  if (!account) return null;

  const accountNames = account1.map((account1) => account1.name);

  const handleEditChecking = async (values: any) => {
    if (values.name != account.name && accountNames.includes(values.name)) {
      notifications.show({
        title: 'Duplicate Account Name',
        message:
          'Tài khoản cùng tên đã tồn tại. Vui lòng chọn tên khác.',
      });
      return;
    }
    const accountRef = doc(
      db,
      'users',
      session.data?.user?.email as string,
      'accounts',
      account.id
    );
    await updateDoc(accountRef, values);
    notifications.show({
      title: 'Account edited successfully',
      message:
        'Tài khoản đã được chỉnh sửa thành công',
    });
    const updatedTransaction: CheckingAccount = {
      ...values,
    };

    return;
  };
  return (
    <Modal opened={opened} onClose={handleClose} title="Chỉnh sửa tài khoản giao dịch">
      <form
        onSubmit={form.onSubmit((values) =>
          handleEditChecking(values).then(() => {
            handleClose();
          })
        )}
        className={classes.formWrapper}
      >
        <TextInput
          label="Tên tài khoản"
          required
          placeholder="Chọn tên"
          {...form.getInputProps('name')}
        />
        <NumberInput
          label="Số tiền"
          required
          placeholder="Chọn số tiền"
          {...form.getInputProps('amount')}
        />

        <TextInput
          label="Tên ngân hàng"
          placeholder="Chọn tên ngân hàng"
          {...form.getInputProps('bank')}
        />

        <TextInput
          label="Số tài khoản"
          placeholder="Chọn số tài khoản"
          {...form.getInputProps('accountNumber')}
        />
        <Button type="submit" mt="md">
          Xác nhận
        </Button>
      </form>
    </Modal>
  );
}

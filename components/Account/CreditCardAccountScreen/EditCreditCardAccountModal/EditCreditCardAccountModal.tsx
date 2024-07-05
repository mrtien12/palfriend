import { db } from '@/firebase';
import useAccounts from '@/hooks/useAccount';
import { CreditCardAccount } from '@/types/account';
import { Button, Modal, NumberInput, Select, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { doc, updateDoc } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import classes from './EditCreditCardAccountModal.module.css';

interface EditCreditCardModalProps {
  opened: boolean;
  onClose: () => void;
  account: CreditCardAccount | null;
}

export default function EditDebtModal({
  opened,
  onClose,
  account,
}: EditCreditCardModalProps) {
  const session = useSession();
  const account1 = useAccounts();
  const form = useForm({
    initialValues: {
      name: account?.name,
      amount: account?.amount,
      interestRate: account?.interestRate,
      grace: account?.grace,
      paymentDay: account?.paymentDay,
      limit: account?.limit,
    },
  });

  useEffect(() => {
    form.setValues({
      name: account?.name,
      amount: account?.amount,
      interestRate: account?.interestRate,
      grace: account?.grace,
      paymentDay: account?.paymentDay,
      limit: account?.limit,
    });
  }, [account, opened]);

  const handleClose = () => {
    form.reset();
    onClose();
  };

  if (!account) return null;
  const accountNames = account1.map((account1) => account1.name);

  const handleEditCreditCard = async (values: any) => {
    if (values.name != account.name && accountNames.includes(values.name)) {
      notifications.show({
        title: 'Account already exists',
        message: 'Tài khoản đã tồn tại',
        color: 'red',
        icon: null,
      });
      return;
    }
    values.amount = -Math.abs(values.amount);

    if (-values.amount > values.limit) {
      notifications.show({
        title: 'Amount exceeds limit',
        message: 'Số dư không thể vượt quá hạn mức tín dụng',
        color: 'red',
        icon: null,
      });
      return;
    }
    const docRef = doc(
      db,
      'users',
      session.data?.user?.email as string,
      'accounts',
      account.id
    );
    await updateDoc(docRef, values);
    notifications.show({
      title: 'Account updated',
      message: 'Tài khoản cập nhật thành công',
      color: 'blue',
      icon: null,
    });
    handleClose();
  };

  return (
    <Modal opened={opened} onClose={handleClose} title="Chỉnh sửa tài khoản tín dụng">
      <form
        onSubmit={form.onSubmit((values) =>
          handleEditCreditCard(values).then(() => {
            handleClose();
          })
        )}
        className={classes.formWrapper}
      >
        <TextInput
          label="Tên tài khoản"
          required
          placeholder="Chọn tên tài khoản"
          {...form.getInputProps('name')}
        />
        <NumberInput
          label="Số dư hiện tại"
          required
          placeholder="Chọn số dư hiện tại"
          {...form.getInputProps('amount')}
        />

        <NumberInput
          required
          label="Hạn mức tín dụng"
          placeholder="Chọn hạn mức tính dụng"
          {...form.getInputProps('limit')}
        />
        <NumberInput
          required
          label="Lãi suất(%)"
          placeholder="Chọn lãi suất"
          {...form.getInputProps('interestRate')}
        />

        <Select
          label="Vào ngày"
          required
          placeholder="Chọn ngày"
          {...form.getInputProps('paymentDay')}
          data={[
            { label: 'Mồng 1', value: '1' },
            { label: 'Mồng 2', value: '2' },
            { label: 'Mồng 3', value: '3' },
            { label: 'Mồng 4', value: '4' },
            { label: 'Mồng 5', value: '5' },
            { label: 'Mồng 6', value: '6' },
            { label: 'Mồng 7', value: '7' },
            { label: 'Mồng 8', value: '8' },
            { label: 'Mồng 9', value: '9' },
            { label: 'Mồng 10', value: '10' },
            { label: 'Ngày 11', value: '11' },
            { label: 'Ngày 12', value: '12' },
            { label: 'Ngày 13', value: '13' },
            { label: 'Ngày 14', value: '14' },
            { label: 'Ngày 15', value: '15' },
            { label: 'Ngày 16', value: '16' },
            { label: 'Ngày 17', value: '17' },
            { label: 'Ngày 18', value: '18' },
            { label: 'Ngày 19', value: '19' },
            { label: 'Ngày 20', value: '20' },
            { label: 'Ngày 21', value: '21' },
            { label: 'Ngày 22', value: '22' },
            { label: 'Ngày 23', value: '23' },
            { label: 'Ngày 24', value: '24' },
            { label: 'Ngày 25', value: '25' },
            { label: 'Ngày 26', value: '26' },
            { label: 'Ngày 27', value: '27' },
            { label: 'Ngày 28', value: '28' },
            { label: 'Ngày 29', value: '29' },
            { label: 'Ngày 30', value: '30' },
            { label: 'Ngày 31', value: '31' },
            {
                label: 'Ngày cuối cùng của tháng',
                value: '32',
            },
        ]}
        />

        <NumberInput
          required
          label="Số ngày ân hạn"
          placeholder="Chọn ngày ân hạn"
          {...form.getInputProps('grace')}
        />
        <Button type="submit" color="blue">
          Xác nhận
        </Button>
      </form>
    </Modal>
  );
}

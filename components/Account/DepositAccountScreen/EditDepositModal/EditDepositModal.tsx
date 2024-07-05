import { db } from '@/firebase';
import useAccounts from '@/hooks/useAccount';
import { DepositAccount } from '@/types/account';
import { Button, Modal, NumberInput, Select, TextInput } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { addMonths, endOfMonth, isBefore, isLastDayOfMonth } from 'date-fns';
import { doc, updateDoc } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import classes from './EditDepositModal.module.css';

interface EditDepositModalProps {
  opened: boolean;
  onClose: () => void;
  deposit: DepositAccount | null;
}

interface AccountDetails {
  phase: '0' | '1' | '2' | '3' | '4';
}
export default function EditDepositModal({
  opened,
  onClose,
  deposit,
}: EditDepositModalProps) {
  const session = useSession();
  const form = useForm({
    initialValues: {
      name: deposit?.name,
      amount: deposit?.amount,
      interestRate: deposit?.interestRate,
      phase: deposit?.phase,
      startDate: deposit?.startDate,
      settlementDate: deposit?.settlementDate,
    },
  });

  useEffect(() => {
    form.setValues({
      name: deposit?.name,
      amount: deposit?.amount,
      interestRate: deposit?.interestRate,
      phase: deposit?.phase,
      startDate: deposit?.startDate,
      settlementDate: deposit?.settlementDate,
    });
  }, [deposit, opened]);
  const account = useAccounts();

  if (!deposit) return null;

  const phases: Record<AccountDetails['phase'], number> = {
    '0': 0, // Demand Deposit, no fixed term
    '1': 1, // 1 month term
    '2': 3, // 3 months term
    '3': 6, // 6 months term
    '4': 12, // 12 months term
  };

  const handleNextSettlementDate = (values: any) => {
    if (values && values.startDate && values.phase) {
      const termMonths = phases[values.phase as keyof typeof phases];
      if (termMonths > 0) {
        let startDate = new Date(values.startDate);
        let calculatedDate = addMonths(startDate, termMonths);

        // Ensure calculated date is always in the future
        while (isBefore(calculatedDate, new Date())) {
          startDate = calculatedDate;
          calculatedDate = addMonths(startDate, termMonths);

          // Check if the new start date is the last day of its month
          if (isLastDayOfMonth(startDate)) {
            calculatedDate = endOfMonth(calculatedDate);
          }
        }

        return calculatedDate;
      } else {
        return null; // No next date for demand deposits
      }
    }
    return null;
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };
  const accountNames = account.map((account) => account.name);

  const handleEditDeposit = async (values: any) => {
    values.settlementDate = handleNextSettlementDate(values);

    if (values.name != deposit.name && accountNames.includes(values.name)) {
      notifications.show({
        title: 'Duplicate Account Name',
        message:
          'Tài khoản với tên đã tồn tại. Vui lòng chọn tên khác.',
        color: 'yellow',
      });
      return;
    }
    const accountRef = doc(
      db,
      'users',
      session.data?.user?.email as string,
      'accounts',
      deposit.id
    );
    await updateDoc(accountRef, values);
    notifications.show({
      title: 'Account edited successfully',
      message:
        'Tài khoản chỉnh sửa thành công',
    });
    console.log(values);
    return;
  };

  return (
    <Modal opened={opened} onClose={handleClose} title="Chỉnh sửa tài khoản tiết kiệm">
      <form
        onSubmit={form.onSubmit((values) =>
          handleEditDeposit(values).then(() => {
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
          label="Số tiền gửi"
          required
          placeholder="Chọn số tiền gửi"
          {...form.getInputProps('amount')}
        />

        <NumberInput
          label="Lãi suất(%)"
          placeholder="Chọn lãi súât"
          {...form.getInputProps('interestRate')}
        />

        <Select
          label="Kỳ hạn"
          placeholder="Chọn kỳ hạn"
          data={[
            { label: 'Không kì hạn', value: '0' },
            { label: 'Kỳ hạn 1 tháng', value: '1' },
            { label: 'Kỳ hạn 3 tháng', value: '2' },
            { label: 'Kỳ hạn 6 tháng', value: '3' },
            { label: 'Kỳ hạn 1 năm', value: '4' },
          ]}
          {...form.getInputProps('phase')}
        />

        <DatePickerInput
          label="Ngày bắt đầu"
          placeholder="Chọn ngày bắt đầu"
          allowDeselect={false}
          {...form.getInputProps('startDate')}
        />
        <Button type="submit" mt="md">
          Xác nhận
        </Button>
      </form>
    </Modal>
  );
}

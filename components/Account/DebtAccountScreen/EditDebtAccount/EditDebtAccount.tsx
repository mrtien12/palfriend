import { inter } from '@/styles/fonts';
import {Modal, Button, TextInput, NumberInput, Select} from '@mantine/core';
import { useForm } from '@mantine/form';
import { DebtAccount } from '@/types/account';
import {DatePickerInput} from '@mantine/dates';
import { useSession } from 'next-auth/react';
import { db } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { notifications } from '@mantine/notifications';
import { collection } from 'firebase/firestore';
import useAccounts from '@/hooks/useAccount';
import { useEffect } from 'react';

interface EditDebtModalProps {
    opened: boolean;
    onClose: () => void;
    account: DebtAccount | null;
}

export default function EditDebtModal({opened, onClose, account}: EditDebtModalProps) {


    const session = useSession();
    const account1 = useAccounts()
    const form = useForm({
        initialValues: {
            name: account?.name,
            amount: account?.amount,
            interestRate: account?.interestRate,
            months: account?.months,
            paymentDay: account?.paymentDay,
            startDate: account?.startDate,
            principal: account?.principal

        }
    });

    useEffect(() => {
        form.setValues({
            name: account?.name,
            amount: account?.amount,
            interestRate: account?.interestRate,
            months: account?.months,
            paymentDay: account?.paymentDay,
            startDate: account?.startDate,
            principal: account?.principal
        });
    }, [account,opened]);

    const handleClose = () => {
        form.reset();
        onClose();
    }

    if (!account) return null;


    const accountNames = account1.map((account1) => account1.name);
    const handleEditDebt = async (values: any) => {
        if (values.name != account.name && accountNames.includes(values.name)) {
            notifications.show({
              title: 'Duplicate Account Name',
              message: 'Tài khoản cùng tên đã tồn tại. Vui lòng chọn tên khác.',
            });
            return;
          }
        values.amount = - Math.abs(values.amount);
        values.principal = - Math.abs(values.amount);
        const accountRef = doc(db, 'users', session.data?.user?.email as string, 'accounts', account.id);
        await updateDoc(accountRef, values);
        notifications.show({                 
            title: 'Account edited successfully',
            message: 'Tài khoản đã được chỉnh sửa thành công.',
        })
        console.log(values)
        return;
    }   

    return (
        <Modal opened={opened} onClose={handleClose} title="Chỉnh sửa tài khoản nợ">
        
            <form onSubmit={
                        form.onSubmit((values) => handleEditDebt(values)
                        .then(() => {
                            handleClose()
                        })
                        )
                    }>
                        
                <TextInput
                    label="Tên tài khoản"
                    required
                    placeholder='Chọn tên tài khoản'
                    {...form.getInputProps('name')}
                />
                <NumberInput 
                    label="Số nợ"
                    required
                    placeholder='Số nợ'
                    {...form.getInputProps('amount')}

                />

                    <NumberInput 
                            label = "Lãi suất(%)"
                            placeholder = "Chọn lãi suất"
                            {...form.getInputProps('interestRate')}
                        />

                        <NumberInput 
                            label= "Sô tháng"
                            placeholder = "Chọn số tháng"
                            {...form.getInputProps('months')}
                        />
                        <Select
                            label = "Vào ngày"
                            placeholder = "Chọn ngày"
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
                    <Button type='submit' mt ='md'>
                        Xác nhận
                </Button>
            </form>
        </Modal>

    )
}
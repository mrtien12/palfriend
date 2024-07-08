'use client';
import { Modal, Button, Select, NumberInput, TextInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { collection, addDoc, where, getDocs, query } from 'firebase/firestore';
import { useState } from 'react';
import { DatePicker, DatePickerInput } from '@mantine/dates';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { db } from '@/firebase';
import { notifications } from '@mantine/notifications';
import { addMonths, endOfMonth, isLastDayOfMonth, isBefore } from 'date-fns';
import classes from './AddAccountModal.module.css';
import { calculateAmortization } from '@/utils/calculateAmortization';

interface AddAccountModalProps {
    opened: boolean;
    onClose: () => void;
}
interface AccountDetails {
    phase: '0' | '1' | '2' | '3' | '4';
}

export default function AddAccountModal({
    opened,
    onClose,
}: AddAccountModalProps) {
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
                return values.startDate; // No next date for demand deposits
            }
        }
        return null;
    };

    const session = useSession({
        required: true,
        onUnauthenticated() {
            redirect('/signin');
        },
    });
    const form = useForm({
        initialValues: {
            name: '',
            amount: 0,
            bank: '',
            accountNumber: '',
            interestRate: 0,
            phase: '0',
            startDate: new Date(),
            months: 0,
            paymentDay: '',
            limit: 0,
            grace: 0

        },
        validate: {
            amount: (value) => (value < 1 && type !== '3' ? 'Amount cannot be negative' : null),
            grace: (value) => (value > 30 ? 'Grace Period cannot be large than 30' : null),
            limit : (value) => (value < 0) ? "Credit Limit cannot be negative" : null,
            // interestRate: (value) => (value <= 0 ? 'Interest Rate cannot be negative' : null),
            // months: (value) => (value < 0 ? 'Months cannot be negative' : null),
        },
    });

    const [type, setType] = useState('0');
    const handleAddAccount = async (values: any) => {
        values.email = session.data?.user?.email;
        console.log(values);
        if (values.type === '2') {
            values.amount = -values.amount;
            values.principal = values.amount;
            values.monthly_payment = calculateAmortization(values.principal,values.interestRate,values.months);
            values.full = false;
        }
        if (values.type === '1') {
            values.settlementDate = handleNextSettlementDate(values);
        }
        if (values.type === '3') {
            // values.amount = -values.amount;
            values.full = false 
            if (-values.limit > values.amount) {
                notifications.show({
                    title: 'Credit Limit Exceeded',
                    message: 'Hạn mức tín dụng không thể lớn hơn số tiền trong tài khoản',
                });
                return;
            }
        }
        const accountRef = collection(
            db,
            'users',
            session.data?.user?.email as string,
            'accounts'
        );

        const querySnapshot = await getDocs(
            query(accountRef, where('name', '==', values.name))
        );

        if (!querySnapshot.empty) {
            // Document with the same name already exists, notify the user

            notifications.show({
                title: 'Account already exists',
                message:
                    'Tài khoản đã tồn tại, vui lòng chọn tên khác',
            });
            console.log('Account already exists');
            return;
        }

        const accountRef1 = await addDoc(
            collection(
                db,
                'users',
                session.data?.user?.email as string,
                'accounts'
            ),
            values
        );
        
        notifications.show({
            title: 'Account Added',
            message: 'Tài khoản đã được thêm vào thành công',
            color: 'green'
        })
        onClose();
    };
    const handleClose = () => {
        form.reset();
        setType('0');
        onClose();
    };
    return (
        <Modal.Root opened={opened} onClose={handleClose} size={'sm'}>
            <Modal.Overlay />
            <Modal.Content>
                <Modal.Header>
                    <Modal.Title>
                        <div
                            style={{
                                fontSize: '24px',
                                fontWeight: 700,
                                width: '100%',
                                textAlign: 'center',
                            }}
                        >
                            Thêm tài khoản
                        </div>
                    </Modal.Title>
                    <Modal.CloseButton />
                </Modal.Header>
                <Modal.Body>
                    <form
                        onSubmit={form.onSubmit((values) =>
                            handleAddAccount(values).then(() => {
                                handleClose();
                            })
                        )}
                        className={classes.form}
                    >
                        <div className={classes.basicInfo}>
                            <TextInput
                                label="Tên tài khoản"
                                required
                                placeholder="Chọn tên tài khoản"
                                classNames={{ wrapper: classes.nameWrapper }}
                                {...form.getInputProps('name')}
                            />
                            <NumberInput
                                label={type === '3' ? "Số dư còn lại" : "Số tiền"} 
                                required
                                placeholder="Chọn số tiền"
                                classNames={{ wrapper: classes.amountWrapper }}
                                {...form.getInputProps('amount')}
                            />
                        </div>
                        <Select
                            label="Loại tài khoản"
                            required
                            placeholder="Chọn loại tài khoản"
                            allowDeselect={false}
                            data={[
                                { label: 'Tài khoản giao dịch', value: '0' },
                                { label: 'Tài khoản tiết kiệm', value: '1' },
                                { label: 'Tài khoản nợ', value: '2' },
                                { label: 'Tài khoản tín dụng', value: '3' },
                            ]}
                            value={type}
                            onChange={(value) => {
                                setType(value as string);
                                form.reset();
                            }}
                        />

                        {type === '0' && (
                            <>
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
                            </>
                        )}

                        {type === '1' && (
                            <>
                                <NumberInput
                                    required
                                    label="Lãi suất(%)"
                                    placeholder="Chọn lãi suất"
                                    {...form.getInputProps('interestRate')}
                                />
                                <Select
                                    label="Kì hạn"
                                    required
                                    placeholder="Chọn kì hạn"
                                    data={[
                                        { label: 'Không kì hạn', value: '0' },
                                        {
                                            label: 'Kì hạn 1 tháng',
                                            value: '1',
                                        },
                                        {
                                            label: 'Kì hạn 3 tháng',
                                            value: '2',
                                        },
                                        {
                                            label: 'Kì hạn 6 tháng',
                                            value: '3',
                                        },
                                        {
                                            label: 'Kì hạn 1 năm',
                                            value: '4',
                                        },
                                    ]}
                                    {...form.getInputProps('phase')}
                                />
                                <DatePickerInput
                                    required
                                    label="Ngày bắt đầu"
                                    placeholder="Chọn ngày bắt đầu"
                                    allowDeselect={false}
                                    {...form.getInputProps('startDate')}
                                />
                            </>
                        )}

                        {type === '2' && (
                            <>
                                <NumberInput
                                    label="Số tháng"
                                    placeholder="Chọn số tháng"
                                    required
                                    {...form.getInputProps('months')}
                                />

                                <NumberInput
                                    label="Lãi suất(%)"
                                    placeholder="Chọn lãi suất"
                                    required
                                    {...form.getInputProps('interestRate')}
                                />

                                <Select
                                    label="Vào ngày"
                                    placeholder="Ngày"
                                    required
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
                            </>
                        )}

                        {type === '3' && (
                            <>
                                <NumberInput
                                    required
                                    label="Hạn mức tín dụng"
                                    placeholder="Chọn hạn mức tín dụng"
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
                                    placeholder="Ngày"
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
                                    label="Số ngày ân hạn"
                                    required
                                    placeholder="Chọn số ngày ân hạn"
                                    {...form.getInputProps('grace')}
                                />
                            </>
                        )}

                        <Button
                            type="submit"
                            mt="xl"
                            fullWidth
                            onClick={() => {
                                form.setFieldValue('type', type);
                            }}
                        >
                            Xác nhận
                        </Button>
                    </form>
                </Modal.Body>
            </Modal.Content>
        </Modal.Root>
    );
}

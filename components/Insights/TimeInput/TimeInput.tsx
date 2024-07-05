'use client';

import { useState } from 'react';
import {
  Paper,
  Text,
  Grid,
  Radio,
  Group,
  Button,
  MultiSelect,
  Center
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { DatePickerInput } from '@mantine/dates';
import useAccounts from '@/hooks/useAccount';
import classes from './TimeInput.module.css'
import TimeChart from '@/components/Chart/TimeChart/TimeChart';

export default function TimeInput() {
    const form = useForm({
        initialValues :{
            accounts: [],
            fromDate : new Date(),
            toDate: new Date()
        
        
    },
    validate: (values) => {
        const errors : Record<string, string> = {};
        if (!values.fromDate) {
            errors.fromDate = 'Thiếu ngày bắt đầu';
          }
          if (!values.toDate) {
            errors.toDate = 'Thiếu ngày kết thúc';
          }
        if (values.fromDate >= values.toDate) {
            errors.toDate = 'Ngày kết thúc phải lớn hơn ngày bắt đầu';
        }
        if (values.accounts.length === 0) {
            errors.accounts = 'Chọn ít nhất một tài khoản';
        }
        
        return errors
        
    }
    })


    const [submittedData, setSubmittedData] = useState<any>(null);

    const handleSubmit = (values: any) => {
      setSubmittedData(values);
      console.log(values);
    };


    const account = useAccounts();
    const accountList = account.map((account) => ({
    value: account.id,
    label: account.name,
  }));

  return (
    <>
    <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
        <Paper shadow='xl' radius="md" className={classes.paperContainer}>
            <div className={classes.formContainer}>
            <Group>
              <Text className={classes.itemLabel}>Tài khoản:</Text>
              <MultiSelect
                data={accountList}
                {...form.getInputProps('accounts')}
                className={classes.multiSelect}
              />
            </Group>

            <Group>
              <DatePickerInput
                label="Từ ngày"
                defaultValue={new Date()}
                {...form.getInputProps('fromDate')}
                className={classes.datePicker}
              />

              <DatePickerInput
                label="Đến ngày"
                defaultValue={new Date()}
                {...form.getInputProps('toDate')}
                className={classes.datePicker}
              />
            </Group>

            <Center>
              <Button type="submit" mt="md">
                Xác nhận
              </Button>
            </Center>
            </div>

        </Paper>
    </form>


    {submittedData && 
      ( <div className={classes.resultContainer}>
            <TimeChart accounts={submittedData.accounts} from={submittedData.fromDate} to={submittedData.toDate} />
        </div>)
    }
    </>
  )
}
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
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { DatePickerInput } from '@mantine/dates';
import useAccounts from '@/hooks/useAccount';
import PieChartComponent from '@/components/Chart/PieChart/PieChart';
import IncomeMainCategoryChart from '@/components/Chart/IncomeMainCategoryChart/IncomeMainCategoryChart';
import ExpenseMainCategoryChart from '@/components/Chart/ExpenseMainCategoryChart/ExpenseMainCategoryChart';
import IncomeSubcategoryChart from '@/components/Chart/IncomeSubcategoryChart/IncomeSubcategoryChart';
import ExpenseSubcategoryChart from '@/components/Chart/ExpenseSubcategoryChart/ExpenseSubcategoryChart';
import BothChart from '@/components/Chart/BothChart/BothChart';
import classes from './InsightInput.module.css';
import { Center } from '@mantine/core';

export default function InsightInput() {
  const form = useForm({
    initialValues: {
      type: '0',
      fromDate: new Date(),
      toDate: new Date(),
      accounts: [],
      groupBy: '0',
      chartType: 'bar', // Add chart type to form
    },
    validate: (values) => {
      const errors: Record<string, string> = {};
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
      return errors;

      
    },
  });

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
        <Paper shadow="xl" radius="md" className={classes.paperContainer}>
          <div className={classes.formContainer}>
            <Radio.Group {...form.getInputProps('type')} mt="md">
              <Text className={classes.itemLabel}>Biểu diễn các danh mục theo</Text>
              <div className={classes.radioOptionContainer}>
                <Radio
                  className={classes.radioOption}
                  checked
                  label="Thu nhập"
                  value="1"
                />
                <Radio
                  className={classes.radioOption}
                  label="Chi tiêu"
                  value="0"
                />
                <Radio className={classes.radioOption} label="Cả hai" value="3" />
              </div>
            </Radio.Group>

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

            <Group>
              <Radio.Group {...form.getInputProps('groupBy')}>
                <Group>
                  <Text className={classes.itemLabel} style={{ width: '100px' }}>
                    Theo:
                  </Text>
                  <div className={classes.radioOptionContainer}>
                    <Radio
                      className={classes.radioOption}
                      checked
                      label="Danh mục chính"
                      value="0"
                    />
                    <Radio
                      className={classes.radioOption}
                      label="Danh mục phụ"
                      value="1"
                    />
                  </div>
                </Group>
              </Radio.Group>
            </Group>

            <Group>
              <Radio.Group {...form.getInputProps('chartType')}>
                <Group>
                  <Text className={classes.itemLabel} style={{ width: '100px' }}>
                    Loại biểu đồ:
                  </Text>
                  <div className={classes.radioOptionContainer}>
                    <Radio
                      className={classes.radioOption}
                      checked
                      label="Biểu đồ cột"
                      value="bar"
                    />
                    <Radio
                      className={classes.radioOption}
                      label="Biểu đồ tròn"
                      value="pie"
                    />
                  </div>
                </Group>
              </Radio.Group>
            </Group>

            <Center>
              <Button type="submit" mt="md">
                Xác nhận
              </Button>
            </Center>
          </div>
        </Paper>
      </form>

      {submittedData && (
        <div className={classes.resultContainer}>
          {submittedData.type === '3' &&
            (submittedData.chartType === 'bar' ? (
              <BothChart
                fromDate={submittedData.fromDate}
                toDate={submittedData.toDate}
                accounts={submittedData.accounts}
              />
            ) : (
              <PieChartComponent
                fromDate={submittedData.fromDate}
                toDate={submittedData.toDate}
                accounts={submittedData.accounts}
                type="both"
                groupBy={submittedData.groupBy}
              />
            ))}
          {submittedData.type === '1' &&
            submittedData.groupBy === '0' &&
            (submittedData.chartType === 'bar' ? (
              <IncomeMainCategoryChart
                fromDate={submittedData.fromDate}
                toDate={submittedData.toDate}
                accounts={submittedData.accounts}
                type="1"
              />
            ) : (
              <PieChartComponent
                fromDate={submittedData.fromDate}
                toDate={submittedData.toDate}
                accounts={submittedData.accounts}
                type="1"
                groupBy="main"
              />
            ))}
          {submittedData.type === '0' &&
            submittedData.groupBy === '0' &&
            (submittedData.chartType === 'bar' ? (
              <ExpenseMainCategoryChart
                fromDate={submittedData.fromDate}
                toDate={submittedData.toDate}
                accounts={submittedData.accounts}
                type="0"
              />
            ) : (
              <PieChartComponent
                fromDate={submittedData.fromDate}
                toDate={submittedData.toDate}
                accounts={submittedData.accounts}
                type="0"
                groupBy="main"
              />
            ))}
          {submittedData.type === '1' &&
            submittedData.groupBy === '1' &&
            (submittedData.chartType === 'bar' ? (
              <IncomeSubcategoryChart
                fromDate={submittedData.fromDate}
                toDate={submittedData.toDate}
                accounts={submittedData.accounts}
                type="1"
              />
            ) : (
              <PieChartComponent
                fromDate={submittedData.fromDate}
                toDate={submittedData.toDate}
                accounts={submittedData.accounts}
                type="1"
                groupBy="subcategory"
              />
            ))}
          {submittedData.type === '0' &&
            submittedData.groupBy === '1' &&
            (submittedData.chartType === 'bar' ? (
              <ExpenseSubcategoryChart
                fromDate={submittedData.fromDate}
                toDate={submittedData.toDate}
                accounts={submittedData.accounts}
                type="0"
              />
            ) : (
              <PieChartComponent
                fromDate={submittedData.fromDate}
                toDate={submittedData.toDate}
                accounts={submittedData.accounts}
                type="0"
                groupBy="subcategory"
              />
            ))}
        </div>
      )}
    </>
  );
}

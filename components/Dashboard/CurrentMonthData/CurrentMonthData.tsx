import { DonutChart } from '@mantine/charts';
import { Box, Grid, Text } from '@mantine/core';
import classes from './CurrentMonthDate.module.css';

interface CurrentMonthDataProps {
  income: number;
  expense: number;
}
export default function CurrentMonthData({
  income,
  expense,
}: CurrentMonthDataProps) {
  const data = [
    { name: 'Income', value: income, color: 'green.6' },
    { name: 'Expense', value: expense, color: 'red.6' },
  ];

  const remain = income - expense;
  const remainColor = remain > 0 ? 'green' : 'red';
  return (
    <Box>
      <Grid columns={16}>
        <Grid.Col span={8}>
          <DonutChart data={data} />
        </Grid.Col>
        <Grid.Col span={8}>
          <Text className={classes.income}>Thu nhập: {income}</Text>
          <Text className={classes.expense}>Chi tiêu: {expense}</Text>
          <div className={classes.line}></div>
          <Text className={classes.remain} style={{ color: remainColor }}>
            Còn lại: {remain}
          </Text>
        </Grid.Col>
      </Grid>
    </Box>
  );
}

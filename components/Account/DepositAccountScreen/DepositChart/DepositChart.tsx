import { AreaChart } from '@mantine/charts';
import { Paper } from '@mantine/core';
import classes from './DepositChart.module.css';
interface DepositChart {
  principal: number;
  interest: number;
  startDate: Date;
}

export default function DepositChart({
  principal,
  interest,
  startDate,
}: DepositChart) {
  let months = 60;
  let amount = principal;
  let data = [];
  const monthlyRate = interest / 12 / 100;
  console.log(monthlyRate);
  for (let i = 0; i < months; i++) {
    amount = amount * (1 + monthlyRate);

    const date = new Date(startDate);
    date.setMonth(date.getMonth() + i);
    data.push({
      date: `${date.getFullYear()}-${date.getMonth() + 1}`, // Format: YYYY-MM
      amount: amount.toFixed(2),
    });
  }
  console.log(data);

  return (
    <Paper radius="md" shadow="sm" withBorder className={classes.card} mb={40}>
      <AreaChart
        h={300}
        data={data}
        dataKey="date"
        series={[{ name: 'amount', color: 'indigo.6' }]}
        curveType="linear"
      />
    </Paper>
  );
}

import { Paper, Text } from '@mantine/core';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface MonthlyData {
  month: string;
  income: number;
  expense: number;
  remainder: number;
}
export default function NetworkChangeChart({ data }: { data: MonthlyData[] }) {
  return (
    <Paper mt="md">
      <Text size="lg" mb="md" style={{ fontWeight: 700, fontSize: '20px' }}>
        Biểu đồ thay đổi giá trị tài sản trong 6 tháng
      </Text>
      <ComposedChart
        width={800}
        height={400}
        data={data}
        stackOffset="sign"
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="income" fill="green" name="Income" stackId="stack" />
        <Bar dataKey="expense" fill="red" name="Expense" stackId="stack" />
        <Line
          type="monotone"
          dataKey="remainder"
          stroke="blue"
          name="Networth Change"
        />
      </ComposedChart>
    </Paper>
  );
}

import React from 'react';
import {
  LineChart,ComposedChart, Bar,BarChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, ReferenceLine
} from 'recharts';
import useTimeChart from '@/hooks/useTimeChart';
// interface SummaryData {
//   [key: string]: {
//     income: number;
//     expense: number;
//   };
// }

// interface Props {
//   summaryData: SummaryData;
// }
interface TimeProps{
    accounts : string[]
    from : Date 
    to : Date
}

const TimeChart: React.FC<TimeProps> = ({ accounts,from,to }) => {
  // Prepare data for the Transactions Chart
  const summaryData = useTimeChart(accounts,from,to)
  const transactionData = Object.keys(summaryData).map(date => ({
    date,
    income: summaryData[date].income,
    expense: summaryData[date].expense,
    cashflow: summaryData[date].income + summaryData[date].expense,
  }));

  // Prepare data for the Cash Flow Line Chart
  
  const cashFlowData = Object.keys(summaryData).map(date => {
    let cumulativeCashFlow = 0;
    cumulativeCashFlow += (summaryData[date].income + summaryData[date].expense);
    return {
      date,
      cashFlow: cumulativeCashFlow,
    };
  });

  return (
    <div>
      <h3>Cashflow</h3>
        <ComposedChart
          data={transactionData}
          width={1000}
            height={500}
          margin={{
            top: 5, right: 30, left: 20, bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Area
            type="monotone"
            dataKey="cashflow"
            stroke="#000000"
            fill="url(#colorNet)"
            fillOpacity={1}
            isAnimationActive={false}
          />
          <defs>
            <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#82ca9d" stopOpacity={1} />
              <stop offset="100%" stopColor="#8884d8" stopOpacity={1} />
            </linearGradient>
          </defs>
        </ComposedChart>

      <h3>Transactions</h3>
        <BarChart
          data={transactionData}
          width={1000}
          height={500}
          margin={{
            top: 5, right: 30, left: 20, bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="income" fill="#82ca9d" />
          <Bar dataKey="expense" fill="#ff4d4f" />
        </BarChart>

    </div>
  );
};

export default TimeChart;

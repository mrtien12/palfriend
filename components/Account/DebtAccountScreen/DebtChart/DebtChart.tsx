import { differenceInMonths, addMonths, format, isBefore } from 'date-fns';
import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, ComposedChart,Tooltip, Legend, ResponsiveContainer, Area
} from 'recharts';
interface PaymentData {
  date: string;
  principal: number;
  currentDebt: number;
  amortizedDebt: number;
}

function generatePaymentData(principal: number, currentDebt: number, annualRate: number, months: number, startDate: Date): { pastData: PaymentData[], futureData: PaymentData[] } {
  const monthlyRate = annualRate / 12 / 100;
  const monthlyPayment = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);

  const pastData: PaymentData[] = [];
  const futureData: PaymentData[] = [];

  let remainingDebt = currentDebt;
  let date = startDate;
  const today = new Date();

  for (let i = 0; i < months; i++) {
    const interestPayment = remainingDebt * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    remainingDebt -= principalPayment;

    const paymentData: PaymentData = {
      date: format(date, 'yyyy-MM-dd'),
      principal: principal,
      currentDebt: currentDebt,
      amortizedDebt: remainingDebt < 0 ? 0 : remainingDebt // Ensure debt does not go below 0
    };

    if (isBefore(date, today)) {
      pastData.push(paymentData);
    } else {
      futureData.push(paymentData);
    }

    date = addMonths(date, 1);
  }

  return { pastData, futureData };
}



export default function DebtData(){
    
    // Example usage
    const principal = 100000;
const currentDebt = 80000; // Current debt amount
const annualRate = 12; // Annual interest rate in percentage
const months = 36; // Total months
const startDate = new Date(2024, 5, 5); // Start date

const { pastData, futureData } = generatePaymentData(principal, currentDebt, annualRate, months, startDate);
console.log(pastData, futureData);
     
    return (
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart
          margin={{
            top: 5, right: 30, left: 20, bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" domain={[0, principal]} />
          <Tooltip />
          <Legend />
  
          {/* Shaded area for past payments */}
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="amortizedDebt"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.3}
            isAnimationActive={false}
            activeDot={{ r: 8 }}
            data={pastData}
          />
  
          {/* Line for future payments */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="amortizedDebt"
            stroke="#82ca9d"
            activeDot={{ r: 8 }}
            data={futureData}
          />
        </ComposedChart>
      </ResponsiveContainer>
    );
    };



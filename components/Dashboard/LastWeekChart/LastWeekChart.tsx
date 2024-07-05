import { BarChart } from '@mantine/charts';
import { Paper, Select, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
interface LastWeekChartProps {
  chartData: { date: string; income?: number; expense?: number }[];
}

export default function LastWeekChart({ chartData }: LastWeekChartProps) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const series = [
    { name: 'income', color: 'green' },
    { name: 'expense', color: 'red' },
  ];
  const [mode, setMode] = useState('expense');
  const [filteredData, setFilteredData] = useState(chartData);
  const [filteredSeries, setFilteredSeries] = useState(series);

  useEffect(() => {
    if (mode === 'income') {
      setFilteredData(() =>
        chartData.map(({ date, income }) => ({ date, income }))
      );
      setFilteredSeries(() => [series[0]]);
    } else if (mode === 'expense') {
      setFilteredData(() =>
        chartData.map(({ date, expense }) => ({ date, expense }))
      );
      setFilteredSeries(() => [series[1]]);
    } else {
      setFilteredData(chartData);
      setFilteredSeries(() => series);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartData, mode]);

  console.log(filteredData);

  return (
    <Paper>
      <Text style={{ fontWeight: 700, fontSize: '20px' }}>
        Tổng hợp thông tin trong tuần
      </Text>
      <Select
        value={mode}
        onChange={(value) => setMode(value as string)}
        data={[
          { value: 'income', label: 'Thu nhập' },
          { value: 'expense', label: 'Chi tiêu' },
          { value: 'both', label: 'Cả hai' },
        ]}
        style={{ marginBottom: '10px' }}
      />

      <BarChart
        h={300}
        data={filteredData}
        dataKey="date"
        series={filteredSeries}
        tickLine="none"
        gridAxis="xy"
      />
    </Paper>
  );
}

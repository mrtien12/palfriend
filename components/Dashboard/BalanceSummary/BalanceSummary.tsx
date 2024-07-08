import { Box, Text } from '@mantine/core';
import classes from './BalanceSummary.module.css';

interface BalanceSummaryProps {
  balance: number;
  debt: number;
}

export default function BalanceSummary({ balance, debt }: BalanceSummaryProps) {
  return (
    <div className={classes.container}>
      <Box className={classes.boxContainer}>
        <Text className={classes.title}>Tổng quan số dư </Text>
        <div className={classes.item}>
          <Text style={{ fontWeight: 700, width: '70px' }}>Số dư: </Text>
          <Text>
            {balance ? new Intl.NumberFormat().format(balance) : 0} VNĐ
          </Text>
        </div>
        <div className={classes.item}>
          <Text style={{ fontWeight: 700, width: '80px' }}>Số nợ: </Text>
          <Text>{debt ? new Intl.NumberFormat().format(debt) : 0} VNĐ</Text>
        </div>
      </Box>
    </div>
  );
}

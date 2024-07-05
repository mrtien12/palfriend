import { CreditCardAccount } from '@/types/account';
import {
  calculateFinalDate,
  calculatePaymentDate,
} from '@/utils/calculatePaymentDay';
import { Badge, Box, Grid, Paper, Text, ThemeIcon, rem } from '@mantine/core';
import { IconSwimming } from '@tabler/icons-react';
import { differenceInCalendarDays, format } from 'date-fns';
import classes from './CreditAccountStat.module.css';

interface CreditAccountStatProps {
  account: CreditCardAccount;
}

export default function CreditAccountStat({ account }: CreditAccountStatProps) {
  const today = new Date();
  const payoutDate = calculatePaymentDate(
    account.paymentDay,
    today.getMonth() + 1,
    today.getFullYear()
  );
  // const finalDate = calculateFinalDate(account.paymentDay, today.getMonth() + 1, today.getFullYear(), account.gracePeriod);
  const formattedPayoutDate = format(payoutDate, 'dd MMM yyyy');
  const finalDate = calculateFinalDate(
    account.paymentDay,
    today.getMonth() + 1,
    today.getFullYear(),
    account.grace
  );
  console.log(finalDate);
  const formattedFinalDate = format(finalDate, 'dd MMM yyyy');
  const daysLeft = Math.abs(differenceInCalendarDays(today, finalDate));

  return (
    <Paper
      radius="md"
      shadow="sm"
      withBorder
      className={classes.card}
      mt={20}
      mb={40}
    >
      <ThemeIcon className={classes.icon} size={60} radius={60}>
        <IconSwimming
          style={{ width: rem(32), height: rem(32) }}
          stroke={1.5}
        />
      </ThemeIcon>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '40px',
        }}
      >
        <Text ta="center" fw={700} className={classes.title}>
          {account.name}
        </Text>
        <Badge size="sm">
          {`${daysLeft} ngày đến ngày ${formattedPayoutDate}`}
        </Badge>
      </div>

      <Grid className={classes.infoContainer}>
        <Grid.Col span={2.4}>
          <Box className={classes.boxContainer}>
            <Text className={classes.boxTitle}>Số dư hiện tại:</Text>
            <Text className={classes.boxDescription}>
              {new Intl.NumberFormat().format(account.amount)} VNĐ
            </Text>
          </Box>
        </Grid.Col>

        <Grid.Col span={2.4}>
          <Box className={classes.boxContainer}>
            <Text className={classes.boxTitle}>Loại ngày chi trả:</Text>
            <Text className={classes.boxDescription}>
              {account.paymentDay === '32' ? 'Ngày cuối tháng' : 'Ngày cụ thể'}
            </Text>
          </Box>
        </Grid.Col>

        <Grid.Col span={2.4}>
          <Box className={classes.boxContainer}>
            <Text className={classes.boxTitle}>Lãi suất(%):</Text>
            <Text className={classes.boxDescription}>
              {account.interestRate}%
            </Text>
          </Box>
        </Grid.Col>

        <Grid.Col span={2.4}>
          <Box className={classes.boxContainer}>
            <Text className={classes.boxTitle}>Số ngày ân nợ:</Text>
            <Text className={classes.boxDescription}>{account.grace} ngày</Text>
          </Box>
        </Grid.Col>

        <Grid.Col span={2.4}>
          <Box className={classes.boxContainer}>
            <Text className={classes.boxTitle}>Vào:</Text>
            <Text className={classes.boxDescription}>
            Ngày {account.paymentDay} hàng tháng
            </Text>
          </Box>
        </Grid.Col>
      </Grid>
    </Paper>
  );
}

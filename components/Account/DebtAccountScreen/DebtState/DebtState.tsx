import { DebtAccount } from '@/types/account';
import { calculateAmortization } from '@/utils/calculateAmortization';
import {
  calculatePaymentDate,
  daysFromPaymentDate,
} from '@/utils/calculatePaymentDay';
import { Badge, Box, Grid, Paper, Text, ThemeIcon, rem } from '@mantine/core';
import { IconSwimming } from '@tabler/icons-react';
import { format } from 'date-fns';
import classes from './DebtState.module.css';
interface DebtStateProps {
  account: DebtAccount;
}
export default function DebtState({ account }: DebtStateProps) {
  const today = new Date();
  const payoutDate = calculatePaymentDate(
    account.paymentDay,
    today.getMonth() + 1,
    today.getFullYear()
  );
  const formattedPayoutDate = format(payoutDate, ' dd MMM yyyy');
  const daysLeft = daysFromPaymentDate(
    account.paymentDay,
    today.getMonth() + 1,
    today.getFullYear()
  );
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
          {`${daysLeft} ngày còn lại cho đến ${formattedPayoutDate}`}
        </Badge>
      </div>

      <Grid className={classes.infoContainer}>
        <Grid.Col span={3}>
          <Box className={classes.boxContainer}>
            <Text className={classes.boxTitle}>Số nợ ban đầu:</Text>
            <Text className={classes.boxDescription}>
              {new Intl.NumberFormat().format(-account.principal)} VNĐ
            </Text>
          </Box>
        </Grid.Col>

        <Grid.Col span={3}>
          <Box className={classes.boxContainer}>
            <Text className={classes.boxTitle}>Loại ngày trả nợ:</Text>
            <Text className={classes.boxDescription}>
              {account.paymentDay === '32' ? 'Ngày cuối tháng' : 'Ngày cụ thể'}
            </Text>
          </Box>
        </Grid.Col>

        <Grid.Col span={3}>
          <Box className={classes.boxContainer}>
            <Text className={classes.boxTitle}>Khuyến nghị trả nợ hàng tháng :</Text>
            <Text className={classes.boxDescription}>
              {new Intl.NumberFormat().format(
                calculateAmortization(
                  account.principal,
                  account.interestRate,
                  account.months
                )
              )}{' '}
              VNĐ
            </Text>
          </Box>
        </Grid.Col>

        <Grid.Col span={3}>
          <Box className={classes.boxContainer}>
            <Text className={classes.boxTitle}>Lãi suất:</Text>
            <Text className={classes.boxDescription}>
              {account.interestRate}%
            </Text>
          </Box>
        </Grid.Col>
      </Grid>
    </Paper>
  );
}

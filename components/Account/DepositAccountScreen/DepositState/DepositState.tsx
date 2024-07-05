import { DepositAccount } from '@/types/account';
import { calculateDates } from '@/utils/calculateDates';
import { calculateInterest } from '@/utils/calculateInterest';
import { Badge, Box, Grid, Paper, Text, ThemeIcon } from '@mantine/core';
import { IconLock } from '@tabler/icons-react';
import classes from './DepositState.module.css';
interface DepositStateProps {
  account: DepositAccount;
}
interface AccountDetails {
  phase: '0' | '1' | '2' | '3' | '4';
}

export default function DepositState({ account }: DepositStateProps) {
  const phases: Record<AccountDetails['phase'], number> = {
    '0': 0, // Demand Deposit, no fixed term
    '1': 1, // 1 month term
    '2': 3, // 3 months term
    '3': 6, // 6 months term
    '4': 12, // 12 months term
  };
  return (
    <Paper radius="md" shadow="sm" withBorder className={classes.card} mb={40}>
      <div className={classes.titleContainer}>
        <ThemeIcon className={classes.icon} size={60} radius={60}>
          <IconLock size={40} />
        </ThemeIcon>
        <Text className={classes.titleSaving}>Tiết kiệm</Text>
      </div>

      <div className={classes.itemContainer}>
        <Text className={classes.name}>Tài khoản:</Text>
        <Text className={classes.title}>{account.name}</Text>
        {account.phase !== '0' && (
          <Badge size="sm">
            {calculateDates(new Date(), account.settlementDate)} ngày còn lại
          </Badge>
        )}
      </div>

      <Grid style={{ marginBottom: '10px' }} className={classes.infoContainer}>
        <Grid.Col span={3}>
          <Box className={classes.boxContainer}>
            <Text className={classes.boxTitle}>
              {account.phase === '0' ? '' : `Kỳ hạn:`}
            </Text>
            <Text className={classes.boxDescription}>
              {account.phase === '0'
                ? 'Không kỳ hạn'
                : `${phases[account.phase as keyof typeof phases]} tháng`}
            </Text>
          </Box>
        </Grid.Col>

        <Grid.Col span={3}>
          <Box className={classes.boxContainer}>
            <Text className={classes.boxTitle}>Số tiền gửi:</Text>
            <Text className={classes.boxDescription}>{account.amount}</Text>
          </Box>
        </Grid.Col>

        <Grid.Col span={3}>
          <Box className={classes.boxContainer}>
            <Text className={classes.boxTitle}>Số tiền lãi hàng tháng:</Text>
            <Text className={classes.boxDescription}>
              $
              {calculateInterest(
                account.amount,
                account.interestRate,
                account.phase
              )}
            </Text>
          </Box>
        </Grid.Col>

        <Grid.Col span={3}>
          <Box className={classes.boxContainer}>
            <Text className={classes.boxTitle}>
              {account.phase === '0'
                ? 'Không có ngày tất toán.'
                : `Ngày tất toán:`}
            </Text>
            <Text className={classes.boxDescription}>
              {account.phase === '0'
                ? ''
                : `${account.settlementDate.toDateString()}`}
            </Text>
          </Box>
        </Grid.Col>
      </Grid>
    </Paper>
  );
}

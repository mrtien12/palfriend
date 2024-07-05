import { CheckingAccount } from '@/types/account';
import { Box, Grid, Paper, Text, ThemeIcon } from '@mantine/core';
import { HiOutlineBanknotes } from 'react-icons/hi2';
import classes from './CheckingStat.module.css';

interface CheckingStatProps {
  account: CheckingAccount;
}

export default function CheckingStat({ account }: CheckingStatProps) {
  const today = new Date();
  return (
    <Paper radius="md" shadow="sm" withBorder className={classes.card} mb={40}>
      <div className={classes.container}>
        <div className={classes.mainTitleContainer}>
          <ThemeIcon className={classes.icon} size={60} radius={60}>
            <HiOutlineBanknotes size={40} />
          </ThemeIcon>
          <Text className={classes.mainTitle}>Tài khoản giao dịch</Text>
        </div>

        <Grid
          style={{ marginTop: '40px' }}
          className={classes.infoContainer}
        >
          <Grid.Col span={4}>
            <Box className={classes.boxContainer}>
              <Text className={classes.boxTitle}>Tài khoản:</Text>
              <Text className={classes.boxDescription}>{account.name}</Text>
            </Box>
          </Grid.Col>

          <Grid.Col span={4}>
            <Box className={classes.boxContainer}>
              <Text className={classes.boxTitle}>Ngân hàng:</Text>
              <Text className={classes.boxDescription}>{account.bank}</Text>
            </Box>
          </Grid.Col>

          <Grid.Col span={4}>
            <Box className={classes.boxContainer}>
              <Text className={classes.boxTitle}>Số dư:</Text>
              <Text className={classes.boxDescription}>
                {account.amount
                  ? new Intl.NumberFormat().format(account.amount)
                  : 0}{' '}
                VNĐ
              </Text>
            </Box>
          </Grid.Col>
        </Grid>
      </div>
    </Paper>
  );
}

import useAccounts from '@/hooks/useAccount';
import useBalance from '@/hooks/useBalance';
import useLastMonth from '@/hooks/useLastMonth';
import useLastSixMonths from '@/hooks/useLastSixMonth';
import useLastWeek from '@/hooks/useLastWeek';
import useMonthly from '@/hooks/useMonthly';
import useTop10NearestTransactions from '@/hooks/usetop10trans';
import { Grid, Paper } from '@mantine/core';
import BalanceSummary from './BalanceSummary/BalanceSummary';
import CurrentMonthData from './CurrentMonthData/CurrentMonthData';
import classes from './DashboardScreen.module.css';
import LastWeekChart from './LastWeekChart/LastWeekChart';
import SixMonthChart from './SixMonthChart/SixMonthChart';
import Top10NearestTransactions from './Top10NearestTransactions';

export default function DashboardScreen() {
  const data = useMonthly();
  const lastMonthdata = useLastMonth();
  const summary = useBalance();
  const weekly = useLastWeek();
  const sixmonth = useLastSixMonths();
  const recent = useTop10NearestTransactions();
  const accounts = useAccounts();

  return (
    <>
      <Grid style={{ marginBottom: '10px' }}>
        <Grid.Col span={4}>
          <Paper
            radius="md"
            shadow="sm"
            withBorder
            className={classes.card}
            style={{ height: '100%', backgroundColor: '#e0eaf2' }}
            mb={40}
          >
            <BalanceSummary balance={summary.balance} debt={summary.debt} />
          </Paper>
        </Grid.Col>
        <Grid.Col span={4}>
          {data && (
            <Paper
              radius="md"
              shadow="sm"
              withBorder
              className={classes.card}
              mb={40}
              style={{ height: '100%' }}
            >
              <CurrentMonthData income={data.income} expense={data.expense} />
            </Paper>
          )}
        </Grid.Col>
        <Grid.Col span={4}>
          {lastMonthdata && (
            <Paper
              radius="md"
              shadow="sm"
              withBorder
              className={classes.card}
              mb={40}
              style={{ height: '100%' }}
            >
              <CurrentMonthData
                income={lastMonthdata.income}
                expense={lastMonthdata.expense}
              />
            </Paper>
          )}
        </Grid.Col>
      </Grid>
      <Paper
        radius="md"
        shadow="sm"
        withBorder
        className={classes.card}
        mb={40}
      >
        <LastWeekChart chartData={weekly} />
      </Paper>
      <Paper
        radius="md"
        shadow="sm"
        withBorder
        className={classes.card}
        mb={40}
      >
        <SixMonthChart data={sixmonth} />
      </Paper>

      <Paper
        radius="md"
        shadow="sm"
        withBorder
        className={classes.card}
        mb={40}
      >
        <Top10NearestTransactions data={recent} accounts={accounts} />
      </Paper>
    </>
  );
}

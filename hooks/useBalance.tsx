import { useState, useEffect } from 'react';
import useAccounts from '@/hooks/useAccount'; // Import the useAccounts hook

type Balance = {
  balance: number;
  debt: number;
};

export default function useBalance(): Balance {
  const accounts = useAccounts();
  const [balance, setBalance] = useState<number>(0);
  const [debt, setDebt] = useState<number>(0);

  useEffect(() => {
    let totalBalance = 0;
    let totalDebt = 0;

    accounts.forEach(account => {
      if (account.type === '0' || account.type === '1' || (account.type === '3' && account.amount > 0)) {
        totalBalance += account.amount;
      } else if (account.type === '2' || (account.type === '3' && account.amount < 0)) {
        totalDebt += account.amount;
      }
    });

    setBalance(totalBalance);
    setDebt(totalDebt);
  }, [accounts]);

  return { balance, debt };
}

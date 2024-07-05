import { useEffect, useState } from 'react';
import { db } from '@/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import { Transaction } from '@/types/transaction';

interface MonthlyData {
  month: string;
  income: number;
  expense: number;
  remainder: number;
}

export default function useLastSixMonths() {
  const session = useSession();
  const [lastSixMonthsData, setLastSixMonthsData] = useState<MonthlyData[]>([]);

  useEffect(() => {
    if (session.data?.user?.email) {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(endDate.getMonth() - 5);

      const q = query(
        collection(db, 'users', session?.data?.user?.email as string, 'transactions'),
        where('date', '>=', startDate),
        where('date', '<=', endDate)
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const data: MonthlyData[] = Array.from({ length: 6 }, (_, i) => {
          const date = new Date();
          date.setMonth(startDate.getMonth() + i);
          return {
            month: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
            income: 0,
            expense: 0,
            remainder: 0,
          };
        });

        querySnapshot.docs.forEach(doc => {
          const transaction = doc.data() as Transaction;
          const monthIndex = doc.data().date.toDate().getMonth() - startDate.getMonth();
          if (monthIndex >= 0 && monthIndex < 6) {
            if (transaction.type === '1') {
              data[monthIndex].income += transaction.amount;
            } else if (transaction.type === '0') {
              data[monthIndex].expense -= transaction.amount;
            }
            data[monthIndex].remainder = data[monthIndex].income + data[monthIndex].expense;
          }
        });

        setLastSixMonthsData(data);
      });

      return () => unsubscribe();
    }
  }, [session]);

  return lastSixMonthsData;
}

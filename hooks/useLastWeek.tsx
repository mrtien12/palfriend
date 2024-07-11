import { useEffect, useState } from 'react';
import { db } from '@/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import { Transaction } from '@/types/transaction';

interface DailyData {
  date: string;
  income: number;
  expense: number;
}

export default function useLastWeek(): DailyData[] {
  const session = useSession();
  const [lastWeekData, setLastWeekData] = useState<DailyData[]>([]);

  useEffect(() => {
    if (session.data?.user?.email) {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 7);

      const q = query(
        collection(db, 'users', session?.data?.user?.email as string, 'transactions'),
        where('date', '>=', startDate),
        where('date', '<=', endDate)
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const data: { [key: string]: DailyData } = {};

        // Initialize all days in the range with 0 income and expense
        for (let i = 0; i <= 6; i++) {
          const date = new Date(startDate.getTime() + i * 86400000);
          const dateString = date.toLocaleDateString('en-GB'); // Format: DD/MM/YYYY
          data[dateString] = {
            date: dateString,
            income: 0,
            expense: 0,
          };
        }

        querySnapshot.docs.forEach(doc => {
          const transaction = doc.data() as Transaction;
          const transactionDate = doc.data().date.toDate();
          const dateString = transactionDate.toLocaleDateString('en-GB'); // Format: DD/MM/YYYY

          if (!data[dateString]) {
            data[dateString] = {
              date: dateString,
              income: 0,
              expense: 0,
            };
          }

          if (transaction.type === '1') {
            data[dateString].income += transaction.amount;
          } else if (transaction.type === '0') {
            data[dateString].expense += transaction.amount;
          }
        });

        const orderedData = Object.keys(data).sort((a, b) => {
          const [dayA, monthA, yearA] = a.split('/').map(Number);
          const [dayB, monthB, yearB] = b.split('/').map(Number);
          return new Date(yearA, monthA - 1, dayA).getTime() - new Date(yearB, monthB - 1, dayB).getTime();
        }).map(date => data[date]);

        setLastWeekData(orderedData);
      });

      return () => unsubscribe();
    }
  }, [session]);

  return lastWeekData;
}

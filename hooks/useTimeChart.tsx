import { useEffect, useState } from 'react';
import { db } from '@/firebase';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import { Transaction } from '@/types/transaction';

interface TransactionSummary {
  [key: string]: {
    income: number;
    expense: number;
  };
}

function getDateRange(from: Date, to: Date): string[] {
  const dates = [];
  let currentDate = new Date(from);
  
  while (currentDate <= to) {
    dates.push(currentDate.toISOString().split('T')[0]); // Format as YYYY-MM-DD
    currentDate.setDate(currentDate.getDate() + 1); // Increment by one day
  }
  
  return dates;
}

function getCustomDateRanges(from: Date, to: Date): string[] {
  const ranges = [];
  let currentDate = new Date(from);

  // First range from 'from' to end of the first month
  const endOfFirstMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  ranges.push(`${from.toISOString().split('T')[0]} to ${endOfFirstMonth.toISOString().split('T')[0]}`);

  // Monthly ranges in between
  currentDate = new Date(endOfFirstMonth.getFullYear(), endOfFirstMonth.getMonth() + 1, 1);
  while (currentDate < to) {
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    if (endOfMonth < to) {
      ranges.push(`${currentDate.toISOString().split('T')[0]} to ${endOfMonth.toISOString().split('T')[0]}`);
    } else {
      ranges.push(`${currentDate.toISOString().split('T')[0]} to ${to.toISOString().split('T')[0]}`);
    }
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return ranges;
}

export default function useTimeChart(accounts: string[], from: Date, to: Date) {
  const session = useSession();
  const [transactionSummary, setTransactionSummary] = useState<TransactionSummary>({});
  
  useEffect(() => {
    if (session.data?.user?.email && accounts.length > 0) {
      const q = query(
        collection(db, 'users', session?.data?.user?.email as string, 'transactions'),
        where('account', 'in', accounts)
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const transactions = querySnapshot.docs.map(doc => ({
          id: doc.id,
          type: doc.data().type,
          category: doc.data().category,
          memo: doc.data().memo,
          date: doc.data().date.toDate(),
          amount: doc.data().amount,
          account: doc.data().account,
          toAccount: doc.data().toAccount,
          transferid: doc.data().transferid,
          from: doc.data().from
        }));

        const filteredTransactions = transactions.filter(transaction => 
          transaction.date >= from && transaction.date <= to
        );

        const isShortRange = (to.getTime() - from.getTime()) <= (60 * 24 * 60 * 60 * 1000);
        const dateGroups = isShortRange ? getDateRange(from, to) : getCustomDateRanges(from, to);

        const newSummary: TransactionSummary = {};

        if (isShortRange) {
          // Handle short range with daily keys
          dateGroups.forEach(dateGroup => {
            newSummary[dateGroup] = { income: 0, expense: 0 };
          });

          filteredTransactions.forEach(transaction => {
            const dateKey = transaction.date.toISOString().split('T')[0];

            if (transaction.type === '1') {  // Assuming type is number now
              newSummary[dateKey].income += transaction.amount;
            } else if (transaction.type === '0') {  // Assuming type is number now
              newSummary[dateKey].expense -= transaction.amount;
            }
          });
        } else {
          // Handle long range with monthly or custom date ranges
          dateGroups.forEach(dateGroup => {
            newSummary[dateGroup] = { income: 0, expense: 0 };
          });

          filteredTransactions.forEach(transaction => {
            const dateKey = dateGroups.find(dateRange => {
              const [start, end] = dateRange.split(' to ').map(dateStr => new Date(dateStr));
              return transaction.date >= start && transaction.date <= end;
            });

            if (dateKey) {
              if (transaction.type === '1') {  // Assuming type is number now
                newSummary[dateKey].income += transaction.amount;
              } else if (transaction.type === '0') {  // Assuming type is number now
                newSummary[dateKey].expense -= transaction.amount;
              }
            }
          });
        }

        setTransactionSummary(newSummary);
      });

      // Cleanup subscription on component unmount
      return () => {
        unsubscribe();
      };
    }
  }, [session, accounts, from, to]);

  return transactionSummary;
}

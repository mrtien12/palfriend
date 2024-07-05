import { db } from '@/firebase';
import { Transaction } from '@/types/transaction';
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function useTop10NearestTransactions() {
  const session = useSession();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (session.data?.user?.email) {
      const q = query(
        collection(
          db,
          'users',
          session?.data?.user?.email as string,
          'transactions'
        ),
        orderBy('date', 'desc'), // Order by date in descending order
        limit(10) // Limit to top 10 results
      );

      // Use onSnapshot instead of getDocs for real-time updates
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const transactionsData: Transaction[] = querySnapshot.docs.map(
          (doc) => ({
            id: doc.id,
            type: doc.data().type,
            category: doc.data().category,
            memo: doc.data().memo,
            date: doc.data().date.toDate(),
            amount: doc.data().amount,
            account: doc.data().account,
            toAccount: doc.data().toAccount,
            transferid: doc.data().transferid,
            from: doc.data().from,
          })
        );

        // Filter out transactions for transfer (type === 2) where from === false
        const filteredTransactions = transactionsData.filter((transaction) => {
          if (transaction.type === '2') {
            // For type 2 transactions, keep only those where from === true
            return transaction.from === true;
          }
          return true; // Keep all other types of transactions
        });

        setTransactions(filteredTransactions);
      });

      // Cleanup subscription on component unmount
      return () => unsubscribe();
    }
  }, [session]);

  return transactions;
}

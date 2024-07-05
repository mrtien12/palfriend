import { useEffect, useState } from 'react';
import { db } from '@/firebase';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import { Transaction } from '@/types/transaction';

export default function useTransactionByAccount(accountid : string) {
    const session = useSession();
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        if (session.data?.user?.email) {
            const q = query(collection(db, 'users', session?.data?.user?.email as string, 'transactions'),where('account', '==', accountid));
            
            // Here we use onSnapshot instead of getDocs for real-time updates
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const TransactionsData: Transaction[] = querySnapshot.docs.map(doc => ({
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
                setTransactions(TransactionsData);
            });

            // Cleanup subscription on component unmount
            return () => unsubscribe();
        }
    }, [session]);

    return transactions;

}
import { useEffect, useState } from 'react';
import { db } from '@/firebase';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import { Transaction } from '@/types/transaction';

export default function useMonthly() {
    const session = useSession();
    const [monthlySummary, setMonthlySummary] = useState<{ income: number; expense: number }>({ income: 0, expense: 0 });

    useEffect(() => {
        if (session.data?.user?.email) {
            const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth()-1, 1);
            const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() , 0);

            const q = query(
                collection(db, 'users', session?.data?.user?.email as string, 'transactions'),
                // where('account', '==', accountid),
                where('date', '>=', startOfMonth),
                where('date', '<=', endOfMonth)
            );

            // Use onSnapshot for real-time updates
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                let income = 0;
                let expense = 0;

                querySnapshot.docs.forEach(doc => {
                    const data = doc.data();
                    if (data.type === '1') {
                        income += data.amount;
                    } else if (data.type === '0') {
                        expense += data.amount;
                    }
                });

                setMonthlySummary({ income, expense });
            });

            // Cleanup subscription on component unmount
            return () => unsubscribe();
        }
    }, [session]);

    return monthlySummary;
}

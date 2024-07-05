import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { startOfMonth, endOfMonth, getMonth, getYear } from 'date-fns';

interface IncomeDateRange {
    timeid: string;
}

export default function useIncomeDateRange({ timeid }: IncomeDateRange) {
    const [totalIncome, setTotalIncome] = useState<number>(0);

    useEffect(() => {
        const fetchIncome = async () => {
            const year = parseInt(timeid.slice(0, 4), 10);
            const month = parseInt(timeid.slice(4), 10) - 1; // month is zero-indexed
            const startDate = startOfMonth(new Date(year, month));
            const endDate = endOfMonth(new Date(year, month));

            let total = 0;

            // Fetch transactions
            const transactionsRef = collection(db, 'users', 'your-email@example.com', 'transactions');
            const transactionsQuery = query(
                transactionsRef,
                where('onBudget', '==', true),
                where('transactionDate', '>=', startDate),
                where('transactionDate', '<=', endDate)
            );
            const transactionsSnapshot = await getDocs(transactionsQuery);
            transactionsSnapshot.forEach((doc) => {
                total += doc.data().amount;
            });

            // Fetch scheduled
            const scheduledRef = collection(db, 'users', 'your-email@example.com', 'scheduled');
            const scheduledQuery = query(
                scheduledRef,
                where('onBudget', '==', true),
                where('upcomingDate', '>=', startDate),
                where('upcomingDate', '<=', endDate)
            );
            const scheduledSnapshot = await getDocs(scheduledQuery);
            scheduledSnapshot.forEach((doc) => {
                total += doc.data().amount;
            });

            setTotalIncome(total);
        };

        fetchIncome();
    }, [timeid]);

    return totalIncome;
}

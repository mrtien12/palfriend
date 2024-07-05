import { useState, useEffect } from 'react';
import { db } from '@/firebase';
import { collection, query, onSnapshot, where, QueryConstraint } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import { Transaction } from '@/types/transaction';

interface PieGraph {
    fromDate: Date;
    toDate: Date;
    accounts: string[];
    type: string;
    groupBy: string;
}

export default function usePieGraph({ fromDate, toDate, accounts, type, groupBy }: PieGraph) {
    const [data, setData] = useState<Transaction[]>([]);
    const session = useSession();

    useEffect(() => {
        if (session) {
            const conditions: QueryConstraint[] = [];
            if (accounts.length > 0) {
                conditions.push(where('account', 'in', accounts));
            }
            if (fromDate) {
                conditions.push(where('date', '>=', fromDate));
            }
            if (toDate) {
                conditions.push(where('date', '<=', toDate));
            }
            if (type !== null) {
                conditions.push(where('type', '==', type));
            }

            const q = query(collection(db,'users',session.data?.user?.email as string, 'transactions'), ...conditions);
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const transactions: Transaction[] = [];
                querySnapshot.forEach((doc) => {
                    transactions.push(doc.data() as Transaction);
                });
                setData(transactions);
            });
            return unsubscribe;
        }
    }, [fromDate, toDate, accounts, type, groupBy]);
    return data;
}

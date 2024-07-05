import { useEffect, useState } from "react";
import { Transaction } from '@/types/transaction';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { db } from '@/firebase';
import { onSnapshot, where, query, collection, QueryConstraint } from 'firebase/firestore';
import useAccounts from '@/hooks/useAccount';

const deFormatDate = (date: string) => {
    const day = date.substring(0, 2);
    const month = date.substring(2, 4);
    const year = date.substring(4, 8);
    const formattedDate = `${year}-${month}-${day}`;
    return new Date(formattedDate);
};

export default function useFilterInsight(accountNames: string, startDate: string, endDate: string, categories: string, type: string | null) {
    const { data: session, status } = useSession({
        required: true,
        onUnauthenticated() {
            redirect('/signin');
        }
    });

    const sDate = startDate ? deFormatDate(startDate) : null;
    const eDate = endDate ? deFormatDate(endDate) : null;

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const accounts = useAccounts();

    useEffect(() => {
        if (session?.user?.email && accounts.length > 0) {
            const accountNameList = accountNames ? accountNames.split('&') : [];
            const accountMap = accounts.reduce((acc, account) => {
                acc[account.name] = account.id;
                return acc;
            }, {} as Record<string, string>);

            const accountIds = accountNameList.map(name => accountMap[name]).filter(id => !!id);

            const categoryList = categories ? categories.split('&').filter(category => category !== 'Initial Balance') : [];

            if (accountIds.length === 0 || categoryList.length === 0) {
                setTransactions([]);
                setLoading(false);
                return;
            }

            const constraints: QueryConstraint[] = [];

            if (accountIds.length > 0) {
                constraints.push(where('account', 'in', accountIds));
            }
            if (sDate && eDate) {
                constraints.push(where('date', '>=', sDate));
                constraints.push(where('date', '<=', eDate));
            }
            if (type) {
                constraints.push(where('type', '==', type));
            }

            const userTransactionsRef = collection(db, 'users', session.user.email, 'transactions');
            const q = constraints.length > 0 ? query(userTransactionsRef, ...constraints) : query(userTransactionsRef);

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const transactionList = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        ...data,
                        id: doc.id,
                        date: data.date.toDate(),  // Convert Firestore timestamp to Date
                    } as Transaction;
                });

                const filteredTransactions = transactionList.filter(transaction => 
                    categoryList.some(category => transaction.category.startsWith(category))
                );

                setTransactions(filteredTransactions);
                setLoading(false);
            }, (err) => {
                setError(err.message);
                setLoading(false);
            });

            return () => unsubscribe();
        } else if (session?.user?.email) {
            const userTransactionsRef = collection(db, 'users', session.user.email, 'transactions');
            const unsubscribe = onSnapshot(userTransactionsRef, (snapshot) => {
                const transactionList = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        ...data,
                        id: doc.id,
                        date: data.date.toDate(),  // Convert Firestore timestamp to Date
                    } as Transaction;
                });
                setTransactions(transactionList);
                setLoading(false);
            }, (err) => {
                setError(err.message);
                setLoading(false);
            });

            return () => unsubscribe();
        }
    }, [session, accounts, accountNames, startDate, endDate, categories, type]);

    return { transactions, loading, error }
}

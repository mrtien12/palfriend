import { useState, useEffect } from 'react';
import { collection, where, query, QueryConstraint,orderBy,onSnapshot, limit, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { Transaction } from '@/types/transaction';
import { useSession } from 'next-auth/react';

interface QueryParams {
    limit? : number;
    orderBy? : string;
    start?: string;
    end?: string;
    amount?: string;
    account?: string;    
    category?: string;
    orderDirection?: 'asc' | 'desc';
    type?: '0' | '1' | '2';
}


interface UseDynamicTransactions {
   query1: QueryParams;
}
export default function useDynamicTransactions({ query1 }: UseDynamicTransactions) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const session = useSession()
    useEffect(() =>{
        const fetchTransactions = async () =>{
            setLoading(true);
            setError(null);
        }
        try {

            if (Object.keys(query1).length === 0) {
                setTransactions([]);
                setLoading(false);
                return;
            }
            const conditions: QueryConstraint[] = [];
            
            if (query1.start && query1.end){
                conditions.push(where('date','>=', new Date(query1.start)));
                conditions.push(where('date','<=',new Date(query1.end)));
            }       
            if (query1.amount) {
                const [operator, value] = query1.amount.split(' ');
                conditions.push(where('amount', operator as any, parseFloat(value)));

            }

            if (query1.account) {
                conditions.push(where('account','==',query1.account));
            }

            if (query1.category) {
                conditions.push(where('category','>=',query1.category));
                conditions.push(where('category','<',query1.category + '\uf8ff'))
            }

            if (query1.limit) {
                conditions.push(limit(query1.limit));
            }
            if (query1.orderBy && query1.orderDirection){
                conditions.push(orderBy(query1.orderBy,query1.orderDirection))
            }
            if (query1.type) {
                conditions.push(where('type','==',query1.type));
            }
            const q = query(collection(db, 'users',session.data?.user?.email as string,'transactions'), ...conditions);
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const transactions: Transaction[] = [];
                querySnapshot.forEach((doc) => {
                    transactions.push({ ...doc.data(), date: doc.data().date.toDate() } as Transaction);
                });
                setTransactions(transactions);
            });
            return unsubscribe;

        }

        catch(err){
            setError(error)
        }
    }, [session,query1]
    
    )

    return transactions;
    
}
import {useState, useEffect} from 'react';
import {useSession} from 'next-auth/react';
import {redirect} from 'next/navigation';
import { Budget } from '@/types/budget';
import { db } from '@/firebase';
import { collection, getDocs, onSnapshot, query, where } from 'firebase/firestore';

export default function useBudgets() {
    const session = useSession({
        required: true,
        onUnauthenticated() {
            redirect('/signin');
        }
    });

    const [budgets, setBudgets] = useState<Budget[]>([]);

    
    useEffect(() =>{
        if (session.data?.user?.email) {
            const q   = query(collection(db, 'users', session.data?.user?.email as string, 'budgets'));
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const budgetsData: Budget[] = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    name: doc.data().name,
                    amount: doc.data().amount,
                    category: doc.data().category,
                    accounts: doc.data().accounts,
                    startDate: doc.data().startDate.toDate(),
                    endDate: doc.data().endDate.toDate(),
                    recurring: doc.data().recurring,
                    currentAmount: doc.data().currentAmount,
                    type: doc.data().type,
                }));
                setBudgets(budgetsData);
            });
            return () => unsubscribe();
        }
    }, [session.data?.user?.email]);

    
        
    return budgets;
}
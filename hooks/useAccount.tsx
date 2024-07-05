import { useEffect, useState } from 'react';
import { db } from '@/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import { Account } from '@/types/account';
export default function useAccounts() {
    const session = useSession();
    const [accounts, setAccounts] = useState<Account[]>([]);

    useEffect(() => {
        if (session.data?.user?.email) {
            const q = query(collection(db, 'users', session?.data?.user?.email as string, 'accounts'));
            
            // Here we use onSnapshot instead of getDocs for real-time updates
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const accountsData: Account[] = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    email: doc.data().email,
                    name: doc.data().name,
                    amount: doc.data().amount,
                    type: doc.data().type,
                    
                    
                    
                }));
                setAccounts(accountsData);
            });

            // Cleanup subscription on component unmount
            return () => unsubscribe();
        }
    }, [session]);

    return accounts;
}

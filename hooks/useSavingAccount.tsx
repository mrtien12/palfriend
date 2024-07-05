import { useEffect, useState } from 'react';
import { db } from '@/firebase';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import { Account, DepositAccount } from '@/types/account';

export default function useSavingAccounts() {
    const { data: session } = useSession();
    const [accounts, setAccounts] = useState<{ id: string, name: string }[]>([]);
    const today = new Date();
    const todayString = today.toISOString().split('T')[0]; // Format date to YYYY-MM-DD

    useEffect(() => {
        if (session?.user?.email) {
            const q = query(
                collection(db, 'users', session.user.email as string, 'accounts'),
                where('type', '==', '1')
            );

            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const fetchedAccounts: { id: string, name: string }[] = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data() as DepositAccount;
                    
                    const settlementDate = doc.data().settlementDate.toDate().toISOString().split('T')[0];
                    if (data.phase !== '0' && settlementDate !== todayString) {
                        fetchedAccounts.push({
                            id: doc.id,
                            name: data.name,
                        });
                    }
                    

                });
                setAccounts(fetchedAccounts);
            });

            return () => unsubscribe();
        }
    }, [session]);

    return accounts;
}

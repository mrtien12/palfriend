import { useEffect, useState } from 'react';
import { db } from '@/firebase';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import { Transaction } from '@/types/transaction';
import {ScheduleTransaction} from '@/types/transaction';
export default function useScheduleByAccount() {
    const session = useSession();
    const [schedule, setSchedule] = useState<ScheduleTransaction[]>([]);

    useEffect(() => {
        if (session.data?.user?.email) {
            const q = query(collection(db, 'users', session?.data?.user?.email as string, 'scheduled'));
            
            // Here we use onSnapshot instead of getDocs for real-time updates
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const scheduledata: ScheduleTransaction[] = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    type: doc.data().type,
                    frequency: doc.data().frequency,
                    category: doc.data().category,
                    memo: doc.data().memo,
                    date: doc.data().date.toDate(),
                    amount: doc.data().amount,
                    account: doc.data().account,
                    toAccount: doc.data().toAccount,
                    upcomingDate: doc.data().upcomingDate.toDate(),
                    transferid: doc.data().transferid   ,
                    every: doc.data().every,          
                    email: doc.data().email,
                    from: doc.data().from
                    
                    

                }));
                setSchedule(scheduledata);
            });

            // Cleanup subscription on component unmount
            return () => unsubscribe();
        }
    }, [session]);

    return schedule;

}
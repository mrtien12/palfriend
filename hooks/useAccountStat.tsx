import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { db } from "@/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { redirect } from "next/navigation";
import { DepositAccount } from "@/types/account";
export default function useAccountStat(accountid: string) {

    const session = useSession(
        {
            required: true,
            onUnauthenticated() {
                redirect('/signin');
            }
        }
    );
    const [account, setAccount] = useState<DepositAccount>();

    useEffect(() => {
        if (session.data?.user?.email) {
            const docRef = doc(db, 'users', session.data.user.email, 'accounts', accountid);
            const unsubscribe = onSnapshot(docRef, (doc) => {
                if (doc.exists()) {
                    const data = doc.data();
                    setAccount({
                        id: doc.id,
                        email: data.email,
                        name: data.name,
                        type: data.type,
                        amount: data.amount,
                        interestRate: data.interestRate,
                        startDate: data.startDate.toDate(),
                        phase: data.phase,
                        settlementDate: data.settlementDate.toDate(),
                    });
                }
            }
            );
            // Cleanup subscription on component unmount
            return () => unsubscribe();
        }
    }, [session]);

    return account;
}
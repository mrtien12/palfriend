import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { db } from "@/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { redirect } from "next/navigation";
import { DebtAccount } from "@/types/account";
export default function useDebtStat(accountid: string) {

    const session = useSession(
        {
            required: true,
            onUnauthenticated() {
                redirect('/signin');
            }
        }
    );
    const [account, setAccount] = useState<DebtAccount>();

    useEffect(() => {
        if (session.data?.user?.email) {
            const docRef = doc(db, 'users', session.data.user.email, 'accounts', accountid);
            const unsubscribe = onSnapshot(docRef, (doc) => {
                if (doc.exists()) {
                    const data = doc.data();
                    setAccount({
                        id: doc.id,
                        name: data.name,
                        type: data.type,
                        amount: data.amount,
                        interestRate: data.interestRate,
                        startDate: data.startDate.toDate(),
                        paymentDay: data.paymentDay,
                        months: data.months,
                        principal: data.principal,
                        monthly_payment: data.monthly_payment,
                        full: data.full,
                        email: data.email,
                        associated: data.associated
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
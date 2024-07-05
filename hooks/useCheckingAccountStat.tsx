import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { db } from "@/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { redirect } from "next/navigation";
import { CheckingAccount } from "@/types/account";
export default function useCheckingAccountStat(accountid: string) {

    const session = useSession(
        {
            required: true,
            onUnauthenticated() {
                redirect('/signin');
            }
        }
    );
    const [account, setAccount] = useState<CheckingAccount>();

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
                        accountNumber: data.accountNumber,
                        bank : data.bank,
                        email: data.email,
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
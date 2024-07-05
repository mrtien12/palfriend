import { Account } from "@/types/account";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { db } from "@/firebase";
import { doc, collection, query, where ,onSnapshot } from "firebase/firestore";

export default function useAccountType(accountid : string) {
    const session = useSession();
    const [type, setType] = useState<string> ('');
    useEffect(() => {
        if (session.data?.user?.email) {
            const docRef = doc(db, 'users', session.data.user.email, 'accounts', accountid);
            const unsubscribe = onSnapshot(docRef, (doc) => {
                if (doc.exists()) {
                    
                    if (doc.data().type === '0') {
                        setType('0');
                    }
                    else if (doc.data().type === '1') {
                        setType('1');
                    }
                    else if (doc.data().type === '2') {
                        setType('2');
                    }
                    else if (doc.data().type === '3') {
                        setType('3');
                    }
                    
                }
            }
            );
            // Cleanup subscription on component unmount
            return () => unsubscribe();
        }
    }, [session]);
    return type;

}

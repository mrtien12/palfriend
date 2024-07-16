import { useEffect, useState } from 'react';
import { collection, where, query, QueryConstraint,orderBy,onSnapshot, limit, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { useSession } from 'next-auth/react';
import { Interest } from '@/types/interest';

interface QueryParams {
    bank?: string;
    interest1? : string;
    interest3? : string;
    interest6? : string;
    interest9? : string;
    interest12? : string;
    interest18? : string;
    interest24? : string;
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
    limit?: number;
    type?: string
}
interface UseDynamicInterestRate {
    query2: QueryParams;
}
export default function useDynamicInterestRate({ query2 }: UseDynamicInterestRate ) {
    const [options, setOptions] = useState<Interest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const session = useSession()
    useEffect(() =>{
        const fetchOptions = async () =>{
            setLoading(true);
            setError(null);
        }
       
        try {
            if (Object.keys(query2).length === 0) {
                setOptions([]);
                setLoading(false);
                return;
            }
            const conditions: QueryConstraint[] = [];

            if (query2.bank) {
                conditions.push(where('bank','==',query2.bank));
            }

            if (query2.limit) {
                console.log(query2.limit);
                conditions.push(limit(query2.limit));
            }
            
            if (query2.orderBy && query2.orderDirection) {
                console.log(query2.orderBy);
                console.log(query2.orderDirection);
                conditions.push(orderBy(query2.orderBy, query2.orderDirection)); ;
            }

            if (!query2.type) {
                query2.type = "online";
            }

            if (query2.type == "online"){
                const optionsRef = collection(db, 'online');
                const optionsQuery = query(optionsRef, ...conditions);
                console.log(optionsQuery);
                const unscribe = onSnapshot(optionsQuery, (snapshot) => {
                    const data = snapshot.docs.map((doc) => ({
                        
                        ...doc.data(),
                        type: "online"
                    })) as Interest[];
                    setOptions(data);
                    setLoading(false);
                });
            }
            if (query2.type == "offline"){
                const optionsRef = collection(db, 'offline');
                const optionsQuery = query(optionsRef, ...conditions);
                console.log(optionsQuery);

                const unscribe = onSnapshot(optionsQuery, (snapshot) => {
                    const data = snapshot.docs.map((doc) => ({
                        
                        ...doc.data(),
                        type: "offline"
                    })) as Interest[];
                    setOptions(data);
                    setLoading(false);
                });
            }

        }
        catch (error) {
            setLoading(false);
        }

    },[query2,session])

    return options;
}
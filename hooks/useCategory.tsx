import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { db } from "@/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

import { Category } from "@/types/category";

export default function useCategory(type: string) {
    const { data: session } = useSession();
    const [categories, setCategories] = useState<string[]>([]);
    useEffect(() => {
        if (type === "2"){
            setCategories([])
            return;
        }
        if (session?.user?.email) {
            const q = query(
                collection(db, "users", session.user.email, "categories"),
                where("type", "==", type)
            );

            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const categoriesData: string[] = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data() as Category;
                    if (data.sub && data.main !== 'Initial Balance') {
                        categoriesData.push(`${data.main} / ${data.sub}`); // Add main / subcategory
                    } else if (data.main !== 'Initial Balance') {
                        categoriesData.push(data.main); // Add standalone category
                    }
                });
                setCategories(categoriesData);
            });

            return () => unsubscribe();
        }
    }, [session, type]);

    return categories;
}

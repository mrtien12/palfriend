import { useState, useEffect } from 'react';
import { db } from '@/firebase';
import { collection, query, onSnapshot, where, deleteDoc, doc } from 'firebase/firestore';
import { useSession } from 'next-auth/react';

export interface NotificationApp {
    text: string;
    status: 'success' | 'error';
    time: Date;
    type: string;
    email: string;
    id: string; // Add ID to interface for deletion
}

export default function useNotifications() {
    const [notifications, setNotifications] = useState<NotificationApp[]>([]);
    const { data: session } = useSession();

    useEffect(() => {
        if (session?.user?.email) {
            const q = query(
                collection(db, 'users', session.user.email, 'notifications')
            );
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const notificationsData: NotificationApp[] = [];
                querySnapshot.forEach((doc) => {
                    notificationsData.push({ ...doc.data(), id: doc.id } as NotificationApp);
                });
                setNotifications(notificationsData);
            });
            return () => unsubscribe();
        }
    }, [session]);

    const removeNotification = async (id: string) => {
        if (session?.user?.email) {
            await deleteDoc(doc(db, 'users', session.user.email, 'notifications', id));
        }
    };

    return { notifications, removeNotification };
}

import { Modal, Button } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { db } from '@/firebase';
import { Transaction } from '@/types/transaction';
import { doc, getDoc, updateDoc, deleteDoc, increment,query,where,getDocs,collection } from 'firebase/firestore';
import { notifications } from '@mantine/notifications';

interface DeleteTransactionModalProps {
    opened: boolean;
    onClose: () => void;
    accountId: string;
    transaction: Transaction | null;
}

export default function DeleteTransactionModal({ opened, onClose, accountId, transaction }: DeleteTransactionModalProps) {
    const session = useSession({
        required: true,
        onUnauthenticated() {
            redirect('/signin');
        }
    });

    const form = useForm({
        
    });

    const handleDelete = async () => {
        if (!transaction) return;
        const transactionId = transaction.id;
        const user = session.data?.user?.email;

        
        if (transaction.type === "2") {
                
                console.log("hello")
                const accountRef = doc(db, 'users', user as string, 'accounts', accountId);
                const account2Ref = doc(db, 'users', user as string, 'accounts', transaction.toAccount);

                if (transaction.from == true){
                    const fromAccount = accountRef;
                    const toAccount = account2Ref;

                    await updateDoc(fromAccount, { amount: increment(transaction.amount) });
                    await updateDoc(toAccount, { amount: increment(-transaction.amount) });

                    if (transaction.toAccount) {
                        const otherTransactionRef = doc(db, 'users', user as string, 'transactions', transaction.transferid);
                        const TransactionRef = doc(db,'users', user as string, 'transactions', transactionId);
                        await deleteDoc(otherTransactionRef);
                        await deleteDoc(TransactionRef);
                    }
                }

                else if  (transaction.from == false){
                    const fromAccount = account2Ref;
                    const toAccount = accountRef;

                    await updateDoc(fromAccount, { amount: increment(transaction.amount) });
                    await updateDoc(toAccount, { amount: increment(-transaction.amount) });

                    if (transaction.toAccount) {
                        const otherTransactionRef = doc(db, 'users', user as string, 'transactions', transaction.transferid);
                        const TransactionRef = doc(db,'users', user as string, 'transactions', transactionId);
                        await deleteDoc(otherTransactionRef);
                        await deleteDoc(TransactionRef);
                    }
                }
            
            }
        else if (transaction.type === "1"){
            const transactionRef = doc(db, 'users', user as string, 'transactions', transactionId);
            
            const accountRef = doc(db, 'users', user as string, 'accounts', accountId);
            await updateDoc(accountRef, { amount: increment(-transaction.amount) });
            await deleteDoc(transactionRef);
        } 
        else if (transaction.type === "0"){
            const transactionRef = doc(db, 'users', user as string, 'transactions', transactionId);
            const accountRef = doc(db, 'users', user as string, 'accounts', accountId);
            await updateDoc(accountRef, { amount: increment(transaction.amount) });
            await updateBudget(transaction);

            await deleteDoc(transactionRef);
        }

        notifications.show({
            title: 'Transaction Deleted',
            message: 'Giao dịch đã được xóa thành công!',
            color: 'red'
        });

        onClose();
    }

    const updateBudget = async (values: any) => {

        const categoryParts = values.category.split(' / ');
        
        
        if (categoryParts.length === 1){
            const budgetRef = query(
                collection(db, 'users', session.data?.user?.email as string, 'budgets'),
                where('category', '==', values.category),
                where('startDate', '<=', values.date),
                where('endDate', '>=', values.date),
                where('accounts', 'array-contains', accountId),
            );

            const budgetDoc = await getDocs(budgetRef);
            if (budgetDoc.empty) {
                return;
            }

            budgetDoc.forEach(async (doc) => {
                // const budgetData = doc.data();
                await updateDoc(doc.ref, {
                    currentAmount: increment(-values.amount),
                });
            });
        }
        else {
            console.log(values.category + '\uf8ff' + "hello")
            const budgetRef = query(
                collection(db, 'users', session.data?.user?.email as string, 'budgets'),
                where('category', '>=', categoryParts[0]),
                where('category', '<', categoryParts[0] + '\uf8ff'),
                where('startDate', '<=', values.date),
                where('endDate', '>=', values.date),
                where('accounts', 'array-contains', accountId),
            );
            
            const budgetDoc = await getDocs(budgetRef);
            
            if (budgetDoc.empty) {
                return;
            }

            budgetDoc.forEach(async (doc) => {
                // const budgetData = doc.data();
                await updateDoc(doc.ref, {
                    currentAmount: increment(-values.amount),
                });
            });
        }
        

        
    
    }

    return (
        <Modal opened={opened} onClose={onClose} title="Xóa giao dịch">
            <form onSubmit={form.onSubmit(() => handleDelete())}>
                <p>Bạn có muốn xóa giao dịch này không?</p>
                <Button type="submit" color="red">Đồng ý</Button>
            </form>
        </Modal>
    );
}
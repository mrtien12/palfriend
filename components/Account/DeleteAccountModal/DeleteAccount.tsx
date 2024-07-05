import { Button, Modal } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useRouter } from 'next/navigation';
import useTransactionByAccount from '@/hooks/useTransactionByAccount';
import { deleteDoc, doc, getDocs, query, where, collection, QuerySnapshot, DocumentData, updateDoc } from 'firebase/firestore';
import { notifications } from '@mantine/notifications';
import { db } from '@/firebase';

interface DeleteAccountModalProps {
  opened: boolean;
  onClose: () => void;
  accountId: string;
}

export default function DeleteAccountModal({
  opened,
  onClose,
  accountId,
}: DeleteAccountModalProps) {
  const session = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/signin');
    },
  });
  const router = useRouter();

  const form = useForm({});
  const transactions = useTransactionByAccount(accountId);

  const handleDeleteAccount = async () => {
    const conflictingTransaction = transactions.find(transaction => transaction.type === '2');
    
    if (conflictingTransaction) {
      notifications.show({
        title: 'Không thể xóa tài khoản',
        message: 'Tài khoản không thể xóa vì có giao dịch liên quan đến tài khoản khác.',
        color: 'red',
      });
      return;
    }

    for (const transaction of transactions) {
      await deleteDoc(doc(db, 'users', session.data?.user?.email as string, 'transactions', transaction.id));
    }

    await deleteDoc(doc(db, 'users', session.data?.user?.email as string, 'accounts', accountId));

    const scheduledRef = collection(db, 'users', session.data?.user?.email as string, 'scheduled');
    const scheduledQuery = query(scheduledRef, where('account', '==', accountId));
    const scheduledToAccountQuery = query(scheduledRef, where('toAccount', '==', accountId));
    const scheduledSnapshot = await getDocs(scheduledQuery);
    const scheduledToAccountSnapshot = await getDocs(scheduledToAccountQuery);

    const deleteScheduledTransaction = async (snapshot: QuerySnapshot<DocumentData>) => {
      for (const doc of snapshot.docs) {
        await deleteDoc(doc.ref);
      }
    };

    await deleteScheduledTransaction(scheduledSnapshot);
    await deleteScheduledTransaction(scheduledToAccountSnapshot);

    const budgetRef = collection(db, 'users', session.data?.user?.email as string, 'budgets');
    const budgetQuery = query(budgetRef, where( 'accounts','array-contains',accountId));
    const budgetSnapshot = await getDocs(budgetQuery);

    for (const doc1 of budgetSnapshot.docs) {
        const data = doc1.data();
        if (data.accounts.length === 1) {
            await deleteDoc(doc1.ref);
        }
        else {
            


            const transactionsRef = collection(db, 'users', session.data?.user?.email as string, 'transactions');
            let transactionsQuery;
            const categoryParts = data.category.split(' / ');
            if (categoryParts.length === 2) {
              transactionsQuery = query(
                transactionsRef,
                where('account', 'in',  data.accounts.filter((account: string) => account !== accountId),),
                where('date', '>=', data.startDate),
                where('date', '<=', data.endDate),
                where('category', '==', data.category)
              );
            } else {
              transactionsQuery = query(
                transactionsRef,
                where('account', 'in',  data.accounts.filter((account: string) => account !== accountId),),
                where('date', '>=', data.startDate),
                where('date', '<=', data.endDate),
                where('category', '>=', data.category),
                where('category', '<', data.category + '\uf8ff')
              );
            }


            const transactionsSnapshot = await getDocs(transactionsQuery);
            let currentAmount = 0;
            transactionsSnapshot.forEach((doc) => {
              currentAmount += Math.abs(doc.data().amount);
            });

            data.currentAmount = currentAmount;

            const budgetRef = doc(db, 'users', session.data?.user?.email as string, 'budgets', doc1.id);
            await updateDoc(budgetRef, data);

            await updateDoc(doc1.ref, {
              accounts: data.accounts.filter((account: string) => account !== accountId),
            });
              }
          }


    


    notifications.show({
      title: 'Account Deleted',
      message: 'Tài khoản đã được xóa thành công.',
      color: 'green',
    });

    router.push('/dashboard');
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Xóa tài khoản">
      <form onSubmit={form.onSubmit(() => handleDeleteAccount())}>
        <p style={{ color: 'red', fontWeight: 'bold' }}>
          Cảnh báo: Bạn có chắc chắn muốn xóa tài khoản này không? Tài khoản sẽ chỉ có thể xóa khi các giao dịch không liên quan đến các tài khoản khác.
        </p>
        <Button type="submit" color="red">
          Xoá
        </Button>
      </form>
    </Modal>
  );
}

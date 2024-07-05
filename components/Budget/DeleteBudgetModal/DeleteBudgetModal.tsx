import { db } from '@/firebase';
import { Budget } from '@/types/budget';
import { Button, Modal } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { deleteDoc, doc } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

interface DeleteBudgetModalProps {
  budget: Budget | null;
  onClose: () => void;
  opened: boolean;
}

export default function DeleteBudgetModal({
  budget,
  onClose,
  opened,
}: DeleteBudgetModalProps) {
  const session = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/signin');
    },
  });

  const form = useForm({});

  const handleDelete = async () => {
    if (!budget) return;
    const user = session.data?.user?.email;
    const budgetRef = doc(db, 'users', user as string, 'budgets', budget.id);
    await deleteDoc(budgetRef);
    notifications.show({
      title: 'Budget Deleted',
      message: 'Xóa hạn mức thành công',
      color: 'red',
    });
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Xóa hạn mức">
      <form onSubmit={form.onSubmit(handleDelete)}>
        <p>Bạn có muốn xóa hạn mức này?</p>
        <Button type="submit" color="red">
          Xác nhận
        </Button>
      </form>
    </Modal>
  );
}

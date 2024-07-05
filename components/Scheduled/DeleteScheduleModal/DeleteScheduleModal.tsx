import { Modal, Button, Text } from '@mantine/core';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { notifications } from '@mantine/notifications';
import { ScheduleTransaction } from '@/types/transaction';

interface DeleteScheduleTransactionModalProps {
    opened: boolean;
    onClose: () => void;
    transaction: ScheduleTransaction | null;
    onDelete: (id: string) => void;
}

export default function DeleteScheduleTransactionModal({ opened, onClose, transaction, onDelete }: DeleteScheduleTransactionModalProps) {
    const session = useSession({
        required: true,
        onUnauthenticated() {
            redirect('/signin');
        },
    });
    if (!transaction) return null;

    const handleDelete = async () => {
        try {
            await deleteDoc(doc(db, 'users', session.data?.user?.email as string, 'scheduled', transaction.id));
            onDelete(transaction.id);
            notifications.show({
                title: 'Success',
                message: 'Xóa giao dịch dự chi thành công',
                color: 'green',
            });
            onClose();
        } catch (error) {
            notifications.show({
                title: 'Error',
                message: 'Có lỗi xảy ra khi xóa giao dịch dự chi',
                color: 'red',
            });
        }
    }

    return (
        <Modal opened={opened} onClose={onClose} title="Xóa giao dịch dự chi">
            <Text>Bạn có muốn xóa giao dịch này không?</Text>
            <Button color="red" onClick={handleDelete} mt="md">
                Xác nhận
            </Button>
        </Modal>
    );
}

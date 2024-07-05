import { collection, addDoc, where, getDocs, query } from 'firebase/firestore';
import { Modal, TextInput, Select, Button } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { db } from '@/firebase';
import { notifications } from '@mantine/notifications';
import classes from './AddCategoryModal.module.css';

interface AddCategoryModalProps {
    opened: boolean;
    onClose: () => void;
}

export default function AddCategoryModal({
    opened,
    onClose,
}: AddCategoryModalProps) {
    const session = useSession();
    const form = useForm({
        initialValues: {
            main: '',
            sub: '',
        },
    });

    const handleSubmit = async (values: any) => {
        console.log(values);
        const categoryRef = collection(
            db,
            'users',
            session.data?.user?.email as string,
            'categories'
        );

        // Check if the main category exists
        const mainCategoryQuery = query(
            categoryRef,
            where('main', '==', values.main),
            where('sub', '==', '')
        );
        const mainCategorySnapshot = await getDocs(mainCategoryQuery);

        if (values.sub) {
            if (mainCategorySnapshot.empty) {
                // If main category does not exist, add it
                await addDoc(categoryRef, {
                    main: values.main,
                    sub: '',
                    type: values.type,
                });
            }

            // Check if the subcategory already exists under the main category
            const subCategoryQuery = query(
                categoryRef,
                where('main', '==', values.main),
                where('sub', '==', values.sub)
            );
            const subCategorySnapshot = await getDocs(subCategoryQuery);

            if (!subCategorySnapshot.empty) {
                notifications.show({
                    title: 'Category already exists',
                    message:
                        'Danh mục đã tồn tại. Hãy chọn một tên khác.',
                });
                return;
            }

            // Add the subcategory under the main category
            const docRef = await addDoc(categoryRef, {
                main: values.main,
                sub: values.sub,
                type: values.type,
            });
        } else {
            if (!mainCategorySnapshot.empty) {
                notifications.show({
                    title: 'Category already exists',
                    message:
                        'Danh mục đã tồn tại. Hãy chọn một tên khác.',
                });
                return;
            }

            // Add the main category without a subcategory
            const docRef = await addDoc(categoryRef, {
                main: values.main,
                sub: '',
                type: values.type,
            });
            
        }

        notifications.show({
            title: 'Category added successfully',
            message: 'Danh mục đã được thêm thành công',
        });

        handleClose();
    };

    const handleClose = () => {
        form.reset();
        onClose();
    };

    return (
        <Modal.Root opened={opened} onClose={handleClose} size={'sm'}>
            <Modal.Overlay />
            <Modal.Content>
                <Modal.Header>
                    <Modal.Title>
                        <div
                            style={{
                                fontSize: '24px',
                                fontWeight: 700,
                                width: '100%',
                                textAlign: 'center',
                            }}
                        >
                            Thêm danh mục
                        </div>
                    </Modal.Title>
                    <Modal.CloseButton />
                </Modal.Header>
                <Modal.Body>
                    <form
                        onSubmit={form.onSubmit((values) =>
                            handleSubmit(values)
                        )}
                        className={classes.form}
                    >
                        <TextInput
                            label="Danh mục chính"
                            placeholder="Chọn danh mục chính"
                            required
                            {...form.getInputProps('main')}
                        />

                        <TextInput
                            label="Danh mục phụ"
                            placeholder="Chọn danh mục phụ"
                            {...form.getInputProps('sub')}
                        />
                        <Select
                            label="Type"
                            placeholder="Select Type"
                            data={[
                                { value: '0', label: 'Chi tiêu' },
                                { value: '1', label: 'Thu nhập' },
                            ]}
                            {...form.getInputProps('type')}
                        />
                        <Button type="submit" mt="md">
                            Xác nhận
                        </Button>
                    </form>
                </Modal.Body>
            </Modal.Content>
        </Modal.Root>
    );
}

import { useState, useEffect } from 'react';
import { ActionIcon, Badge, Popover, Alert, Text, Stack, ScrollArea } from '@mantine/core';
import { IconBell } from '@tabler/icons-react';
import { NotificationApp } from '@/types/notification';
import useNotifications from '@/hooks/useNotification';
import classes from './NotificationBell.module.css';

const NotificationBell: React.FC = () => {
    const { notifications, removeNotification } = useNotifications();
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [opened, setOpened] = useState<boolean>(false);

    useEffect(() => {
        setUnreadCount(notifications.length);
    }, [notifications]);

    const handleIconClick = () => {
        setOpened((o) => !o);
        if (unreadCount > 0) {
            setUnreadCount(0); // Mark all as read
        }
    };

    const handleRemoveNotification = async (id: string) => {
        await removeNotification(id);
    };

    return (
        <Popover
            opened={opened}
            onClose={() => setOpened(false)}
            position="bottom"
            withArrow
        >
            <Popover.Target>
                <ActionIcon className={classes.bell} size="lg" onClick={handleIconClick}>
                    <IconBell size={24} />
                    {unreadCount > 0 && (
                        <Badge
                            size="xs"
                            variant="filled"
                            color="red"
                            style={{ position: 'absolute', top: 0, right: 0 }}
                        >
                            {unreadCount}
                        </Badge>
                    )}
                </ActionIcon>
            </Popover.Target>
            <Popover.Dropdown>
                <Stack>
                    <ScrollArea>
                        {notifications.length === 0 ? (
                            <Text>Không có thông báo mới</Text>
                        ) : (
                            notifications.map((notification, index) => (
                                <Alert
                                    key={index}
                                    title={getTitle(notification.status)}
                                    color={getColor(notification.status)}
                                    withCloseButton
                                    mt="md"
                                    onClose={() => handleRemoveNotification(notification.id)}
                                >
                                    {notification.text}
                                </Alert>
                            ))
                        )}
                    </ScrollArea>
                </Stack>
            </Popover.Dropdown>
        </Popover>
    );
};

// Helper function to map status to Mantine colors
const getColor = (status: string): string => {
    switch (status) {
        case 'success':
            return 'green';
        case 'error':
            return 'red';
        case 'warning':
            return 'orange'; // Adjust as per your Mantine color scheme
        default:
            return 'gray';
    }
};

// Helper function to set Alert title based on status
const getTitle = (status: string): string => {
    switch (status) {
        case 'success':
            return 'Thành công';
        case 'error':
            return 'Lỗi';
        case 'warning':
            return 'Cảnh báo'; // Adjust based on your requirements
        default:
            return 'Thông báo';
    }
};

export default NotificationBell;

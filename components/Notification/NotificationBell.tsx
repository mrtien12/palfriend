import { useState, useEffect } from 'react';
import { ActionIcon, Badge, Popover, Group, Alert, Text, Stack, ScrollArea } from '@mantine/core';
import { IconBell } from '@tabler/icons-react';
import { NotificationApp } from '@/types/notification';
import useNotifications  from '@/hooks/useNotification';
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
                                    title={notification.status === 'success' ? 'Success' : 'Error'}
                                    color={notification.status === 'success' ? 'green' : 'red'}
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

export default NotificationBell;
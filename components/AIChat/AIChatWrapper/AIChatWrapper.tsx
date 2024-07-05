import { useDisclosure } from '@mantine/hooks';
import {
  Dialog,
  Group,
  Button,
  Text,
  TextInput,
  ScrollArea,
  Box,
  Select,
  ThemeIcon,
} from '@mantine/core';
import { use, useRef } from 'react';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { RiRobot3Line } from 'react-icons/ri';
import { FaRegUser } from 'react-icons/fa';
import useDynamicTransactions from '@/hooks/useDynamicTransaction';
import SupportList from '../SupportList/SupportList';
interface AIChatProps {
  opened: boolean;
  close: () => void;
}

interface Message {
  user: 'user' | 'ai';
  text: string;
}

export default function AIChatWrapper({ opened, close }: AIChatProps) {
  const viewport = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState('');
  const [openedSupport, SupportHandler] = useDisclosure()
  const [type, setType] = useState('/chat');
  const [sessionId, setSessionId] = useState(uuidv4());
  const [messages, setMessages] = useState<Message[]>([]);
  const [queryParams, setQueryParams] = useState({});
  const transactions = useDynamicTransactions({ query1: queryParams });

  useEffect(() => {
    if (type === '/support' && transactions.length > 0) {
      SupportHandler.open();
      // Additional logic to handle transactions data
    }
  }, [transactions, type]);

  const resetTransaction = () => {
    setQueryParams({});
  }
  const scrollToBottom = () =>
    viewport.current!.scrollTo({
      top: viewport.current!.scrollHeight,
      behavior: 'smooth',
    });
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);
  const handleSend = async () => {
    scrollToBottom();
    const userMessage: Message = { user: 'user', text: message };
    const newDataMessage = [...messages, userMessage];
    setMessages(newDataMessage);
    const dataMessage = message;
    setMessage('');
    
    const res = await fetch(`/api/ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: dataMessage,
        sessionId: sessionId,
        type: type,
      }),
    });
    const data = await res.json();
    const aiMessage: Message = { user: 'ai', text: data.response };
    if (data && type !== '/support') {
      const newMessage = [...newDataMessage, aiMessage];
      setMessages(newMessage);
    }
    if (data && type === '/support') {
      const aiMessage: Message = { user: 'ai', text: 'Please wait for a moment, I will provided you with the information that you need' };
      const newMessage = [...newDataMessage, aiMessage];
      setMessages(newMessage);
       const input = JSON.parse(data)
       setQueryParams(input)
    }
    scrollToBottom();
    // const data = await res.json();
    // console.log(data)
  };
  useEffect(() => {
    if (opened) {
      setSessionId(uuidv4());
    }
  }, [opened]);

  const handleClose = () => {
    const res = fetch(`/api/reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: sessionId,
      }),
    });
    
    setMessage('');
    setMessages([]);
    resetTransaction();
    setType('/chat');
    close();
  };

  const handleChangeChat = (type: string) => {
    const res = fetch(`/api/reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: sessionId,
      }),
    });
    setMessage('');
    resetTransaction();
    setMessages([]);
    setType(type);
  };
  return (
    
    <>
      {transactions && type == '/support' && (
        <>
          <SupportList transactions={transactions} opened={openedSupport} onClose={SupportHandler.close} />
        </>
      )}
      <Dialog
        opened={opened}
        withCloseButton
        onClose={handleClose}
        size="lg"
        radius="md"
      >
        <Text mb="xs" fw={700}>
          Chatbox
        </Text>
        <ScrollArea style={{ height: 300 }} type="auto" viewportRef={viewport}>
          {messages &&
            messages?.map((msg, index) => (
              <Box
                key={index}
                style={{
                  marginBottom: '1em',
                  justifyContent: msg.user === 'ai' ? 'flex-start' : 'flex-end',
                  display: 'flex',
                  gap: '5px',
                  alignItems: 'center',
                }}
              >
                {msg.user !== 'ai' && (
                  <ThemeIcon style={{}} size={25} radius={60}>
                    <FaRegUser />
                  </ThemeIcon>
                )}
                {msg.user === 'ai' && (
                  <ThemeIcon style={{}} size={25} radius={60}>
                    <RiRobot3Line />
                  </ThemeIcon>
                )}
                <Text>
                  {msg.user === 'ai' ? 'AI' : 'User'}: {msg.text}
                </Text>
              </Box>
            ))}
        </ScrollArea>
        <Group align="flex-end">
          <Select
            value={type}
            onChange={(value) => {
              handleChangeChat(value as string);
            }}
            style={{ flex: 0.7 }}
            data={[
              { value: '/chat', label: 'chat' },
              { value: '/finance', label: 'finance' },
              { value: '/exchange', label: 'exchange' },
              { value: '/info', label: 'info' },
              { value: '/support', label: 'support'}
            ]}
            defaultValue="/chat"
          />
          <TextInput
            placeholder="Messages"
            value={message}
            onChange={(event) => setMessage(event.currentTarget.value)}
            style={{ flex: 1 }}
          />
          <Button onClick={handleSend}>Gửi</Button>
        </Group>
      </Dialog>
    </>
  );
}

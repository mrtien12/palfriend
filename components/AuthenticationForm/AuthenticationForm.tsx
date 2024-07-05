'use client';
import Logo from '@/public/logo.svg';
import {
  Anchor,
  Button,
  Checkbox,
  Container,
  Group,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import classes from './AuthenticationTitle.module.css';

export function AuthenticationTitle() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  // console.log(currentDate);
  // console.log(year);
  // console.log(month);
  return (
    <Container size={420} my={40}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <ThemeIcon className={classes.icon} size={60}>
          <Logo />
        </ThemeIcon>
        <Title ta="center" className={classes.title}>
          Palfriend
        </Title>
      </div>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Bạn đã có tài khoản chưa?{' '}
        <Anchor
          size="sm"
          component="button"
          onClick={() => router.push('/signup')}
        >
          Tạo tài khoản
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <TextInput
          label="Email"
          placeholder="Email của bạn"
          required
          onChange={(event) => setEmail(event.currentTarget.value)}
        />
        <PasswordInput
          label="Mật khẩu"
          placeholder="Mật khẩu của bạn"
          required
          mt="md"
          onChange={(event) => setPassword(event.currentTarget.value)}
        />
        <Group justify="space-between" mt="lg">
          <Checkbox label="Remember me" />
          <Anchor component="button" size="sm">
            Quên mật khẩu?
          </Anchor>
        </Group>
        <Button
          fullWidth
          mt="xl"
          onClick={async () => {
            await signIn('credentials', {
              email,
              password,
              callbackUrl: `/dashboard`,
            });
          }}
        >
          Đăng nhập
        </Button>
      </Paper>
    </Container>
  );
}

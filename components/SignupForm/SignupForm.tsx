'use client'
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { auth } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import {
    TextInput,
    PasswordInput,
    Checkbox,
    Anchor,
    Paper,
    Title,
    Text,
    Container,
    Group,
    Button,
  } from '@mantine/core';
  import classes from './SignupForm.module.css';
  
  export function SignupForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const signup = () => {
        createUserWithEmailAndPassword(auth, email, password);
      };

    return (
      <Container size={420} my={40}>
        <Title ta="center" className={classes.title}>
          Đăng ký!
        </Title>
        <Text c="dimmed" size="sm" ta="center" mt={5}>
          Đăng ký cho Palfriend?{' '}
          
        </Text>
  
        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <TextInput label="Email" placeholder="you@mantine.dev" required 
          onChange={(event) => setEmail(event.currentTarget.value)}
          />
          <PasswordInput label="Password" placeholder="Your password" required mt="md" 
            onChange={(event) => setPassword(event.currentTarget.value)} />
          <Button fullWidth mt="xl"
            onClick={async () => {
                await signup();
                router.push('/signin')
                
            }}
          >
            Đăng ký
          </Button>
        </Paper>
      </Container>
    );
  }
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  TextInput,
  Button,
  Paper,
  Title,
  Text,
  Stack,
  Group,
  Center,
  Container,
  Alert,
  Image as MantineImage,
} from '@mantine/core';
import { IconMail, IconArrowLeft, IconAlertCircle, IconCheck } from '@tabler/icons-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isValidEmail, setIsValidEmail] = useState(false);
  const router = useRouter();

  const validateEmail = (email: string) => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(email);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setIsValidEmail(validateEmail(value));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValidEmail) {
      setError('Please enter a valid email address');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/forgot-password`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
      } else {
        setError(data.error || 'Failed to send reset email');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Container size="xs" py="xl">
        <Center mih="100dvh">
          <Paper withBorder p="xl" radius="md" bg="dark.6" style={{ width: '100%' }}>
            <Stack gap="md" align="center">
              <Group justify="center" mb="xs">
                <MantineImage src="/imgs/site-logo.png" alt="Seen Group Logo" h={100} w="auto" fit="contain" />
              </Group>
              
              <Alert icon={<IconCheck size={16} />} color="green" variant="light">
                Reset email sent successfully!
              </Alert>
              
              <Text ta="center" size="sm">
                We&apos;ve sent a password reset link to <strong>{email}</strong>. 
                Please check your email and follow the instructions to reset your password.
              </Text>
              
              <Button 
                variant="light" 
                leftSection={<IconArrowLeft size={16} />}
                onClick={() => router.push('/admin')}
              >
                Back to Sign In
              </Button>
            </Stack>
          </Paper>
        </Center>
      </Container>
    );
  }

  return (
    <Container size="xs" py="xl">
      <Center mih="100dvh">
        <Paper withBorder p="xl" radius="md" bg="dark.6" style={{ width: '100%' }}>
          <Stack gap="md">
            <Group justify="center" mb="xs">
              <MantineImage src="/imgs/site-logo.png" alt="Seen Group Logo" h={100} w="auto" fit="contain" />
            </Group>
            <div>
              <Title order={3}>Forgot Password</Title>
              <Text c="dimmed" size="sm">Enter your email to reset your password</Text>
            </div>

            {error && (
              <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light" aria-live="assertive">
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <Stack gap="sm">
                <TextInput
                  id="email"
                  name="email"
                  type="email"
                  label="Email address"
                  placeholder="admin@seengroup.com"
                  value={email}
                  onChange={handleEmailChange}
                  leftSection={<IconMail size={16} />}
                  autoComplete="email"
                  inputMode="email"
                  autoFocus
                  error={email && !isValidEmail ? 'Please enter a valid email address' : undefined}
                  required
                />

                <Group justify="space-between">
                  <Button 
                    variant="light" 
                    leftSection={<IconArrowLeft size={16} />}
                    onClick={() => router.push('/admin')}
                  >
                    Back to Sign In
                  </Button>
                  <Button 
                    type="submit" 
                    loading={isLoading} 
                    disabled={!isValidEmail}
                  >
                    Send Reset Email
                  </Button>
                </Group>
              </Stack>
            </form>

            <Text c="dimmed" ta="center" size="xs">Â© 2025 Seen Group. All rights reserved.</Text>
          </Stack>
        </Paper>
      </Center>
    </Container>
  );
}


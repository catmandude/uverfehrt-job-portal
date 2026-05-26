import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Container,
  Stack,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import ufsLogo from '../assets/ufs-logo.png';
// import { notifications } from '@mantine/notifications';
// import { useMutation } from '@tanstack/react-query';

interface LoginFormValues {
  email: string;
  password: string;
}

export const Login: React.FC = () => {
  // const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const form = useForm<LoginFormValues>({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => (!value ? 'Email is required' : null),
      password: (value) => (!value ? 'Password is required' : null),
    },
  });
  const formValues = form.getValues();

  return (
    <Container
      fluid
      px="md"
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Stack w="100%" maw={400} align="center" gap="xl">
        <img
          src={ufsLogo}
          alt="Unverfehrt Farm Supply"
          style={{ maxWidth: 280, width: '100%', height: 'auto', objectFit: 'contain' }}
        />

        <Paper withBorder shadow="md" p="lg" radius="md" w="100%">
          <form onSubmit={form.onSubmit(() => login(formValues.email, formValues.password))}>
            <Stack gap="md">
              <TextInput
                label="Email"
                placeholder="Your email"
                required
                {...form.getInputProps('email')}
              />

              <PasswordInput
                label="Password"
                placeholder="Your password"
                required
                {...form.getInputProps('password')}
              />

              <Button type="submit" fullWidth>
                Sign in
              </Button>
            </Stack>
          </form>
        </Paper>
      </Stack>
    </Container>
  );
};

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Container,
  Stack,
} from '@mantine/core';
import { useForm } from '@mantine/form';
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
      <Stack w="100%" maw={400}>
        <Title ta="center" style={{ fontWeight: 900 }}>
          Unverfehrt Farm Supply
        </Title>

        <Paper withBorder shadow="md" p="lg" radius="md">
          <form onSubmit={form.onSubmit(() => login(formValues.email, formValues.password))}>
            <Stack>
              <TextInput
                label="Email"
                placeholder="Your email"
                required
                // disabled={isLoading}
                {...form.getInputProps('email')}
              />

              <PasswordInput
                label="Password"
                placeholder="Your password"
                required
                // disabled={isLoading}
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

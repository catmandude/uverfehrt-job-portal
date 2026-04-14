import React, { useState } from 'react';
import {
  Container,
  Title,
  Paper,
  TextInput,
  Table,
  Group,
  Stack,
  ActionIcon,
  Text,
  Badge,
  Switch,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconEdit, IconCheck, IconX } from '@tabler/icons-react';
import { useAllUsers, useUpdateUser } from '../../services/queries';
import type { User } from '../../types';

export const EditUsers: React.FC = () => {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');

  const { allUsers: users, allUsersLoading: usersLoading } = useAllUsers();
  const updateUser = useUpdateUser();

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setEditName(user.name || '');
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditName('');
  };

  const handleSave = () => {
    if (!editingUser) return;
    if (!editName.trim()) {
      notifications.show({
        title: 'Error',
        message: 'Name cannot be empty',
        color: 'red',
      });
      return;
    }

    const userName = editName.trim();
    updateUser.mutate(
      { id: editingUser.id, name: userName },
      {
        onSuccess: () => {
          notifications.show({
            title: 'Success',
            message: `User updated to ${userName}`,
            color: 'green',
          });
          setEditingUser(null);
          setEditName('');
        },
        onError: () => {
          notifications.show({
            title: 'Error',
            message: 'Failed to update user',
            color: 'red',
          });
        },
      }
    );
  };

  const handleToggleActive = (user: User) => {
    const newActive = !user.isActive;
    updateUser.mutate(
      { id: user.id, isActive: newActive },
      {
        onSuccess: () => {
          notifications.show({
            title: 'Success',
            message: `${user.name || user.email} ${newActive ? 'activated' : 'deactivated'}`,
            color: 'green',
          });
        },
        onError: () => {
          notifications.show({
            title: 'Error',
            message: `Failed to ${newActive ? 'activate' : 'deactivate'} user`,
            color: 'red',
          });
        },
      }
    );
  };

  const rows = [...(users || [])]
    .sort((a, b) => {
      if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
      return (a.name || '').localeCompare(b.name || '');
    })
    .map((user) => (
      <Table.Tr key={user.id} style={{ opacity: user.isActive ? 1 : 0.5 }}>
        <Table.Td>
          {editingUser?.id === user.id ? (
            <TextInput
              value={editName}
              onChange={(e) => setEditName(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') handleCancelEdit();
              }}
              size="sm"
              autoFocus
            />
          ) : (
            user.name || '-'
          )}
        </Table.Td>
        <Table.Td>{user.email}</Table.Td>
        <Table.Td>{user.role || '-'}</Table.Td>
        <Table.Td>
          <Group gap="xs">
            <Switch
              checked={user.isActive}
              onChange={() => handleToggleActive(user)}
              size="sm"
            />
            <Badge color={user.isActive ? 'green' : 'gray'} variant="light" size="sm">
              {user.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </Group>
        </Table.Td>
        <Table.Td>
          {editingUser?.id === user.id ? (
            <Group gap="xs">
              <ActionIcon
                color="green"
                variant="subtle"
                onClick={handleSave}
                loading={updateUser.isPending}
              >
                <IconCheck size={18} />
              </ActionIcon>
              <ActionIcon
                color="gray"
                variant="subtle"
                onClick={handleCancelEdit}
              >
                <IconX size={18} />
              </ActionIcon>
            </Group>
          ) : (
            <ActionIcon
              color="blue"
              variant="subtle"
              onClick={() => handleEditClick(user)}
            >
              <IconEdit size={18} />
            </ActionIcon>
          )}
        </Table.Td>
      </Table.Tr>
    ));

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Title order={1}>Manage Users</Title>

        <Paper shadow="sm" p="md" withBorder>
          <Title order={3} mb="md">
            Users ({users?.length || 0})
          </Title>
          {usersLoading ? (
            <Text c="dimmed">Loading users...</Text>
          ) : !users || users.length === 0 ? (
            <Text c="dimmed">No users found.</Text>
          ) : (
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Email</Table.Th>
                  <Table.Th>Role</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          )}
        </Paper>
      </Stack>
    </Container>
  );
};

import React, { useState } from 'react';
import {
  Container,
  Title,
  Paper,
  TextInput,
  Button,
  Table,
  Group,
  Stack,
  ActionIcon,
  Modal,
  Text,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconTrash, IconPlus } from '@tabler/icons-react';
import { useSubcontractors, useCreateSubcontractor, useDeleteSubcontractor } from '../../services/queries';
import type { SubcontractorType } from '../../types';

interface SubcontractorFormValues {
  name: string;
}

export const EditSubcontractors: React.FC = () => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [subcontractorToDelete, setSubcontractorToDelete] = useState<SubcontractorType | null>(null);

  // React Query hooks
  const { subcontractors, subcontractorsLoading } = useSubcontractors();
  const createSubcontractor = useCreateSubcontractor();
  const deleteSubcontractor = useDeleteSubcontractor();

  const form = useForm<SubcontractorFormValues>({
    initialValues: {
      name: '',
    },
    validate: {
      name: (value) => (!value.trim() ? 'Subcontractor name is required' : null),
    },
  });

  const handleAddSubcontractor = async (values: SubcontractorFormValues) => {
    createSubcontractor.mutate(values, {
      onSuccess: () => {
        notifications.show({
          title: 'Success',
          message: `Subcontractor ${values.name} added successfully`,
          color: 'green',
        });
        form.reset();
      },
      onError: () => {
        notifications.show({
          title: 'Error',
          message: 'Failed to add subcontractor',
          color: 'red',
        });
      },
    });
  };

  const handleDeleteClick = (subcontractor: SubcontractorType) => {
    setSubcontractorToDelete(subcontractor);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!subcontractorToDelete) return;

    const subcontractorName = subcontractorToDelete.name;
    deleteSubcontractor.mutate(subcontractorToDelete.id, {
      onSuccess: () => {
        notifications.show({
          title: 'Success',
          message: `Subcontractor ${subcontractorName} deleted successfully`,
          color: 'green',
        });
        setDeleteModalOpen(false);
        setSubcontractorToDelete(null);
      },
      onError: () => {
        notifications.show({
          title: 'Error',
          message: 'Failed to delete subcontractor',
          color: 'red',
        });
      },
    });
  };

  const rows = subcontractors?.map((subcontractor) => (
    <Table.Tr key={subcontractor.id}>
      <Table.Td>{subcontractor.name}</Table.Td>
      <Table.Td>{subcontractor.legacyId || '-'}</Table.Td>
      <Table.Td>
        <ActionIcon
          color="red"
          variant="subtle"
          onClick={() => handleDeleteClick(subcontractor)}
        >
          <IconTrash size={18} />
        </ActionIcon>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Title order={1}>Manage Subcontractors</Title>

        {/* Add Subcontractor Form */}
        <Paper shadow="sm" p="md" withBorder>
          <Title order={3} mb="md">
            Add New Subcontractor
          </Title>
          <form onSubmit={form.onSubmit(handleAddSubcontractor)}>
            <Group grow align="flex-start">
              <TextInput
                label="Subcontractor Name"
                placeholder="Enter subcontractor name"
                required
                disabled={createSubcontractor.isPending}
                {...form.getInputProps('name')}
              />
              <Button
                type="submit"
                loading={createSubcontractor.isPending}
                leftSection={<IconPlus size={18} />}
                style={{ marginTop: 'auto' }}
              >
                Add Subcontractor
              </Button>
            </Group>
          </form>
        </Paper>

        {/* Subcontractors List */}
        <Paper shadow="sm" p="md" withBorder>
          <Title order={3} mb="md">
            Current Subcontractors ({subcontractors?.length || 0})
          </Title>
          {subcontractorsLoading ? (
            <Text c="dimmed">Loading subcontractors...</Text>
          ) : !subcontractors || subcontractors.length === 0 ? (
            <Text c="dimmed">No subcontractors found. Add your first subcontractor above.</Text>
          ) : (
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Legacy ID</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          )}
        </Paper>
      </Stack>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Delete"
        centered
      >
        <Stack>
          <Text>
            Are you sure you want to delete subcontractor{' '}
            <strong>{subcontractorToDelete?.name}</strong>? This action cannot be undone.
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button color="red" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
};
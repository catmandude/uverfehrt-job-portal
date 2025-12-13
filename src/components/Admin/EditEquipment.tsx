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
import { useEquipment, useCreateEquipment, useDeleteEquipment } from '../../services/queries';
import type { EquipmentType } from '../../types';

interface EquipmentFormValues {
  name: string;
}

export const EditEquipment: React.FC = () => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState<EquipmentType | null>(null);

  // React Query hooks
  const { equipment, equipmentLoading } = useEquipment();
  const createEquipment = useCreateEquipment();
  const deleteEquipment = useDeleteEquipment();

  const form = useForm<EquipmentFormValues>({
    initialValues: {
      name: '',
    },
    validate: {
      name: (value) => (!value.trim() ? 'Equipment name is required' : null),
    },
  });

  const handleAddEquipment = async (values: EquipmentFormValues) => {
    createEquipment.mutate(values, {
      onSuccess: () => {
        notifications.show({
          title: 'Success',
          message: `Equipment ${values.name} added successfully`,
          color: 'green',
        });
        form.reset();
      },
      onError: () => {
        notifications.show({
          title: 'Error',
          message: 'Failed to add equipment',
          color: 'red',
        });
      },
    });
  };

  const handleDeleteClick = (equipmentItem: EquipmentType) => {
    setEquipmentToDelete(equipmentItem);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!equipmentToDelete) return;

    const equipmentName = equipmentToDelete.name;
    deleteEquipment.mutate(equipmentToDelete.id, {
      onSuccess: () => {
        notifications.show({
          title: 'Success',
          message: `Equipment ${equipmentName} deleted successfully`,
          color: 'green',
        });
        setDeleteModalOpen(false);
        setEquipmentToDelete(null);
      },
      onError: () => {
        notifications.show({
          title: 'Error',
          message: 'Failed to delete equipment',
          color: 'red',
        });
      },
    });
  };

  const rows = equipment?.map((equipmentItem) => (
    <Table.Tr key={equipmentItem.id}>
      <Table.Td>{equipmentItem.name}</Table.Td>
      <Table.Td>{equipmentItem.legacyId || '-'}</Table.Td>
      <Table.Td>
        <ActionIcon
          color="red"
          variant="subtle"
          onClick={() => handleDeleteClick(equipmentItem)}
        >
          <IconTrash size={18} />
        </ActionIcon>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Title order={1}>Manage Equipment</Title>

        {/* Add Equipment Form */}
        <Paper shadow="sm" p="md" withBorder>
          <Title order={3} mb="md">
            Add New Equipment
          </Title>
          <form onSubmit={form.onSubmit(handleAddEquipment)}>
            <Group grow align="flex-start">
              <TextInput
                label="Equipment Name"
                placeholder="Enter equipment name"
                required
                disabled={createEquipment.isPending}
                {...form.getInputProps('name')}
              />
              <Button
                type="submit"
                loading={createEquipment.isPending}
                leftSection={<IconPlus size={18} />}
                style={{ marginTop: 'auto' }}
              >
                Add Equipment
              </Button>
            </Group>
          </form>
        </Paper>

        {/* Equipment List */}
        <Paper shadow="sm" p="md" withBorder>
          <Title order={3} mb="md">
            Current Equipment ({equipment?.length || 0})
          </Title>
          {equipmentLoading ? (
            <Text c="dimmed">Loading equipment...</Text>
          ) : !equipment || equipment.length === 0 ? (
            <Text c="dimmed">No equipment found. Add your first equipment above.</Text>
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
            Are you sure you want to delete equipment{' '}
            <strong>{equipmentToDelete?.name}</strong>? This action cannot be undone.
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
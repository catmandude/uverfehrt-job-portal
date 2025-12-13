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
import { useVehicles, useCreateVehicle, useDeleteVehicle } from '../../services/queries';
import type { VehicleType } from '../../types';

interface VehicleFormValues {
  name: string;
}

export const EditVehicles: React.FC = () => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<VehicleType | null>(null);

  // React Query hooks
  const { vehicles, vehiclesLoading } = useVehicles();
  const createVehicle = useCreateVehicle();
  const deleteVehicle = useDeleteVehicle();

  const form = useForm<VehicleFormValues>({
    initialValues: {
      name: '',
    },
    validate: {
      name: (value) => (!value.trim() ? 'Vehicle name is required' : null),
    },
  });

  const handleAddVehicle = async (values: VehicleFormValues) => {
    createVehicle.mutate(values, {
      onSuccess: () => {
        notifications.show({
          title: 'Success',
          message: `Vehicle ${values.name} added successfully`,
          color: 'green',
        });
        form.reset();
      },
      onError: () => {
        notifications.show({
          title: 'Error',
          message: 'Failed to add vehicle',
          color: 'red',
        });
      },
    });
  };

  const handleDeleteClick = (vehicle: VehicleType) => {
    setVehicleToDelete(vehicle);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!vehicleToDelete) return;

    const vehicleName = vehicleToDelete.name;
    deleteVehicle.mutate(vehicleToDelete.id, {
      onSuccess: () => {
        notifications.show({
          title: 'Success',
          message: `Vehicle ${vehicleName} deleted successfully`,
          color: 'green',
        });
        setDeleteModalOpen(false);
        setVehicleToDelete(null);
      },
      onError: () => {
        notifications.show({
          title: 'Error',
          message: 'Failed to delete vehicle',
          color: 'red',
        });
      },
    });
  };

  const rows = vehicles?.map((vehicle) => (
    <Table.Tr key={vehicle.id}>
      <Table.Td>{vehicle.name}</Table.Td>
      <Table.Td>{vehicle.legacyId || '-'}</Table.Td>
      <Table.Td>
        <ActionIcon
          color="red"
          variant="subtle"
          onClick={() => handleDeleteClick(vehicle)}
        >
          <IconTrash size={18} />
        </ActionIcon>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Title order={1}>Manage Vehicles</Title>

        {/* Add Vehicle Form */}
        <Paper shadow="sm" p="md" withBorder>
          <Title order={3} mb="md">
            Add New Vehicle
          </Title>
          <form onSubmit={form.onSubmit(handleAddVehicle)}>
            <Group grow align="flex-start">
              <TextInput
                label="Vehicle Name"
                placeholder="Enter vehicle name"
                required
                disabled={createVehicle.isPending}
                {...form.getInputProps('name')}
              />
              <Button
                type="submit"
                loading={createVehicle.isPending}
                leftSection={<IconPlus size={18} />}
                style={{ marginTop: 'auto' }}
              >
                Add Vehicle
              </Button>
            </Group>
          </form>
        </Paper>

        {/* Vehicles List */}
        <Paper shadow="sm" p="md" withBorder>
          <Title order={3} mb="md">
            Current Vehicles ({vehicles?.length || 0})
          </Title>
          {vehiclesLoading ? (
            <Text c="dimmed">Loading vehicles...</Text>
          ) : !vehicles || vehicles.length === 0 ? (
            <Text c="dimmed">No vehicles found. Add your first vehicle above.</Text>
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
            Are you sure you want to delete vehicle{' '}
            <strong>{vehicleToDelete?.name}</strong>? This action cannot be undone.
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
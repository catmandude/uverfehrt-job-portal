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
import { useEmployees, useCreateEmployee, useDeleteEmployee } from '../../services/queries';
import type { EmployeeType } from '../../types';

interface EmployeeFormValues {
  firstName: string;
  lastName: string;
}

export const EditEmployees: React.FC = () => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<EmployeeType | null>(null);

  // React Query hooks
  const { employees, employeesLoading } = useEmployees();
  const createEmployee = useCreateEmployee();
  const deleteEmployee = useDeleteEmployee();

  const form = useForm<EmployeeFormValues>({
    initialValues: {
      firstName: '',
      lastName: '',
    },
    validate: {
      firstName: (value) => (!value.trim() ? 'First name is required' : null),
      lastName: (value) => (!value.trim() ? 'Last name is required' : null),
    },
  });

  const handleAddEmployee = async (values: EmployeeFormValues) => {
    createEmployee.mutate(values, {
      onSuccess: () => {
        notifications.show({
          title: 'Success',
          message: `Employee ${values.firstName} ${values.lastName} added successfully`,
          color: 'green',
        });
        form.reset();
      },
      onError: () => {
        notifications.show({
          title: 'Error',
          message: 'Failed to add employee',
          color: 'red',
        });
      },
    });
  };

  const handleDeleteClick = (employee: EmployeeType) => {
    setEmployeeToDelete(employee);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!employeeToDelete) return;

    const employeeName = `${employeeToDelete.firstName} ${employeeToDelete.lastName}`;
    deleteEmployee.mutate(employeeToDelete.id, {
      onSuccess: () => {
        notifications.show({
          title: 'Success',
          message: `Employee ${employeeName} deleted successfully`,
          color: 'green',
        });
        setDeleteModalOpen(false);
        setEmployeeToDelete(null);
      },
      onError: () => {
        notifications.show({
          title: 'Error',
          message: 'Failed to delete employee',
          color: 'red',
        });
      },
    });
  };

  const rows = employees?.map((employee) => (
    <Table.Tr key={employee.id}>
      <Table.Td>{employee.firstName}</Table.Td>
      <Table.Td>{employee.lastName}</Table.Td>
      <Table.Td>{employee.legacyId || '-'}</Table.Td>
      <Table.Td>
        <ActionIcon
          color="red"
          variant="subtle"
          onClick={() => handleDeleteClick(employee)}
        >
          <IconTrash size={18} />
        </ActionIcon>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Title order={1}>Manage Employees</Title>

        {/* Add Employee Form */}
        <Paper shadow="sm" p="md" withBorder>
          <Title order={3} mb="md">
            Add New Employee
          </Title>
          <form onSubmit={form.onSubmit(handleAddEmployee)}>
            <Group grow align="flex-start">
              <TextInput
                label="First Name"
                placeholder="Enter first name"
                required
                disabled={createEmployee.isPending}
                {...form.getInputProps('firstName')}
              />
              <TextInput
                label="Last Name"
                placeholder="Enter last name"
                required
                disabled={createEmployee.isPending}
                {...form.getInputProps('lastName')}
              />
              <Button
                type="submit"
                loading={createEmployee.isPending}
                leftSection={<IconPlus size={18} />}
                style={{ marginTop: 'auto' }}
              >
                Add Employee
              </Button>
            </Group>
          </form>
        </Paper>

        {/* Employees List */}
        <Paper shadow="sm" p="md" withBorder>
          <Title order={3} mb="md">
            Current Employees ({employees?.length || 0})
          </Title>
          {employeesLoading ? (
            <Text c="dimmed">Loading employees...</Text>
          ) : !employees || employees.length === 0 ? (
            <Text c="dimmed">No employees found. Add your first employee above.</Text>
          ) : (
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>First Name</Table.Th>
                  <Table.Th>Last Name</Table.Th>
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
            Are you sure you want to delete employee{' '}
            <strong>
              {employeeToDelete?.firstName} {employeeToDelete?.lastName}
            </strong>
            ? This action cannot be undone.
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

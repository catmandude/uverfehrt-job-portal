import { Modal, Textarea, Button, Group, Stack, MultiSelect } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { TimePicker } from '@mantine/dates';
import type { EmployeeJobType } from '../../../types';
import { useEmployees } from '../../../services/queries';

interface AddEmployeesModalProps {
  opened: boolean;
  onClose: () => void;
  jobId: number;
  onSubmit: (employees: Omit<EmployeeJobType, 'id'>[]) => void;
}

interface FormType {
  employees: number[];
  startTime: string;
  endTime: string;
  description: string;
}

export function AddEmployeesModal({ opened, onClose, jobId, onSubmit }: AddEmployeesModalProps) {
  const [groupId] = useState(() => `group-${Date.now()}`);
  const { employees } = useEmployees();
  const displayEmployees = employees?.map((employee) => ({
    value: String(employee.id),
    label: `${employee.firstName} ${employee.lastName}`,
    ...employee,
  }));

  const form = useForm<FormType>({
    initialValues: {
      employees: [],
      startTime: '',
      endTime: '',
      description: '',
    },
    validate: {
      employees: (value) => (value.length === 0 ? 'At least one employee is required' : null),
      startTime: (value) => (!value ? 'Start time is required' : null),
      endTime: (value) => (!value ? 'End time is required' : null),
    },
  });
  const formValues = form.getValues();

  const handleCancel = () => {
    form.reset();
    onClose();
  };

  const handleSubmit = (values: typeof form.values) => {
    const newEmployees = values.employees.map((employeeId) => ({
      groupId,
      jobId,
      employeeId: Number(employeeId),
      startTime: values.startTime,
      endTime: values.endTime,
      description: values.description,
    }));

    onSubmit(newEmployees);
    handleCancel();
  };

  return (
    <Modal opened={opened} onClose={handleCancel} title="Add Employee to Job" size="md">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <MultiSelect
            onChange={(event) => form.setFieldValue('employees', event.map(Number))}
            label="User"
            value={formValues.employees.map(String)}
            data={displayEmployees}
            maw="30rem"
          />
          <TimePicker value={formValues.startTime} onChange={(value) => form.setFieldValue('startTime', value)} format="12h" />
          <TimePicker value={formValues.endTime} onChange={(value) => form.setFieldValue('endTime', value)} format="12h" />
          <Textarea
            label="Description"
            placeholder="Enter job description"
            minRows={3}
            {...form.getInputProps('description')}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add Employee</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

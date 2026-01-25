import { Modal, Textarea, Button, Group, Stack, MultiSelect, ActionIcon } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState, useRef } from 'react';
import { TimeInput } from '@mantine/dates';
import { IconClock } from '@tabler/icons-react';
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
  const startTimeRef = useRef<HTMLInputElement>(null);
  const endTimeRef = useRef<HTMLInputElement>(null);
  const displayEmployees = employees?.map((employee) => ({
    value: String(employee.id),
    label: `${employee.lastName}, ${employee.firstName}`,
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
      startTime: (value, values) => {
        if (!value) return 'Start time is required';
        if (values.endTime && value >= values.endTime) {
          return 'Start time must be before end time';
        }
        return null;
      },
      endTime: (value, values) => {
        if (!value) return 'End time is required';
        if (values.startTime && value <= values.startTime) {
          return 'End time must be after start time';
        }
        return null;
      },
      description: (value) => (!value.trim() ? 'Description is required' : null),
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
    <Modal opened={opened} onClose={handleCancel} title="Add Employee to Job" size="md" centered>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <MultiSelect
            onChange={(event) => form.setFieldValue('employees', event.map(Number))}
            label="User"
            value={formValues.employees.map(String)}
            data={displayEmployees}
            maw="30rem"
            required
            error={form.errors.employees}
          />
          <TimeInput
            label="Start Time"
            ref={startTimeRef}
            value={formValues.startTime}
            onChange={(event) => form.setFieldValue('startTime', event.currentTarget.value)}
            required
            error={form.errors.startTime}
            rightSection={
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={() => startTimeRef.current?.showPicker()}
              >
                <IconClock size={16} stroke={1.5} />
              </ActionIcon>
            }
          />
          <TimeInput
            label="End Time"
            ref={endTimeRef}
            value={formValues.endTime}
            onChange={(event) => form.setFieldValue('endTime', event.currentTarget.value)}
            required
            error={form.errors.endTime}
            rightSection={
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={() => endTimeRef.current?.showPicker()}
              >
                <IconClock size={16} stroke={1.5} />
              </ActionIcon>
            }
          />
          <Textarea
            label="Description"
            placeholder="Enter job description"
            minRows={3}
            required
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

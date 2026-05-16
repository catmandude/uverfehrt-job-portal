import { Modal, Textarea, Button, Group, Stack, MultiSelect, ActionIcon, Radio } from '@mantine/core';
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
  torchUse: 'yes' | 'no' | null;
  welderUse: 'yes' | 'no' | null;
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
      torchUse: null,
      welderUse: null,
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
      torchUse: (value) => (value === null ? 'Please select Yes or No' : null),
      welderUse: (value) => (value === null ? 'Please select Yes or No' : null),
    },
  });
  const formValues = form.values;

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
      torchUse: values.torchUse === 'yes',
      welderUse: values.welderUse === 'yes',
    }));

    onSubmit(newEmployees);
    handleCancel();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleCancel}
      title="Add Employee to Job"
      size="lg"
      centered
      styles={{ body: { minHeight: '60vh', display: 'flex', flexDirection: 'column' } }}
    >
      <form
        onSubmit={form.onSubmit(handleSubmit)}
        style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
      >
        <Stack gap="md" style={{ flex: 1 }}>
          <MultiSelect
            onChange={(event) => form.setFieldValue('employees', event.map(Number))}
            label="User"
            value={formValues.employees.map(String)}
            data={displayEmployees}
            comboboxProps={{ withinPortal: false }}
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
          <Radio.Group
            label="Torch Use"
            value={formValues.torchUse ?? ''}
            onChange={(value) => form.setFieldValue('torchUse', value as 'yes' | 'no')}
            error={form.errors.torchUse}
            required
          >
            <Group mt="xs">
              <Radio value="yes" label="Yes" />
              <Radio value="no" label="No" />
            </Group>
          </Radio.Group>
          <Radio.Group
            label="Welder Use"
            value={formValues.welderUse ?? ''}
            onChange={(value) => form.setFieldValue('welderUse', value as 'yes' | 'no')}
            error={form.errors.welderUse}
            required
          >
            <Group mt="xs">
              <Radio value="yes" label="Yes" />
              <Radio value="no" label="No" />
            </Group>
          </Radio.Group>
          <Textarea
            label="Description"
            placeholder="Enter job description"
            minRows={3}
            required
            {...form.getInputProps('description')}
          />
        </Stack>
        <Group grow mt="xl">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Add Employee</Button>
        </Group>
      </form>
    </Modal>
  );
}

import {
  Card,
  Text,
  Group,
  Stack,
  Badge,
  ThemeIcon,
  ActionIcon,
  Button,
  Radio,
  Textarea,
} from '@mantine/core';
import { TimeInput } from '@mantine/dates';
import { IconClock, IconX, IconPencil, IconCheck, IconAlertTriangle } from '@tabler/icons-react';
import { useState, useRef } from 'react';
import type { EmployeeJobType } from '../../../types';
import { useEmployees } from '../../../services/queries';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

interface JobEmployeesProps {
  jobEmployees: EmployeeJobType[];
  setFieldValue: (field: string, value: unknown) => void;
}

interface EmployeeCardProps {
  employee: EmployeeJobType;
  index: number;
  jobEmployees: EmployeeJobType[];
  setFieldValue: (field: string, value: unknown) => void;
}

const EmployeeCard = ({ employee, index, jobEmployees, setFieldValue }: EmployeeCardProps) => {
  const { employees } = useEmployees();
  const emp = employees?.find((e) => e.id === employee.employeeId);
  const start = dayjs(employee.startTime, 'HH:mm');
  const end = dayjs(employee.endTime, 'HH:mm');
  const diffHours =
    employee.startTime && employee.endTime ? end.diff(start, 'hour', true).toFixed(2) : null;

  const [isEditing, setIsEditing] = useState(false);
  const [draftStart, setDraftStart] = useState(employee.startTime);
  const [draftEnd, setDraftEnd] = useState(employee.endTime);
  const [draftDescription, setDraftDescription] = useState(employee.description ?? '');
  const [draftTorch, setDraftTorch] = useState<'yes' | 'no' | null>(
    employee.torchUse == null ? null : employee.torchUse ? 'yes' : 'no'
  );
  const [draftWelder, setDraftWelder] = useState<'yes' | 'no' | null>(
    employee.welderUse == null ? null : employee.welderUse ? 'yes' : 'no'
  );
  const [error, setError] = useState<string | null>(null);
  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);

  const deleteEmployee = () => {
    const updatedEmployees = jobEmployees.filter((_, i) => i !== index);
    setFieldValue('employees', updatedEmployees);
  };

  const startEdit = () => {
    setDraftStart(employee.startTime);
    setDraftEnd(employee.endTime);
    setDraftDescription(employee.description ?? '');
    setDraftTorch(employee.torchUse == null ? null : employee.torchUse ? 'yes' : 'no');
    setDraftWelder(employee.welderUse == null ? null : employee.welderUse ? 'yes' : 'no');
    setError(null);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setError(null);
  };

  const saveEdit = () => {
    if (!draftStart) {
      setError('Start time is required');
      return;
    }
    if (draftEnd && draftStart >= draftEnd) {
      setError('Start time must be before end time');
      return;
    }
    const updated = jobEmployees.map((e, i) =>
      i === index
        ? {
            ...e,
            startTime: draftStart,
            endTime: draftEnd,
            description: draftDescription.trim(),
            torchUse: draftTorch === null ? null : draftTorch === 'yes',
            welderUse: draftWelder === null ? null : draftWelder === 'yes',
          }
        : e
    );
    setFieldValue('employees', updated);
    setIsEditing(false);
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder w="100%">
      <Stack gap="sm">
        <Group justify="space-between">
          <Group>
            <Text fw={500} size="lg">
              {emp?.firstName} {emp?.lastName}
            </Text>
            {!isEditing && (
              <Badge
                color={employee.endTime ? 'green' : 'yellow'}
                style={{ cursor: 'pointer' }}
                onClick={startEdit}
              >
                {employee.startTime} - {employee.endTime || '???'}
              </Badge>
            )}
          </Group>
          <Group gap="xs">
            {!isEditing && (
              <ActionIcon variant="subtle" color="blue" onClick={startEdit}>
                <IconPencil size={18} />
              </ActionIcon>
            )}
            <ThemeIcon
              variant="white"
              radius="xl"
              color="red"
              onClick={deleteEmployee}
              style={{ cursor: 'pointer' }}
            >
              <IconX size={20} />
            </ThemeIcon>
          </Group>
        </Group>

        {isEditing ? (
          <Stack gap="sm">
            <Group grow>
              <TimeInput
                label="Start Time"
                ref={startRef}
                value={draftStart}
                onChange={(event) => setDraftStart(event.currentTarget.value)}
                rightSection={
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    onClick={() => startRef.current?.showPicker()}
                  >
                    <IconClock size={16} stroke={1.5} />
                  </ActionIcon>
                }
              />
              <TimeInput
                label="End Time"
                ref={endRef}
                value={draftEnd ?? ''}
                onChange={(event) => setDraftEnd(event.currentTarget.value)}
                rightSection={
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    onClick={() => endRef.current?.showPicker()}
                  >
                    <IconClock size={16} stroke={1.5} />
                  </ActionIcon>
                }
              />
            </Group>
            <Radio.Group
              label="Torch Use"
              value={draftTorch ?? ''}
              onChange={(value) => setDraftTorch(value as 'yes' | 'no')}
              required
            >
              <Group mt="xs">
                <Radio value="yes" label="Yes" />
                <Radio value="no" label="No" />
              </Group>
            </Radio.Group>
            <Radio.Group
              label="Welder Use"
              value={draftWelder ?? ''}
              onChange={(value) => setDraftWelder(value as 'yes' | 'no')}
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
              value={draftDescription}
              onChange={(event) => setDraftDescription(event.currentTarget.value)}
              required
            />
            {error && (
              <Text size="xs" c="red">
                {error}
              </Text>
            )}
            <Group>
              <Button size="xs" leftSection={<IconCheck size={14} />} onClick={saveEdit}>
                Save
              </Button>
              <Button size="xs" variant="default" onClick={cancelEdit}>
                Cancel
              </Button>
            </Group>
          </Stack>
        ) : (
          <>
            <Group gap="xs">
              <IconClock size={16} />
              <Text size="sm" c="dimmed">
                {diffHours ? `${diffHours} hours` : 'End time pending'}
              </Text>
            </Group>

            <Group gap="xs">
              <Badge
                color={employee.torchUse == null ? 'yellow' : employee.torchUse ? 'orange' : 'gray'}
                variant="light"
              >
                Torch: {employee.torchUse == null ? '?' : employee.torchUse ? 'Yes' : 'No'}
              </Badge>
              <Badge
                color={employee.welderUse == null ? 'yellow' : employee.welderUse ? 'blue' : 'gray'}
                variant="light"
              >
                Welder: {employee.welderUse == null ? '?' : employee.welderUse ? 'Yes' : 'No'}
              </Badge>
            </Group>

            <Text size="sm" c={employee.description ? 'dimmed' : 'yellow.8'}>
              {employee.description || 'Description pending'}
            </Text>

            {(!employee.endTime ||
              employee.torchUse == null ||
              employee.welderUse == null ||
              !employee.description) && (
              <Group gap={4} c="yellow.8">
                <IconAlertTriangle size={14} />
                <Text size="xs">
                  Incomplete — click the pencil to finish before submitting
                </Text>
              </Group>
            )}
          </>
        )}
      </Stack>
    </Card>
  );
};

const JobEmployees = ({ jobEmployees, setFieldValue }: JobEmployeesProps) => {
  return (
    <Stack w="100%" gap="md">
      {jobEmployees.map((employee, index) => (
        <EmployeeCard
          key={index}
          employee={employee}
          index={index}
          jobEmployees={jobEmployees}
          setFieldValue={setFieldValue}
        />
      ))}
    </Stack>
  );
};

export default JobEmployees;

import { Card, Text, Group, Stack, Badge, ThemeIcon, ActionIcon, Button } from '@mantine/core';
import { TimeInput } from '@mantine/dates';
import { IconClock, IconX, IconPencil, IconCheck } from '@tabler/icons-react';
import { useState, useRef } from 'react';
import type { EmployeeJobType } from '../../../types';
import { useEmployees } from '../../../services/queries';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

interface JobEmployeesProps {
  jobEmployees: EmployeeJobType[];
  setFieldValue: (field: string, value: any) => void;
}

interface EmployeeCardProps {
  employee: EmployeeJobType;
  index: number;
  jobEmployees: EmployeeJobType[];
  setFieldValue: (field: string, value: any) => void;
}

const EmployeeCard = ({ employee, index, jobEmployees, setFieldValue }: EmployeeCardProps) => {
  const { employees } = useEmployees();
  const emp = employees?.find((e) => e.id === employee.employeeId);
  const start = dayjs(employee.startTime, 'HH:mm');
  const end = dayjs(employee.endTime, 'HH:mm');
  const diffHours = end.diff(start, 'hour', true).toFixed(2);

  const [isEditing, setIsEditing] = useState(false);
  const [draftStart, setDraftStart] = useState(employee.startTime);
  const [draftEnd, setDraftEnd] = useState(employee.endTime);
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
    setError(null);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setError(null);
  };

  const saveEdit = () => {
    if (!draftStart || !draftEnd) {
      setError('Start and end times are required');
      return;
    }
    if (draftStart >= draftEnd) {
      setError('Start time must be before end time');
      return;
    }
    const updated = jobEmployees.map((e, i) =>
      i === index ? { ...e, startTime: draftStart, endTime: draftEnd } : e
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
              <Badge color="green" style={{ cursor: 'pointer' }} onClick={startEdit}>
                {employee.startTime} - {employee.endTime}
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
          <Stack gap="xs">
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
                value={draftEnd}
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
          <Group gap="xs">
            <IconClock size={16} />
            <Text size="sm" c="dimmed">
              {diffHours} hours
            </Text>
          </Group>
        )}

        {(employee.torchUse || employee.welderUse) && (
          <Group gap="xs">
            {employee.torchUse && <Badge color="orange" variant="light">Torch Use</Badge>}
            {employee.welderUse && <Badge color="blue" variant="light">Welder Use</Badge>}
          </Group>
        )}

        <Text size="sm" c="dimmed">
          {employee.description}
        </Text>
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

import { Card, Text, Group, Stack, Badge, ThemeIcon } from '@mantine/core';
import { IconClock, IconX } from '@tabler/icons-react';
import type { EmployeeJobType } from '../../../types';
import { useEmployees } from '../../../services/queries';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

interface JobEmployeesProps {
  jobEmployees: EmployeeJobType[];
  setFieldValue: (field: string, value: any) => void;
}

const JobEmployees = ({ jobEmployees, setFieldValue }: JobEmployeesProps) => {
  const { employees } = useEmployees();

  const singleJobEmployee = (employee: EmployeeJobType) => {
    const emp = employees?.find((emp) => emp.id === employee.employeeId);
    const start = dayjs(employee.startTime, 'HH:mm');
    const end = dayjs(employee.endTime, 'HH:mm');
    const diffHours = end.diff(start, 'hour', true).toFixed(2);

    const deleteEmployee = () => {
      const updatedEmployees = jobEmployees.filter((e) => e.employeeId !== employee.employeeId);
      setFieldValue('employees', updatedEmployees);
    };
    
    return (
      <Card key={employee.employeeId} shadow="sm" padding="lg" radius="md" withBorder w="100%">
        <Stack gap="sm">
          <Group justify="space-between">
            <Group>
              <Text fw={500} size="lg">
                {emp?.firstName} {emp?.lastName}
              </Text>
              <Badge color="green">
                {employee.startTime} - {employee.endTime}
              </Badge>
            </Group>
            <ThemeIcon variant="white" radius="xl" color="red" onClick={deleteEmployee}>
              <IconX size={20} />
            </ThemeIcon>
          </Group>

          <Group gap="xs">
            <IconClock size={16} />
            <Text size="sm" c="dimmed">
              {diffHours} hours
            </Text>
          </Group>

          <Text size="sm" c="dimmed">
            {employee.description}
          </Text>
        </Stack>
      </Card>
    );
  };

  return (
    <Stack w="100%" gap="md">
      {jobEmployees.map((employee) => singleJobEmployee(employee))}
    </Stack>
  );
};

export default JobEmployees;

import { Modal, Button, Group, Stack, Text, Title, Divider, List } from '@mantine/core';
import type {
  DriverVehicleJobType,
  EmployeeJobType,
  EmployeeType,
  EquipmentJobType,
  EquipmentType,
  PartJobType,
  SubcontractorJobType,
  SubcontractorType,
  VehicleType,
} from '../../../types';
import dayjs from 'dayjs';

interface JobSummaryModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (complete: boolean) => void;
  jobValues: {
    customer?: string;
    jobNumber?: string;
    date?: string | Date | null;
    employees?: EmployeeJobType[];
    drivers?: DriverVehicleJobType[];
    equipment?: EquipmentJobType[];
    subcontractors?: SubcontractorJobType[];
    parts?: PartJobType[];
  };
  employees?: EmployeeType[];
  vehicles?: VehicleType[];
  equipmentList?: EquipmentType[];
  subcontractors?: SubcontractorType[];
}

export function JobSummaryModal({
  opened,
  onClose,
  onSubmit,
  jobValues,
  employees,
  vehicles,
  equipmentList,
  subcontractors,
}: JobSummaryModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Title order={3}>Job Summary</Title>}
      size="lg"
      centered
    >
      <Stack gap="md">
        <div>
          <Text size="sm" c="dimmed" tt="uppercase" fw={700}>
            Customer
          </Text>
          <Text size="lg" fw={500}>
            {jobValues.customer}
          </Text>
        </div>
        <Divider />
        <Group grow>
          <div>
            <Text size="sm" c="dimmed" tt="uppercase" fw={700}>
              Job Number
            </Text>
            <Text>{jobValues.jobNumber}</Text>
          </div>
          <div>
            <Text size="sm" c="dimmed" tt="uppercase" fw={700}>
              Date
            </Text>
            <Text>{jobValues.date ? dayjs(jobValues.date).format('MMM D, YYYY') : 'Not set'}</Text>
          </div>
        </Group>
        {!!jobValues.employees?.length && (
          <>
            <Divider />
            <div>
              <Text size="sm" c="dimmed" tt="uppercase" fw={700} mb="xs">
                Employees
              </Text>
              <List size="sm">
                {jobValues.employees.map((emp, index) => {
                  const employee = employees?.find((e) => e.id === emp.employeeId);
                  return (
                    <List.Item key={index}>
                      {employee?.firstName} {employee?.lastName} - {emp.startTime} to {emp.endTime}
                      {emp.description && ` (${emp.description})`}
                    </List.Item>
                  );
                })}
              </List>
            </div>
          </>
        )}
        {!!jobValues.drivers?.length && (
          <>
            <Divider />
            <div>
              <Text size="sm" c="dimmed" tt="uppercase" fw={700} mb="xs">
                Drivers & Vehicles
              </Text>
              <List size="sm">
                {jobValues.drivers.map((dv, index) => {
                  const driver = employees?.find((e) => e.id === dv.driverId);
                  const vehicle = vehicles?.find((v) => v.id === dv.vehicleId);
                  return (
                    <List.Item key={index}>
                      {driver?.firstName} {driver?.lastName} - {vehicle?.name}
                    </List.Item>
                  );
                })}
              </List>
            </div>
          </>
        )}
        {!!jobValues.equipment?.length && (
          <>
            <Divider />
            <div>
              <Text size="sm" c="dimmed" tt="uppercase" fw={700} mb="xs">
                Equipment
              </Text>
              <List size="sm">
                {jobValues.equipment.map((equip, index) => {
                  const eq = equipmentList?.find((e) => e.id === equip.equipmentId);
                  return (
                    <List.Item key={index}>
                      {eq?.name} - {equip.hours} hours
                    </List.Item>
                  );
                })}
              </List>
            </div>
          </>
        )}
        {!!jobValues.subcontractors?.length && (
          <>
            <Divider />
            <div>
              <Text size="sm" c="dimmed" tt="uppercase" fw={700} mb="xs">
                Subcontractors
              </Text>
              <List size="sm">
                {jobValues.subcontractors.map((sub, index) => {
                  const subcontractor = subcontractors?.find((s) => s.id === sub.subContractorId);
                  return (
                    <List.Item key={index}>
                      {subcontractor?.name} - {sub.numberOfMen} people × {sub.hoursPerMan} hours
                    </List.Item>
                  );
                })}
              </List>
            </div>
          </>
        )}
        {!!jobValues.parts?.length && (
          <>
            <Divider />
            <div>
              <Text size="sm" c="dimmed" tt="uppercase" fw={700} mb="xs">
                Parts
              </Text>
              <List size="sm">
                {jobValues.parts.map((part, index) => (
                  <List.Item key={index}>
                    #{part.partNumber} (x{part.quantity}) - {part.description}
                  </List.Item>
                ))}
              </List>
            </div>
          </>
        )}
        <Divider />
        <Group justify="flex-end">
          <Button
            variant="outline"
            onClick={() => onSubmit(false)}
            disabled={
              !jobValues.employees?.length ||
              !jobValues.drivers?.length ||
              !jobValues.equipment?.length
            }
          >
            Job Incomplete
          </Button>
          <Button
            variant="filled"
            onClick={() => onSubmit(true)}
            disabled={
              !jobValues.employees?.length ||
              !jobValues.drivers?.length ||
              !jobValues.equipment?.length
            }
          >
            Job Complete
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

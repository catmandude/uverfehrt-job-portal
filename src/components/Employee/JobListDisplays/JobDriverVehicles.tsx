import { Card, Text, Group, Stack, ThemeIcon } from '@mantine/core';
import type { DriverVehicleJobType } from '../../../types';
import { useEmployees, useVehicles } from '../../../services/queries';
import { IconX } from '@tabler/icons-react';

interface JobDriverVehiclesProps {
  jobDriverVehicles: DriverVehicleJobType[];
  setFieldValue: (field: string, value: any) => void;
}

const JobDriverVehicles = ({ jobDriverVehicles, setFieldValue }: JobDriverVehiclesProps) => {
  const { employees } = useEmployees();
  const { vehicles } = useVehicles();

  const singleDriverVehicle = (driverVehicle: DriverVehicleJobType) => {
    const emp = employees?.find((emp) => emp.id === driverVehicle.driverId);
    const vehicle = vehicles?.find((veh) => veh.id === driverVehicle.vehicleId);

    const deleteDriverVehicle = () => {
      const updatedDriverVehicles = jobDriverVehicles.filter(
        (dv) => dv.driverId !== driverVehicle.driverId
      );
      setFieldValue('drivers', updatedDriverVehicles);
    };

    return (
      <Card
        key={driverVehicle.driverId}
        shadow="sm"
        padding="lg"
        radius="md"
        withBorder
        w="100%"
      >
        <Stack gap={0}>
          <Group justify="space-between">
            <Text size="lg">
              <b>Driver:</b> {emp?.firstName} {emp?.lastName}
            </Text>
            <ThemeIcon variant="white" radius="xl" color="red" onClick={deleteDriverVehicle}>
              <IconX size={20} />
            </ThemeIcon>
          </Group>
         <Group>
            <Text size="md">
              <b>Vehicle:</b> {vehicle?.name}
            </Text>
         </Group>
        </Stack>
      </Card>
    );
  };

  return (
    <Stack w="100%" gap="md">
      {jobDriverVehicles.map((driverVehicle) => singleDriverVehicle(driverVehicle))}
    </Stack>
  );
};

export default JobDriverVehicles;

import { Modal, Button, Group, Stack, Select } from '@mantine/core';
import { useForm } from '@mantine/form';
import type { DriverVehicleJobType } from '../../../types';
import { useEmployees, useVehicles } from '../../../services/queries';

interface AddDriverVehicleModalProps {
  opened: boolean;
  onClose: () => void;
  jobId: number;
  onSubmit: (employees: Omit<DriverVehicleJobType, 'id'>) => void;
}

interface FormType {
  driverId: number | null;
  vehicleId: number | null;
}

export function AddDriverVehicleModal({
  opened,
  onClose,
  jobId,
  onSubmit,
}: AddDriverVehicleModalProps) {
  const { employees } = useEmployees();
  const { vehicles } = useVehicles();
  const displayEmployees = employees?.map((employee) => ({
    value: String(employee.id),
    label: `${employee.firstName} ${employee.lastName}`,
    ...employee,
  }));
  const displayVehicles = vehicles?.map((vehicle) => ({
    value: String(vehicle.id),
    label: vehicle.name,
    ...vehicle,
  }));

  const form = useForm<FormType>({
    initialValues: {
      driverId: null,
      vehicleId: null,
    },
    validate: {
      driverId: (value) => (value === null ? 'Driver is required' : null),
      vehicleId: (value) => (value === null ? 'Vehicle is required' : null),
    },
  });
  const formValues = form.getValues();

  const handleCancel = () => {
    form.reset();
    onClose();
  };

  const handleSubmit = (values: typeof form.values) => {
    onSubmit({
      jobId,
      driverId: values.driverId!,
      vehicleId: values.vehicleId!,
    });
    handleCancel();
  };

  return (
    <Modal opened={opened} onClose={handleCancel} title="Add Driver/Vehicle to Job" size="md">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <Select
            onChange={(event) => form.setFieldValue('driverId', Number(event))}
            label="Driver"
            value={String(formValues.driverId)}
            data={displayEmployees}
            maw="30rem"
          />
          <Select
            onChange={(event) => form.setFieldValue('vehicleId', Number(event))}
            label="Vehicle"
            value={String(formValues.vehicleId)}
            data={displayVehicles}
            maw="30rem"
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add Driver/Vehicle</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

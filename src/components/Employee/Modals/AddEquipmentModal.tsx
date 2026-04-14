import { Modal, Button, Group, Stack, Select, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import type { EquipmentJobType } from '../../../types';
import { useEquipment } from '../../../services/queries';

interface AddEquipmentModalProps {
  opened: boolean;
  onClose: () => void;
  jobId: number;
  onSubmit: (equipment: Omit<EquipmentJobType, 'id'>) => void;
}

interface FormType {
  equipmentId: number | null;
  hours: number | null;
}

export function AddEquipmentModal({ opened, onClose, jobId, onSubmit }: AddEquipmentModalProps) {
  const { equipment } = useEquipment();
  const displayEquipment = equipment
    ? equipment.map((eq) => ({ value: String(eq.id), label: eq.name }))
    : [];

  const form = useForm<FormType>({
    initialValues: {
      equipmentId: null,
      hours: null,
    },
    validate: {
      equipmentId: (value) => (value === null ? 'Equipment is required' : null),
      hours: (value) => (value === null ? 'Hours are required' : null),
    },
  });
  const formValues = form.values;

  const handleCancel = () => {
    form.reset();
    onClose();
  };

  const handleSubmit = (values: typeof form.values) => {
    onSubmit({
      jobId,
      equipmentId: values.equipmentId!,
      hours: values.hours!,
    });
    handleCancel();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleCancel}
      title="Add Equipment to Job"
      size="lg"
      centered
      styles={{ body: { minHeight: '60vh', display: 'flex', flexDirection: 'column' } }}
    >
      <form
        onSubmit={form.onSubmit(handleSubmit)}
        style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
      >
        <Stack gap="md" style={{ flex: 1 }}>
          <Select
            onChange={(event) => form.setFieldValue('equipmentId', Number(event))}
            label="Equipment"
            value={String(formValues.equipmentId)}
            data={displayEquipment}
            comboboxProps={{ withinPortal: false }}
          />
          <TextInput
            type="number"
            onChange={(event) => form.setFieldValue('hours', Number(event.currentTarget.value))}
            label="Hours"
            value={formValues.hours !== null ? String(formValues.hours) : ''}
          />
        </Stack>
        <Group grow mt="xl">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Add Equipment</Button>
        </Group>
      </form>
    </Modal>
  );
}

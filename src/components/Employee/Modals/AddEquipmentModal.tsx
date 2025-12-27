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
  const formValues = form.getValues();

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
    <Modal opened={opened} onClose={handleCancel} title="Add Equipment to Job" size="md" centered>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <Select
            onChange={(event) => form.setFieldValue('equipmentId', Number(event))}
            label="Equipment"
            value={String(formValues.equipmentId)}
            data={displayEquipment}
            maw="30rem"
          />
          <TextInput
            type="number"
            onChange={(event) => form.setFieldValue('hours', Number(event.currentTarget.value))}
            label="Hours"
            value={formValues.hours !== null ? String(formValues.hours) : ''}
            maw="30rem"
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add Equipment</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

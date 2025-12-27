import { Modal, Button, Group, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import type { PartJobType } from '../../../types';

interface AddPartsModalProps {
  opened: boolean;
  onClose: () => void;
  jobId: number;
  onSubmit: (part: Omit<PartJobType, 'id'>) => void;
}

interface FormType {
  partNumber: string | null;
  quantity: number | null;
  description: string | null;
}

export function AddPartsModal({ opened, onClose, jobId, onSubmit }: AddPartsModalProps) {
  const form = useForm<FormType>({
    initialValues: {
      partNumber: null,
      quantity: null,
      description: null,
    },
    validate: {
      partNumber: (value) => (value === null ? 'Part number is required' : null),
      quantity: (value) => (value === null ? 'Quantity is required' : null),
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
      partNumber: values.partNumber!,
      quantity: Number(values.quantity!),
      description: values.description!,
    });
    handleCancel();
  };

  return (
    <Modal opened={opened} onClose={handleCancel} title="Add Part to Job" size="md" centered>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput
            onChange={(event) => form.setFieldValue('partNumber', event.currentTarget.value)}
            label="Part Number"
            value={formValues.partNumber !== null ? String(formValues.partNumber) : ''}
            maw="30rem"
          />
          <TextInput
            onChange={(event) => form.setFieldValue('quantity', Number(event.currentTarget.value))}
            label="Quantity"
            value={formValues.quantity !== null ? String(formValues.quantity) : ''}
            maw="30rem"
          />
          <TextInput
            onChange={(event) => form.setFieldValue('description', event.currentTarget.value)}
            label="Description"
            value={formValues.description !== null ? String(formValues.description) : ''}
            maw="30rem"
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add Part</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

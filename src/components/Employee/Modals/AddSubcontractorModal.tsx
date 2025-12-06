import { Modal, Button, Group, Stack, Select, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import type { SubcontractorJobType } from '../../../types';
import { useSubcontractors } from '../../../services/queries';

interface AddSubcontractorModalProps {
  opened: boolean;
  onClose: () => void;
  jobId: number;
  onSubmit: (subcontractor: Omit<SubcontractorJobType, 'id'>) => void;
}

interface FormType {
  subcontractorId: number | null;
  numberOfMen: number | null;
  hoursPerMan: number | null;
  description: string | null;
}

export function AddSubcontractorModal({
  opened,
  onClose,
  jobId,
  onSubmit,
}: AddSubcontractorModalProps) {
  const { subcontractors } = useSubcontractors();
  const displaySubcontractors = subcontractors
    ? subcontractors.map((sub) => ({ value: String(sub.id), label: sub.name }))
    : [];

  const form = useForm<FormType>({
    initialValues: {
      subcontractorId: null,
      numberOfMen: null,
      hoursPerMan: null,
      description: null,
    },
    validate: {
      subcontractorId: (value) => (value === null ? 'Subcontractor is required' : null),
      numberOfMen: (value) => (value === null ? 'Number of men is required' : null),
      hoursPerMan: (value) => (value === null ? 'Hours per man are required' : null),
      description: (value) => (value === null ? 'Description is required' : null),
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
      subContractorId: values.subcontractorId!,
      numberOfMen: values.numberOfMen!,
      hoursPerMan: values.hoursPerMan!,
      description: values.description!,
    });
    handleCancel();
  };

  return (
    <Modal opened={opened} onClose={handleCancel} title="Add Subcontractor to Job" size="md">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <Select
            onChange={(event) => form.setFieldValue('subcontractorId', Number(event))}
            label="Subcontractor"
            value={String(formValues.subcontractorId)}
            data={displaySubcontractors}
            maw="30rem"
          />
          <TextInput
            type="number"
            onChange={(event) =>
              form.setFieldValue('hoursPerMan', Number(event.currentTarget.value))
            }
            label="Hours per Man"
            value={formValues.hoursPerMan !== null ? String(formValues.hoursPerMan) : ''}
            maw="30rem"
          />
          <TextInput
            type="number"
            onChange={(event) =>
              form.setFieldValue('numberOfMen', Number(event.currentTarget.value))
            }
            label="Number of Men"
            value={formValues.numberOfMen !== null ? String(formValues.numberOfMen) : ''}
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
            <Button type="submit">Add Subcontractor</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

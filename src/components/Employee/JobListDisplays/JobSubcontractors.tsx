import { Card, Text, Group, Stack, ThemeIcon } from '@mantine/core';
import type { SubcontractorJobType } from '../../../types';
import { useSubcontractors } from '../../../services/queries';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { IconX } from '@tabler/icons-react';

dayjs.extend(customParseFormat);

interface JobSubcontractorsProps {
  jobSubcontractors: SubcontractorJobType[];
  setFieldValue: (field: string, value: any) => void;
}

const JobSubcontractors = ({ jobSubcontractors, setFieldValue }: JobSubcontractorsProps) => {
  const { subcontractors } = useSubcontractors();

  const singleSubcontractor = (subcontractorItem: SubcontractorJobType) => {
    const subcontractor = subcontractors?.find(
      (sub) => sub.id === subcontractorItem.subContractorId
    );

    const deleteSubcontractor = () => {
      const updatedSubcontractors = jobSubcontractors.filter(
        (item) => item.subContractorId !== subcontractorItem.subContractorId
      );
      setFieldValue('subcontractors', updatedSubcontractors);
    };

    return (
      <Card
        key={subcontractorItem.subContractorId}
        shadow="sm"
        padding="lg"
        radius="md"
        withBorder
        w="100%"
      >
        <Stack gap={0}>
          <Group justify="space-between">
            <Text size="lg">
              <b>Subcontractor:</b> {subcontractor?.name}
            </Text>
            <ThemeIcon variant="white" radius="xl" color="red" onClick={deleteSubcontractor}>
              <IconX size={20} />
            </ThemeIcon>
          </Group>
          <Group>
            <Text size="md">
              <b>Number of Men:</b> {subcontractorItem.numberOfMen}
            </Text>
          </Group>
          <Group>
            <Text size="md">
              <b>Hours per Man:</b> {subcontractorItem.hoursPerMan}
            </Text>
          </Group>
          <Group>
            <Text size="md">
              <b>Description:</b> {subcontractorItem.description}
            </Text>
          </Group>
        </Stack>
      </Card>
    );
  };

  return (
    <Stack w="100%" gap="md">
      {jobSubcontractors.map((subcontractorItem) => singleSubcontractor(subcontractorItem))}
    </Stack>
  );
};

export default JobSubcontractors;

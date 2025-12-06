import { Card, Text, Group, Stack, ThemeIcon } from '@mantine/core';
import type { PartJobType } from '../../../types';
import { IconX } from '@tabler/icons-react';

interface JobPartsProps {
  jobParts: PartJobType[];
  setFieldValue: (field: string, value: any) => void;
}

const JobParts = ({ jobParts, setFieldValue }: JobPartsProps) => {
  const singlePart = (partItem: PartJobType) => {
    const deletePart = () => {
      const updatedParts = jobParts.filter((item) => item.partNumber !== partItem.partNumber);
      setFieldValue('parts', updatedParts);
    };
    return (
      <Card key={partItem.partNumber} shadow="sm" padding="lg" radius="md" withBorder w="100%">
        <Stack gap={0}>
          <Group justify="space-between">
            <Text size="lg">
              <b>Part Number:</b> {partItem.partNumber}
            </Text>
            <ThemeIcon variant="white" radius="xl" color="red" onClick={deletePart}>
              <IconX size={20} />
            </ThemeIcon>
          </Group>
          <Group>
            <Text size="md">
              <b>Quantity:</b> {partItem.quantity}
            </Text>
          </Group>
          <Group>
            <Text size="md">
              <b>Description:</b> {partItem.description}
            </Text>
          </Group>
        </Stack>
      </Card>
    );
  };

  return (
    <Stack w="100%" gap="md">
      {jobParts.map((partItem) => singlePart(partItem))}
    </Stack>
  );
};

export default JobParts;

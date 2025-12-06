import { Card, Text, Group, Stack, ThemeIcon } from '@mantine/core';
import type { EquipmentJobType } from '../../../types';
import { useEquipment } from '../../../services/queries';
import { IconX } from '@tabler/icons-react';

interface JobEquipmentProps {
  jobEquipment: EquipmentJobType[];
  setFieldValue: (field: string, value: any) => void;
}

const JobEquipment = ({ jobEquipment, setFieldValue }: JobEquipmentProps) => {
  const { equipment } = useEquipment();

  const singleEquipment = (equipmentItem: EquipmentJobType) => {
    const equip = equipment?.find((emp) => emp.id === equipmentItem.equipmentId);

    const deleteEquipment = () => {
      const updatedEquipment = jobEquipment.filter(
        (item) => item.equipmentId !== equipmentItem.equipmentId
      );
      setFieldValue('equipment', updatedEquipment);
    }

    return (
      <Card
        key={equipmentItem.equipmentId}
        shadow="sm"
        padding="lg"
        radius="md"
        withBorder
        w="100%"
      >
        <Stack gap={0}>
          <Group justify='space-between'>
            <Text size="lg">
              <b>Equipment:</b> {equip?.name}
            </Text>
            <ThemeIcon variant="white" radius="xl" color="red" onClick={deleteEquipment}>
              <IconX size={20} />
            </ThemeIcon>
          </Group>
          <Group>
            <Text size="md">
              <b>Hours:</b> {equipmentItem.hours}
            </Text>
          </Group>
        </Stack>
      </Card>
    );
  };

  return (
    <Stack w="100%" gap="md">
      {jobEquipment.map((equipmentItem) => singleEquipment(equipmentItem))}
    </Stack>
  );
};

export default JobEquipment;

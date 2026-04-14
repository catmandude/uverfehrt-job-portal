import { useState } from 'react';
import { ActionIcon, Button, Card, Group, Modal, Text, Badge, Stack, ScrollArea, Center } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconTrash } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import { useMyPredefinedJobs, useDeleteJob } from '../services/queries';

export default function Dashboard() {
  const navigate = useNavigate();

  const { myPredefinedJobs, myPredefinedJobsLoading } = useMyPredefinedJobs();
  const deleteJob = useDeleteJob();
  const [jobToDelete, setJobToDelete] = useState<{ id: number; customer: string } | null>(null);

  if (myPredefinedJobsLoading) {
    return (
      <Stack p="md">
        <Text size="lg" fw={600}>
          Loading jobs...
        </Text>
      </Stack>
    );
  }

  if (!myPredefinedJobs?.length) {
    return (
      <Center>
        <Text>No jobs found.</Text>
      </Center>
    );
  }

  return (
    <ScrollArea style={{ height: '100dvh' }} px="md" py="lg">
      <Stack gap="lg">
        <Text size="xl" fw={700}>
          My Jobs
        </Text>
        {myPredefinedJobs.map((job) => (
          <Card
            key={job.id}
            shadow="sm"
            radius="md"
            p="md"
            withBorder
            style={{ borderLeft: '5px solid var(--mantine-color-blue-filled)' }}
            onClick={() =>
              navigate({ to: '/job/$jobId/create', params: { jobId: String(job.id) } })
            }
          >
            <Group justify="space-between" mb={4}>
              <Text size="lg">
                Cust: <b>{job.customer}</b>
              </Text>
              <Group gap="xs">
                {!!job.date && (
                  <Badge color="blue">{new Date(job.date).toLocaleDateString()}</Badge>
                )}
                <ActionIcon
                  variant="subtle"
                  color="red"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (job.id == null) return;
                    setJobToDelete({ id: job.id, customer: job.customer });
                  }}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            </Group>
            <Text size="md">Job Number: {job.jobNumber}</Text>
            {job.location && (
              <Text size="sm" c="dimmed">
                📍 {job.location}
              </Text>
            )}
            {job.description && (
              <Text size="sm" mt="xs">
                {job.description}
              </Text>
            )}
          </Card>
        ))}
      </Stack>

      <Modal
        opened={!!jobToDelete}
        onClose={() => setJobToDelete(null)}
        title="Confirm Delete"
        centered
      >
        <Stack>
          <Text>
            Are you sure you want to delete the job for{' '}
            <strong>{jobToDelete?.customer}</strong>? This action cannot be undone.
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setJobToDelete(null)}>
              Cancel
            </Button>
            <Button
              color="red"
              onClick={() => {
                if (!jobToDelete) return;
                deleteJob.mutate(jobToDelete.id, {
                  onSuccess: () => {
                    notifications.show({
                      title: 'Success',
                      message: 'Job deleted successfully',
                      color: 'green',
                    });
                    setJobToDelete(null);
                  },
                });
              }}
            >
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </ScrollArea>
  );
}

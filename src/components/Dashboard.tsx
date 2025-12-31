import { Card, Group, Text, Badge, Stack, ScrollArea, Center } from '@mantine/core';

import { useNavigate } from '@tanstack/react-router';
import { useMyPredefinedJobs } from '../services/queries';

export default function Dashboard() {
  const navigate = useNavigate();

  const { myPredefinedJobs, myPredefinedJobsLoading } = useMyPredefinedJobs();

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
              {!!job.date && (
                <Badge color="blue">{new Date(job.date).toLocaleDateString()}</Badge>
              )}
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
    </ScrollArea>
  );
}

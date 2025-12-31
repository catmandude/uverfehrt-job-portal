import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  Container,
  Title,
  Text,
  Button,
  Card,
  Group,
  Stack,
  Badge,
  Loader,
  Center,
  SimpleGrid,
  Modal,
  Divider,
  List,
} from '@mantine/core';
import { IconTemplate, IconCalendar, IconBriefcase, IconEye } from '@tabler/icons-react';
import dayjs from 'dayjs';
import type { JobType } from '../../types';
import { useMyClosedJobs } from '../../services/queries';

const MyHistory: React.FC = () => {
  const navigate = useNavigate();
  const { myClosedJobs, myClosedJobsLoading } = useMyClosedJobs();
  const [selectedJob, setSelectedJob] = useState<JobType | null>(null);
  const [modalOpened, setModalOpened] = useState(false);

  const handleUtilizeJob = (job: JobType) => {
    navigate({ to: '/job/$jobId/create', params: { jobId: String(job.id) } });
  };

  const handleViewJob = (job: JobType) => {
    setSelectedJob(job);
    setModalOpened(true);
  };

  if (myClosedJobsLoading) {
    return (
      <Container size="lg" py="xl">
        <Center h={400}>
          <Stack align="center">
            <Loader size="lg" />
            <Text c="dimmed">Loading job history...</Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Group justify="space-between" align="center">
          <div>
            <Title order={1}>My Job History</Title>
            <Text c="dimmed" size="sm" mt="xs">
              View and reuse your completed jobs
            </Text>
          </div>
          <Badge size="lg" variant="light" color="blue">
            {myClosedJobs?.length || 0} Jobs
          </Badge>
        </Group>

        {!myClosedJobs || myClosedJobs.length === 0 ? (
          <Card shadow="sm" padding="xl" radius="md" withBorder>
            <Stack align="center" py="xl">
              <IconBriefcase size={48} stroke={1.5} style={{ opacity: 0.5 }} />
              <Text c="dimmed" size="lg">
                No job history found
              </Text>
              <Text c="dimmed" size="sm">
                Your completed jobs will appear here
              </Text>
            </Stack>
          </Card>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
            {myClosedJobs.map((job) => (
              <Card key={job.id} shadow="sm" padding="lg" radius="md" withBorder>
                <Stack gap="md">
                  <div>
                    <Title order={3} lineClamp={1}>
                      {job.customer}
                    </Title>
                    <Text size="sm" c="dimmed" mt={4}>
                      Job #{job.jobNumber}
                    </Text>
                  </div>

                  <Group gap="xs">
                    <IconCalendar size={16} stroke={1.5} style={{ opacity: 0.7 }} />
                    <Text size="sm" c="dimmed">
                      {dayjs(job.date).format('MMM D, YYYY')}
                    </Text>
                  </Group>

                  {job.description && (
                    <Text size="sm" lineClamp={2} c="dimmed">
                      {job.description}
                    </Text>
                  )}

                  <Button
                    variant="light"
                    fullWidth
                    leftSection={<IconEye size={18} />}
                    onClick={() => handleViewJob(job)}
                    mt="auto"
                  >
                    View Details
                  </Button>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </Stack>
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title={<Title order={3}>Job Details</Title>}
        size="lg"
        centered
      >
        {selectedJob && (
          <Stack gap="md">
            <div>
              <Text size="sm" c="dimmed" tt="uppercase" fw={700}>
                Customer
              </Text>
              <Text size="lg" fw={500}>
                {selectedJob.customer}
              </Text>
            </div>
            <Divider />
            <Group grow>
              <div>
                <Text size="sm" c="dimmed" tt="uppercase" fw={700}>
                  Job Number
                </Text>
                <Text>{selectedJob.jobNumber}</Text>
              </div>
              <div>
                <Text size="sm" c="dimmed" tt="uppercase" fw={700}>
                  Date
                </Text>
                <Text>{dayjs(selectedJob.date).format('MMM D, YYYY')}</Text>
              </div>
            </Group>
            {selectedJob.location && (
              <>
                <Divider />
                <div>
                  <Text size="sm" c="dimmed" tt="uppercase" fw={700}>
                    Location
                  </Text>
                  <Text>{selectedJob.location}</Text>
                </div>
              </>
            )}
            {selectedJob.description && (
              <>
                <Divider />
                <div>
                  <Text size="sm" c="dimmed" tt="uppercase" fw={700}>
                    Description
                  </Text>
                  <Text>{selectedJob.description}</Text>
                </div>
              </>
            )}
            {selectedJob.links && selectedJob.links.length > 0 && (
              <>
                <Divider />
                <div>
                  <Text size="sm" c="dimmed" tt="uppercase" fw={700}>
                    Links
                  </Text>
                  <List size="sm">
                    {selectedJob.links.map((link, index) => (
                      <List.Item key={index}>
                        <Text
                          component="a"
                          href={link}
                          target="_blank"
                          c="blue"
                          style={{ textDecoration: 'underline' }}
                        >
                          {link}
                        </Text>
                      </List.Item>
                    ))}
                  </List>
                </div>
              </>
            )}
            {!!selectedJob.employees?.length && (
              <>
                <Divider />
                <div>
                  <Text size="sm" c="dimmed" tt="uppercase" fw={700} mb="xs">
                    Employees
                  </Text>
                  <List size="sm">
                    {selectedJob.employees.map((emp: any) => (
                      <List.Item key={emp.id}>
                        {emp.employee?.firstName} {emp.employee?.lastName} -{' '}
                        {dayjs(emp.startTime).format('h:mm A')} to{' '}
                        {dayjs(emp.endTime).format('h:mm A')}
                        {emp.description && ` (${emp.description})`}
                      </List.Item>
                    ))}
                  </List>
                </div>
              </>
            )}
            {!!selectedJob.drivers?.length && (
              <>
                <Divider />
                <div>
                  <Text size="sm" c="dimmed" tt="uppercase" fw={700} mb="xs">
                    Drivers & Vehicles
                  </Text>
                  <List size="sm">
                    {selectedJob.drivers.map((driver: any) => (
                      <List.Item key={driver.id}>
                        {driver.driver?.firstName} {driver.driver?.lastName} -{' '}
                        {driver.vehicle?.name}
                      </List.Item>
                    ))}
                  </List>
                </div>
              </>
            )}
            {!!selectedJob.equipment?.length && (
              <>
                <Divider />
                <div>
                  <Text size="sm" c="dimmed" tt="uppercase" fw={700} mb="xs">
                    Equipment
                  </Text>
                  <List size="sm">
                    {selectedJob.equipment.map((equip: any) => (
                      <List.Item key={equip.id}>
                        {equip.equipment?.name} - {equip.hours} hours
                      </List.Item>
                    ))}
                  </List>
                </div>
              </>
            )}
            {!!selectedJob.subcontractors?.length && (
              <>
                <Divider />
                <div>
                  <Text size="sm" c="dimmed" tt="uppercase" fw={700} mb="xs">
                    Subcontractors
                  </Text>
                  <List size="sm">
                    {selectedJob.subcontractors.map((sub: any) => (
                      <List.Item key={sub.id}>
                        {sub.subcontractor?.name} - {sub.numberOfMen} people × {sub.hoursPerMan}{' '}
                        hours
                      </List.Item>
                    ))}
                  </List>
                </div>
              </>
            )}
            {!!selectedJob.parts?.length && (
              <>
                <Divider />
                <div>
                  <Text size="sm" c="dimmed" tt="uppercase" fw={700} mb="xs">
                    Parts
                  </Text>
                  <List size="sm">
                    {selectedJob.parts.map((part: any) => (
                      <List.Item key={part.id}>
                        #{part.partNumber} (x{part.quantity}) - {part.description}
                      </List.Item>
                    ))}
                  </List>
                </div>
              </>
            )}
            <Divider />
            <Group justify="flex-end">
              <Button variant="default" onClick={() => setModalOpened(false)}>
                Close
              </Button>
              <Button
                variant="filled"
                leftSection={<IconTemplate size={18} />}
                onClick={() => {
                  if (selectedJob) {
                    handleUtilizeJob(selectedJob);
                  }
                }}
              >
                Use as Template
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Container>
  );
};

export default MyHistory;

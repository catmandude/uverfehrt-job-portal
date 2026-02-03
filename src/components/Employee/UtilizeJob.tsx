import {
  Input,
  Title,
  Text,
  Button,
  Group,
  Loader,
  Stack,
  Space,
  Modal,
  Center,
  Divider,
  List,
  Anchor,
} from '@mantine/core';
import { useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { employeesApi, jobsApi } from '../../services/api.ts';
import { useForm } from '@mantine/form';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { useDisclosure } from '@mantine/hooks';
import { AddEmployeesModal } from './Modals/AddEmployeesModal.tsx';
import type {
  DriverVehicleJobType,
  EmployeeJobType,
  EquipmentJobType,
  JobType,
  PartJobType,
  SubcontractorJobType,
} from '../../types.ts';
import { useNavigate, useParams } from '@tanstack/react-router';
import JobEmployees from './JobListDisplays/JobEmployees.tsx';
import { AddDriverVehicleModal } from './Modals/AddDriverVehicleModal.tsx';
import JobDriverVehicles from './JobListDisplays/JobDriverVehicles.tsx';
import { AddEquipmentModal } from './Modals/AddEquipmentModal.tsx';
import JobEquipment from './JobListDisplays/JobEquipment.tsx';
import { AddSubcontractorModal } from './Modals/AddSubcontractorModal.tsx';
import JobSubcontractors from './JobListDisplays/JobSubcontractors.tsx';
import { AddPartsModal } from './Modals/AddPartsModal.tsx';
import JobParts from './JobListDisplays/JobParts.tsx';
import {
  useJob,
  useEmployees,
  useVehicles,
  useEquipment,
  useSubcontractors,
} from '../../services/queries.ts';
import { DatePickerInput } from '@mantine/dates';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { notifications } from '@mantine/notifications';

dayjs.extend(customParseFormat);

const CreateJob = () => {
  const { jobId } = useParams({ strict: false });
  const navigate = useNavigate();
  const { user } = useAuth();
  const { job, jobLoading } = useJob(Number(jobId));
  const { employees } = useEmployees();
  const { vehicles } = useVehicles();
  const { equipment: equipmentList } = useEquipment();
  const { subcontractors } = useSubcontractors();

  const jobForm = useForm<Partial<JobType>>({
    initialValues: {
      customer: '',
      jobNumber: '',
      createdFromJobId: null,
      date: null,
      employees: [] as EmployeeJobType[],
      subcontractors: [] as SubcontractorJobType[],
      equipment: [] as EquipmentJobType[],
      drivers: [] as DriverVehicleJobType[],
      parts: [] as PartJobType[],
    },
  });

  const jobValues = jobForm.getValues();
  const [employeeOpened, { open: openEmployee, close: employeeClose }] = useDisclosure(false);
  const [driverVehicleOpened, { open: openDriverVehicle, close: driverVehicleClose }] =
    useDisclosure(false);
  const [equipmentOpened, { open: openEquipment, close: equipmentClose }] = useDisclosure(false);
  const [subcontractorOpened, { open: openSubcontractor, close: subcontractorClose }] =
    useDisclosure(false);
  const [partsOpened, { open: openParts, close: partsClose }] = useDisclosure(false);
  const [confirmOpened, { open: openConfirm, close: confirmClose }] = useDisclosure(false);

  const { data: users, isPending } = useQuery({
    queryKey: ['users'],
    queryFn: () => employeesApi.getUsers(),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (jobId && jobId !== 'new') {
      if (job) {
        const isUserDraft = !job.adminCreatedById;
        const employees = isUserDraft
          ? job.employees.map((emp) => ({
              ...emp,
              startTime: dayjs(emp.startTime).format('HH:mm'),
              endTime: dayjs(emp.endTime).format('HH:mm'),
            }))
          : [];
        jobForm.setValues({
          customer: job.customer,
          jobNumber: job.jobNumber,
          createdFromJobId: job.isEdit ? job.id : undefined,
          date: null,
          employees,
          subcontractors: isUserDraft ? job.subcontractors : [],
          equipment: isUserDraft ? job.equipment : [],
          drivers: isUserDraft ? job.drivers : [],
          parts: isUserDraft ? job.parts : [],
        });
      }
    }
  }, [jobId, job]);

  const newCreatedByUser = users?.find((storeUser) => user?.id === storeUser.id);

  const buildDateTime = (date: string | Date, time: string) => {
    const dateOnly = dayjs(date).format('YYYY-MM-DD');
    return dayjs(`${dateOnly} ${time}`, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD HH:mm:ss');
  };

  const handleSubmitJob = (isComplete: boolean) => {
    createJobMutation.mutate(!isComplete);
    confirmClose();
  };

  const createJobMutation = useMutation({
    mutationFn: (isEdit: boolean = false) =>
      jobsApi.utilizeJob({
        customer: jobValues.customer || '',
        jobNumber: jobValues.jobNumber || '',
        date: new Date(jobValues.date || ''),
        isEdit,
        description: job?.description || undefined,
        location: job?.location || undefined,
        createdFromJobId: job?.isEdit ? job.id : undefined,
        adminCreatedById: job?.adminCreatedById || null,
        employees:
          jobValues.employees?.map((emp) => ({
            ...emp,
            startTime: buildDateTime(jobValues.date!, emp.startTime),
            endTime: buildDateTime(jobValues.date!, emp.endTime),
          })) || [],
        equipment: jobValues.equipment || [],
        drivers: jobValues.drivers || [],
        subcontractors: jobValues.subcontractors || [],
        parts: jobValues.parts || [],
        createdById: undefined,
        links: job?.links || [],
      }),
    onSettled: (data) => {
      if (data) {
        notifications.show({
          title: 'Job submitted',
          message: `Job ${data.isEdit ? 'saved' : 'submitted'} for customer: ${jobValues.customer} that will be done by ${newCreatedByUser?.name}`,
          color: 'blue',
        });
        jobForm.reset();
        return data.isEdit ? navigate({ to: '/' }) : navigate({ to: '/my-history' });
      }
      notifications.show({
        title: 'Error',
        message: 'There was an issue creating the job. Please try again.',
        color: 'red',
      });
    },
  });

  if (jobLoading && jobId !== 'new') {
    return (
      <Center style={{ height: '100%' }}>
        <Loader size="md" />
      </Center>
    );
  }

  console.log('Job Values:', job);

  return (
    <Stack w="100%" gap="lg" mb="md">
      {employeeOpened && (
        <AddEmployeesModal
          opened={employeeOpened}
          onClose={employeeClose}
          jobId={jobId !== 'new' ? Number(jobId) : 0}
          onSubmit={(data) =>
            jobForm.setFieldValue('employees', [...(jobValues.employees || []), ...data])
          }
        />
      )}
      {driverVehicleOpened && (
        <AddDriverVehicleModal
          opened={driverVehicleOpened}
          onClose={driverVehicleClose}
          jobId={jobId !== 'new' ? Number(jobId) : 0}
          onSubmit={(data) =>
            jobForm.setFieldValue('drivers', [...(jobValues.drivers || []), data])
          }
        />
      )}
      {equipmentOpened && (
        <AddEquipmentModal
          opened={equipmentOpened}
          onClose={equipmentClose}
          jobId={jobId !== 'new' ? Number(jobId) : 0}
          onSubmit={(data) =>
            jobForm.setFieldValue('equipment', [...(jobValues.equipment || []), { ...data, id: 0 }])
          }
        />
      )}
      {subcontractorOpened && (
        <AddSubcontractorModal
          opened={subcontractorOpened}
          onClose={subcontractorClose}
          jobId={jobId !== 'new' ? Number(jobId) : 0}
          onSubmit={(data) =>
            jobForm.setFieldValue('subcontractors', [...(jobValues.subcontractors || []), data])
          }
        />
      )}
      {partsOpened && (
        <AddPartsModal
          opened={partsOpened}
          onClose={partsClose}
          jobId={jobId !== 'new' ? Number(jobId) : 0}
          onSubmit={(data) =>
            jobForm.setFieldValue('parts', [...(jobValues.parts || []), { ...data, id: 0 }])
          }
        />
      )}
      <Group justify="space-between">
        <Title order={2}>Add Job {isPending && <Loader size={20} />}</Title>
      </Group>
      <Input.Wrapper label="Customer">
        <Input
          value={jobValues.customer}
          placeholder=""
          onChange={(event) => jobForm.setFieldValue('customer', event.currentTarget.value)}
          maw="35rem"
        />
      </Input.Wrapper>
      <Input.Wrapper label="Job Name / Sales Order #">
        <Input
          value={jobValues.jobNumber}
          placeholder=""
          onChange={(event) => jobForm.setFieldValue('jobNumber', event.currentTarget.value)}
          maw="35rem"
        />
      </Input.Wrapper>
      <DatePickerInput
        label="Pick date (Required)"
        placeholder="Pick date"
        value={jobValues.date}
        onChange={(newDate) => newDate && jobForm.setFieldValue('date', newDate)}
        maw="35rem"
        firstDayOfWeek={0}
      />
      {!!job?.location && (
        <Text>
          <b>Location: </b>
          <Anchor
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.location)}`}
            target="_blank"
          >
            {job.location}
          </Anchor>
        </Text>
      )}
      <Text>
        <b>Links to Manuals: </b>
      </Text>
      <List>
        {!!job?.links
          ? job.links.map((link, index) => (
              <List.Item key={index}>
                <Anchor href={link} target="_blank">
                  {link}
                </Anchor>
              </List.Item>
            ))
          : 'None'}
      </List>
      {/* <Textarea
        value={linksToManuals}
        label="Links to Manuals"
        placeholder="Links to the manuals (separated by commas)"
        onChange={(event) => setLinkToManual(event.currentTarget.value)}
        maw="45rem"
      /> */}
      {!!job?.description && (
        <Text>
          <b>Description: </b>
          {job.description}
        </Text>
      )}
      <JobEmployees
        jobEmployees={jobValues.employees || []}
        setFieldValue={jobForm.setFieldValue}
      />
      <Button w="20rem" variant="outline" onClick={openEmployee}>
        Add Employees (Required)
      </Button>
      <Divider />
      <JobDriverVehicles
        jobDriverVehicles={jobValues.drivers || []}
        setFieldValue={jobForm.setFieldValue}
      />
      <Button w="20rem" variant="outline" onClick={openDriverVehicle}>
        Add Driver/Vehicle (Required)
      </Button>
      <Divider />
      <JobEquipment
        jobEquipment={jobValues.equipment || []}
        setFieldValue={jobForm.setFieldValue}
      />
      <Button w="20rem" variant="outline" onClick={openEquipment}>
        Add Equipment (Required)
      </Button>
      <Divider />
      <JobSubcontractors
        jobSubcontractors={jobValues.subcontractors || []}
        setFieldValue={jobForm.setFieldValue}
      />
      <Button w="20rem" variant="outline" onClick={openSubcontractor}>
        Add Subcontractors
      </Button>
      <Divider />
      <JobParts jobParts={jobValues.parts || []} setFieldValue={jobForm.setFieldValue} />
      <Button w="20rem" variant="outline" onClick={openParts}>
        Add Parts
      </Button>
      <Space h="md" />
      <Button
        disabled={
          createJobMutation.isPending ||
          isPending ||
          !jobValues.customer ||
          !jobValues.jobNumber ||
          !jobValues.date
        }
        variant="filled"
        onClick={openConfirm}
        w="20rem"
      >
        Save/Submit Job
      </Button>
      <Modal
        opened={confirmOpened}
        onClose={confirmClose}
        title={<Title order={3}>Job Summary</Title>}
        size="lg"
        centered
      >
        <Stack gap="md">
          <div>
            <Text size="sm" c="dimmed" tt="uppercase" fw={700}>
              Customer
            </Text>
            <Text size="lg" fw={500}>
              {jobValues.customer}
            </Text>
          </div>
          <Divider />
          <Group grow>
            <div>
              <Text size="sm" c="dimmed" tt="uppercase" fw={700}>
                Job Number
              </Text>
              <Text>{jobValues.jobNumber}</Text>
            </div>
            <div>
              <Text size="sm" c="dimmed" tt="uppercase" fw={700}>
                Date
              </Text>
              <Text>{jobValues.date ? dayjs(jobValues.date).format('MMM D, YYYY') : 'Not set'}</Text>
            </div>
          </Group>
          {!!jobValues.employees?.length && (
            <>
              <Divider />
              <div>
                <Text size="sm" c="dimmed" tt="uppercase" fw={700} mb="xs">
                  Employees
                </Text>
                <List size="sm">
                  {jobValues.employees.map((emp, index) => {
                    const employee = employees?.find((e) => e.id === emp.employeeId);
                    return (
                      <List.Item key={index}>
                        {employee?.firstName} {employee?.lastName} - {emp.startTime} to {emp.endTime}
                        {emp.description && ` (${emp.description})`}
                      </List.Item>
                    );
                  })}
                </List>
              </div>
            </>
          )}
          {!!jobValues.drivers?.length && (
            <>
              <Divider />
              <div>
                <Text size="sm" c="dimmed" tt="uppercase" fw={700} mb="xs">
                  Drivers & Vehicles
                </Text>
                <List size="sm">
                  {jobValues.drivers.map((dv, index) => {
                    const driver = employees?.find((e) => e.id === dv.driverId);
                    const vehicle = vehicles?.find((v) => v.id === dv.vehicleId);
                    return (
                      <List.Item key={index}>
                        {driver?.firstName} {driver?.lastName} - {vehicle?.name}
                      </List.Item>
                    );
                  })}
                </List>
              </div>
            </>
          )}
          {!!jobValues.equipment?.length && (
            <>
              <Divider />
              <div>
                <Text size="sm" c="dimmed" tt="uppercase" fw={700} mb="xs">
                  Equipment
                </Text>
                <List size="sm">
                  {jobValues.equipment.map((equip, index) => {
                    const eq = equipmentList?.find((e) => e.id === equip.equipmentId);
                    return (
                      <List.Item key={index}>
                        {eq?.name} - {equip.hours} hours
                      </List.Item>
                    );
                  })}
                </List>
              </div>
            </>
          )}
          {!!jobValues.subcontractors?.length && (
            <>
              <Divider />
              <div>
                <Text size="sm" c="dimmed" tt="uppercase" fw={700} mb="xs">
                  Subcontractors
                </Text>
                <List size="sm">
                  {jobValues.subcontractors.map((sub, index) => {
                    const subcontractor = subcontractors?.find((s) => s.id === sub.subContractorId);
                    return (
                      <List.Item key={index}>
                        {subcontractor?.name} - {sub.numberOfMen} people × {sub.hoursPerMan} hours
                      </List.Item>
                    );
                  })}
                </List>
              </div>
            </>
          )}
          {!!jobValues.parts?.length && (
            <>
              <Divider />
              <div>
                <Text size="sm" c="dimmed" tt="uppercase" fw={700} mb="xs">
                  Parts
                </Text>
                <List size="sm">
                  {jobValues.parts.map((part, index) => (
                    <List.Item key={index}>
                      #{part.partNumber} (x{part.quantity}) - {part.description}
                    </List.Item>
                  ))}
                </List>
              </div>
            </>
          )}
          <Divider />
          <Group justify="flex-end">
            <Button
              variant="filled"
              onClick={() => handleSubmitJob(true)}
              disabled={
                !jobValues.employees?.length ||
                !jobValues.drivers?.length ||
                !jobValues.equipment?.length
              }
            >
              Complete
            </Button>
            <Button variant="outline" onClick={() => handleSubmitJob(false)}>
              Not Complete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
};

export default CreateJob;

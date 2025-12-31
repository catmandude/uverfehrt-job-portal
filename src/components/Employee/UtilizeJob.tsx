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
import { useJob } from '../../services/queries.ts';
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

  const jobForm = useForm<Partial<JobType>>({
    initialValues: {
      customer: '',
      jobNumber: '',
      createdFromJobId: null,
      date: new Date(),
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
        jobForm.setValues({
          customer: job.customer,
          jobNumber: job.jobNumber,
          createdFromJobId: job.isEdit ? job.id : undefined,
          date: job.isEdit ? job.date : String(new Date()),
          employees: job.isEdit
            ? job.employees?.map((emp) => ({
                ...emp,
                startTime: dayjs(emp.startTime).format('HH:mm'),
                endTime: dayjs(emp.endTime).format('HH:mm'),
              })) || []
            : [],
          subcontractors: job.subcontractors || [],
          equipment: job.equipment || [],
          drivers: job.drivers || [],
          parts: job.parts || [],
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
          title: 'Job Created',
          message: `Job ${data.isEdit ? 'saved' : 'created'} for customer: ${jobValues.customer} that will be done by ${newCreatedByUser?.name}`,
          color: 'blue',
        });
        jobForm.reset();
        return navigate({ to: '/my-history' });
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
        label="Pick date"
        placeholder="Pick date"
        value={jobValues.date}
        onChange={(newDate) => newDate && jobForm.setFieldValue('date', newDate)}
        maw="35rem"
        firstDayOfWeek={0}
      />
      {!!job?.location && (
        <Text>
          <b>Location: </b>
          {job.location}
        </Text>
      )}
      {!!job?.links && (
        <Text>
          <b>Links to Manuals: </b>
          {job.links.join(', ')}
        </Text>
      )}
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
      <JobDriverVehicles
        jobDriverVehicles={jobValues.drivers || []}
        setFieldValue={jobForm.setFieldValue}
      />
      <Button w="20rem" variant="outline" onClick={openDriverVehicle}>
        Add Driver/Vehicle (Required)
      </Button>
      <JobEquipment
        jobEquipment={jobValues.equipment || []}
        setFieldValue={jobForm.setFieldValue}
      />
      <Button w="20rem" variant="outline" onClick={openEquipment}>
        Add Equipment (Required)
      </Button>
      <JobSubcontractors
        jobSubcontractors={jobValues.subcontractors || []}
        setFieldValue={jobForm.setFieldValue}
      />
      <Button w="20rem" variant="outline" onClick={openSubcontractor}>
        Add Subcontractors
      </Button>
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

      {/* Completion Confirmation Modal */}
      <Modal opened={confirmOpened} onClose={confirmClose} title="Job Completion Status" centered>
        <Stack>
          <Text>Is this job complete?</Text>
          <Group justify="flex-end">
            <Button variant="outline" onClick={() => handleSubmitJob(false)}>
              No, Save as Incomplete
            </Button>
            <Button
              variant="filled"
              onClick={() => handleSubmitJob(true)}
              disabled={
                !jobValues.employees?.length ||
                !jobValues.drivers?.length ||
                !jobValues.equipment?.length
              }
            >
              Yes, Mark as Complete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
};

export default CreateJob;

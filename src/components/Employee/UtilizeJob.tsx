import { Input, Title, Text, Button, Alert, Group, Loader, Stack, Space } from '@mantine/core';
import { useEffect, useState } from 'react';
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
import { useParams } from '@tanstack/react-router';
import JobEmployees from './JobListDisplays/JobEmployees.tsx';
import { AddDriverVehicleModal } from './Modals/AddDriverVehicleModal.tsx';
import JobDriverVehicles from './JobListDisplays/JobDriverVehicles.tsx';
import { AddEquipmentModal } from './Modals/AddEquipmentModal.tsx';
import JobEquipment from './JobListDisplays/JobEquipment.tsx';
import { AddSubcontractorModal } from './Modals/AddSubcontractorModal.tsx';
import JobSubcontractors from './JobListDisplays/JobSubcontractors.tsx';
import { AddPartsModal } from './Modals/AddPartsModal.tsx';
import JobParts from './JobListDisplays/JobParts.tsx';
import { useMyPredefinedJobs } from '../../services/queries.ts';
import { DatePickerInput } from '@mantine/dates';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const CreateJob = () => {
  const { jobId } = useParams({ strict: false });
  const { user } = useAuth();
  const { myPredefinedJobs } = useMyPredefinedJobs();
  const predefinedJob = myPredefinedJobs?.find((job) => String(job.id) === jobId);

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
  const [showAlert, setShowAlert] = useState<{ str: string; color: string }>({
    str: '',
    color: 'blue',
  });

  const { data: users, isPending } = useQuery({
    queryKey: ['users'],
    queryFn: () => employeesApi.getUsers(),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (jobId && jobId !== 'new') {
      if (predefinedJob) {
        jobForm.setValues({
          customer: predefinedJob.customer,
          jobNumber: predefinedJob.jobNumber,
          createdFromJobId: predefinedJob.id,
          date: predefinedJob.date || String(new Date()),
        });
      }
    }
  }, [jobId, predefinedJob]);

  const newCreatedByUser = users?.find((storeUser) => user?.id === storeUser.id);

  const buildDateTime = (date: string | Date, time: string) => {
    return dayjs(`${date} ${time}`, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD HH:mm:ss');
  };

  const createJobMutation = useMutation({
    mutationFn: () =>
      jobsApi.utilizeJob({
        customer: jobValues.customer || '',
        jobNumber: jobValues.jobNumber || '',
        date: jobValues.date || new Date(),
        isEdit: false,
        description: predefinedJob?.description || undefined,
        location: predefinedJob?.location || undefined,
        createdFromJobId: predefinedJob?.id || undefined,
        adminCreatedById: predefinedJob?.adminCreatedById || null,
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
        links: predefinedJob?.links || [],
      }),
    onSettled: (data) => {
      if (data) {
        setShowAlert({
          str: `Job created for customer: ${jobValues.customer} that will be done by ${newCreatedByUser?.name}`,
          color: 'blue',
        });
        jobForm.reset();
      }
    },
  });

  console.log('jobValues', jobValues);
  return (
    <Stack w="100%" gap="lg" mb="md">
      {showAlert.str && (
        <Alert
          variant="light"
          color={showAlert.color}
          title={showAlert.str}
          withCloseButton
          onClick={() => setShowAlert({ str: '', color: 'blue' })}
        />
      )}
      {employeeOpened && (
        <AddEmployeesModal
          opened={employeeOpened}
          onClose={employeeClose}
          jobId={jobId !== 'new' ? Number(jobId) : 0}
          onSubmit={(data) =>
            jobForm.setFieldValue(
              'employees',
              data.map((emp) => ({ ...emp, id: 0 }))
            )
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
            jobForm.setFieldValue('subcontractors', [
              ...(jobValues.subcontractors || []),
              { ...data, id: 0 },
            ])
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
        <Title order={2}>Utilize Job {isPending && <Loader size={20} />}</Title>
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
      />
      {!!predefinedJob?.location && (
        <Text>
          <b>Location: </b>
          {predefinedJob.location}
        </Text>
      )}
      {!!predefinedJob?.links && (
        <Text>
          <b>Links to Manuals: </b>
          {predefinedJob.links.join(', ')}
        </Text>
      )}
      {/* <Textarea
        value={linksToManuals}
        label="Links to Manuals"
        placeholder="Links to the manuals (separated by commas)"
        onChange={(event) => setLinkToManual(event.currentTarget.value)}
        maw="45rem"
      /> */}
      {!!predefinedJob?.description && (
        <Text>
          <b>Description: </b>
          {predefinedJob.description}
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
        disabled={isPending || !jobValues.customer || !jobValues.jobNumber || !jobValues.date}
        variant="filled"
        onClick={() => createJobMutation.mutate()}
        w="20rem"
      >
        Create Job
      </Button>
    </Stack>
  );
};

export default CreateJob;

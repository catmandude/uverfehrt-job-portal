import {
  Input,
  Title,
  NativeSelect,
  Textarea,
  Button,
  Group,
  Loader,
  Stack,
  Space,
  FileInput,
  Modal,
  Table,
  Text,
  ScrollArea,
} from '@mantine/core';
import * as XLSX from 'xlsx';
import { IconFileSpreadsheet, IconUpload, IconDownload } from '@tabler/icons-react';
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { employeesApi, jobsApi } from '../../services/api.ts';
import { notifications } from '@mantine/notifications';

interface DataDownloadType {
  Email: string;
  Customer: string;
  'Job Name': string;
  Location: string;
  Description: string;
  Links: string | undefined;
}

const CreateJob = () => {
  const [user, setUser] = useState<string>();
  const [customer, setCustomer] = useState<string>('');
  const [jobNumber, setJobNumber] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [linksToManuals, setLinkToManual] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [readyJobs, setReadyJobs] = useState<
    {
      user_id: number;
      userName: string;
      customer: string;
      jobNumber: string;
      location: string;
      description: string;
      links: string[];
    }[]
  >([]);
  const [modalOpened, setModalOpened] = useState(false);
  const [isUploadingBulk, setIsUploadingBulk] = useState(false);

  const { data: users, isPending } = useQuery({
    queryKey: ['users'],
    queryFn: () => employeesApi.getUsers(),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  const newCreatedByUser = users?.find(
    (storeUser) => user == `${storeUser.email} (${storeUser.name || 'None'})`
  );

  const createJobMutation = useMutation({
    mutationFn: () =>
      jobsApi.createNewJobForUser({
        createdById: newCreatedByUser?.id,
        customer,
        jobNumber,
        location,
        description,
        links: linksToManuals.split(',').map((link) => link.trim()),
        createdAt: new Date(),
        isEdit: false,
        date: new Date(),
        employees: [],
        subcontractors: [],
        equipment: [],
        drivers: [],
        parts: [],
      }),
    onSettled: (data) => {
      if (data) {
        notifications.show({
          title: 'Job Submitted',
          message: `Job submitted for customer: ${customer} that will be done by ${newCreatedByUser?.name}`,
          color: 'blue',
        });
        setLocation('');
        setCustomer('');
        setJobNumber('');
        setDescription('');
        setUser('');
        setLinkToManual('');
      }
    },
  });

  const displayUsers = [
    '',
    ...(users ? users.map((user) => `${user.email} (${user.name || 'None'})`) : []),
  ];

  const saveDataToState = (data: DataDownloadType[]) => {
    const processedJobs = data
      .filter(
        (single: DataDownloadType) =>
          single['Email'] &&
          single['Customer'] &&
          single['Job Name'] &&
          single['Location'] &&
          single['Description']
      )
      .map((single: DataDownloadType) => {
        const foundUser = users?.find((storeUser) => single['Email'] === storeUser.email);
        const links = (single?.['Links'] || '')
          .split(',')
          .map((link) => link.trim())
          .filter((link) => link.length > 0);
        return {
          user_id: foundUser?.id || 0,
          userName: foundUser?.name || single['Email'],
          customer: single['Customer'],
          jobNumber: single['Job Name'],
          location: single['Location'],
          description: single['Description'],
          links: links,
        };
      })
      .filter((single) => single.user_id > 0);
    
    setReadyJobs(processedJobs);
    if (processedJobs.length > 0) {
      setModalOpened(true);
    } else {
      notifications.show({
        title: 'No Valid Jobs',
        message: 'No jobs could be processed from the file. Please check the format and user emails.',
        color: 'red',
      });
    }
  };

  const sendBulkJobs = async () => {
    if (readyJobs.length === 0) return;
    
    try {
      setIsUploadingBulk(true);
      let successCount = 0;
      let failureCount = 0;
      
      for (const single of readyJobs) {
        try {
          await jobsApi.createNewJobForUser({
            createdById: single.user_id,
            customer: single.customer,
            jobNumber: single.jobNumber,
            location: single.location,
            description: single.description,
            links: single.links,
            createdAt: new Date(),
            isEdit: false,
            date: new Date(),
            employees: [],
            subcontractors: [],
            equipment: [],
            drivers: [],
            parts: [],
          });
          successCount++;
        } catch (err) {
          failureCount++;
          console.error('Error creating job:', single.jobNumber, err);
        }
      }
      
      setReadyJobs([]);
      setModalOpened(false);
      setUploadedFile(null);
      setIsUploadingBulk(false);
      
      if (successCount > 0) {
        notifications.show({
          title: 'Jobs Created',
          message: `Successfully created ${successCount} job(s).${failureCount > 0 ? ` ${failureCount} job(s) failed.` : ''}`,
          color: successCount === readyJobs.length ? 'blue' : 'yellow',
        });
      } else {
        notifications.show({
          title: 'Upload Failed',
          message: 'All jobs failed to create. Please check the data and try again.',
          color: 'red',
        });
      }
    } catch (err) {
      setIsUploadingBulk(false);
      notifications.show({
        title: 'Error',
        message: 'There was an error creating jobs. Please try again.',
        color: 'red',
      });
    }
  };

  const handleUpload = async (file: File | null) => {
    if (!file) {
      setUploadedFile(null);
      setReadyJobs([]);
      return;
    }
    
    setUploadedFile(file);
    const reader = new FileReader();
    const rABS = !!reader.readAsBinaryString;
    
    reader.onload = async (e) => {
      try {
        const bstr = e.target?.result;
        const wb = XLSX.read(bstr, { type: rABS ? 'binary' : 'array' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data: DataDownloadType[] = XLSX.utils.sheet_to_json(ws);
        
        console.log('Parsed data:', data);
        saveDataToState(data);
      } catch (error) {
        console.error('Error parsing file:', error);
        notifications.show({
          title: 'Upload Error',
          message: 'Failed to parse the Excel file. Please check the format.',
          color: 'red',
        });
        setUploadedFile(null);
      }
    };
    
    if (rABS) reader.readAsBinaryString(file);
    else reader.readAsArrayBuffer(file);
  };

  const downloadTemplate = () => {
    // Create example template data
    const templateData = [
      {
        Email: 'user@example.com',
        Customer: 'Example Customer',
        'Job Name': 'SO-2024-001',
        Location: '123 Main St, City, State ZIP',
        Description: 'Description of work to be performed',
        Links: 'https://example.com/manual1.pdf, https://example.com/manual2.pdf',
      },
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(templateData);

    // Set column widths
    ws['!cols'] = [
      { wch: 25 }, // Email
      { wch: 20 }, // Customer
      { wch: 15 }, // Job Name
      { wch: 35 }, // Location
      { wch: 50 }, // Description
      { wch: 40 }, // Links
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Jobs');
    XLSX.writeFile(wb, 'job-upload-template.xlsx');

    notifications.show({
      title: 'Template Downloaded',
      message: 'The job upload template has been downloaded to your computer.',
      color: 'blue',
    });
  };

  return (
    <Stack w="100%" gap="lg" mb="md">
      <Group justify="space-between" align="flex-start">
        <Title order={2}>Create New Job {isPending && <Loader size={20} />}</Title>
        <Group gap="xs">
          <Button
            variant="light"
            leftSection={<IconDownload size={18} />}
            onClick={downloadTemplate}
          >
            Download Template
          </Button>
          <FileInput
            onChange={handleUpload}
            leftSection={<IconFileSpreadsheet size={18} />}
            placeholder="Upload bulk jobs (.xlsx)"
            leftSectionPointerEvents="none"
            accept=".xlsx,.xls"
            clearable
            value={uploadedFile}
            w="20rem"
          />
        </Group>
      </Group>

      <Modal
        opened={modalOpened}
        onClose={() => {
          setModalOpened(false);
          setReadyJobs([]);
          setUploadedFile(null);
        }}
        title="Preview Jobs to Create"
        size="xl"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            {readyJobs.length} job(s) ready to create. Review the details below:
          </Text>
          <ScrollArea h={400}>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>User</Table.Th>
                  <Table.Th>Customer</Table.Th>
                  <Table.Th>Job Name</Table.Th>
                  <Table.Th>Location</Table.Th>
                  <Table.Th>Description</Table.Th>
                  <Table.Th>Links</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {readyJobs.map((job, index) => (
                  <Table.Tr key={index}>
                    <Table.Td>{job.userName}</Table.Td>
                    <Table.Td>{job.customer}</Table.Td>
                    <Table.Td>{job.jobNumber}</Table.Td>
                    <Table.Td>{job.location}</Table.Td>
                    <Table.Td>
                      <Text lineClamp={2} size="sm">
                        {job.description}
                      </Text>
                    </Table.Td>
                    <Table.Td>{job.links.length > 0 ? job.links.length : 'None'}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
          <Group justify="flex-end" gap="sm">
            <Button
              variant="default"
              onClick={() => {
                setModalOpened(false);
                setReadyJobs([]);
                setUploadedFile(null);
              }}
              disabled={isUploadingBulk}
            >
              Cancel
            </Button>
            <Button
              leftSection={<IconUpload size={18} />}
              onClick={sendBulkJobs}
              loading={isUploadingBulk}
            >
              Create {readyJobs.length} Job{readyJobs.length !== 1 ? 's' : ''}
            </Button>
          </Group>
        </Stack>
      </Modal>
      <NativeSelect
        onChange={(event) => setUser(event.currentTarget.value)}
        label="User"
        value={user}
        data={displayUsers}
        maw="30rem"
      />
      <Input.Wrapper label="Customer">
        <Input
          value={customer}
          placeholder=""
          onChange={(event) => setCustomer(event.currentTarget.value)}
          maw="35rem"
        />
      </Input.Wrapper>
      <Input.Wrapper label="Job Name / Sales Order #">
        <Input
          value={jobNumber}
          placeholder=""
          onChange={(event) => setJobNumber(event.currentTarget.value)}
          maw="35rem"
        />
      </Input.Wrapper>
      <Input.Wrapper label="Location">
        <Input
          value={location}
          placeholder=""
          onChange={(event) => setLocation(event.currentTarget.value)}
          maw="45rem"
        />
      </Input.Wrapper>
      <Textarea
        value={linksToManuals}
        label="Links to Manuals"
        placeholder="Links to the manuals (separated by commas)"
        onChange={(event) => setLinkToManual(event.currentTarget.value)}
        maw="45rem"
      />
      <Textarea
        value={description}
        label="Description of Work"
        placeholder="Describing the work to be done"
        onChange={(event) => setDescription(event.currentTarget.value)}
        maw="45rem"
      />
      <Space h="md" />
      <Button
        disabled={isPending || !customer || !jobNumber || !description}
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

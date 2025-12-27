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
} from '@mantine/core';
// import * as XLSX from 'xlsx';
// @ts-ignore
import Papa from 'papaparse';
// import { IconFileCv } from '@tabler/icons-react';
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { employeesApi, jobsApi } from '../../services/api.ts';
import { notifications } from '@mantine/notifications';
// import temp from '../assets/template.xlsx'

// interface DataDownloadType {
//   Email: string;
//   Customer: string;
//   'Job Name': string;
//   Location: string;
//   Description: string;
//   Links: string | undefined;
// }

// const shouldBeHeaders = [
//   "User",
//   "Email",
//   "Customer",
//   "Job Name",
//   "Location",
//   "Description",
//   "Links",
// ];

const CreateJob = () => {
  const [user, setUser] = useState<string>();
  const [customer, setCustomer] = useState<string>('');
  const [jobNumber, setJobNumber] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [linksToManuals, setLinkToManual] = useState<string>('');
  // const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  // const [readyJobs, setReadyJobs] = useState<
  //   | {
  //       user_id: string;
  //       customer: string;
  //       jobNumber: string;
  //       location: string;
  //       description: string;
  //       links: string[];
  //     }[]
  //   | null
  // >(null);

  const { data: users, isPending } = useQuery({
    queryKey: ['users'],
    queryFn: () => employeesApi.getUsers(),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
  console.log('users', users);

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
        parts: []
      }),
    onSettled: (data) => {
      if (data) {
        notifications.show({
          title: 'Job Created',
          message: `Job created for customer: ${customer} that will be done by ${newCreatedByUser?.name}`,
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

  // const saveDataToState = (data: string[][]) => {
  //   const sendEm = data
  //     .filter(
  //       // @ts-ignore
  //       (single: DataDownloadType) =>
  //         single['Email'] &&
  //         single['Customer'] &&
  //         single['Job Name'] &&
  //         single['Location'] &&
  //         single['Description']
  //     ) // @ts-ignore
  //     .map((single: DataDownloadType) => {
  //       const newCreatedByUser = users?.find((storeUser) => single['Email'] === storeUser.email);
  //       const links = (single?.['Links'] || '').split(',').map((link) => link.trim());
  //       return {
  //         user_id: newCreatedByUser?.id,
  //         customer: single['Customer'],
  //         jobNumber: single['Job Name'],
  //         location: single['Location'],
  //         description: single['Description'],
  //         links: links,
  //       };
  //     })
  //     .filter((single) => single.user_id);
  //   // @ts-ignore
  //   setReadyJobs(sendEm);
  // };

  // const sendData = async () => {
  //   if (readyJobs) {
  //     try {
  //       setLoading(true);
  //       for(const single of readyJobs) {
  //         await createNewJobForUser({
  //           createdById: single.user_id,
  //           customer: single.customer,
  //           jobNumber: single.jobNumber,
  //           location: single.location,
  //           description: single.description,
  //           links: single.links,
  //           createdAt: new Date(),
  //           isEdit: false,
  //           date: new Date(),
  //         })
  //       }
  //       setReadyJobs(null);
  //       setShowAlert({
  //         str: `Jobs created successfully! Check the orders page to see them.`,
  //         color: "blue",
  //       });
  //       setLoading(false);
  //       setTimeout(() => {
  //         setShowAlert({
  //           str: "",
  //           color: "blue",
  //         });
  //       }, 5000);
  //     } catch (err) {
  //       setLoading(false);
  //       setShowAlert({
  //         str: `There was an error. Refresh and try again.`,
  //         color: "red",
  //       });
  //     }
  //   }
  // };

  // const handleUpload = async (file: any) => {
  //   if (file) {
  //     setUploadedFile(file);
  //     const reader = new FileReader();
  //     const rABS = !!reader.readAsBinaryString;
  //     let data: string[][] = [];
  //     reader.onload = async (e) => {
  //       const bstr = e.target?.result;
  //       const wb = XLSX.read(bstr, { type: rABS ? 'binary' : 'array' });
  //       const wsname = wb.SheetNames[0];
  //       const ws = wb.Sheets[wsname];
  //       data = XLSX.utils.sheet_to_json(ws);
  //       console.log('data', data);
  //       saveDataToState(data);
  //     };
  //     if (rABS) reader.readAsBinaryString(file);
  //     else reader.readAsArrayBuffer(file);
  //   }
  //   setUploadedFile(null);
  // };

  // const icon = <IconFileCv style={{ width: 18, height: 18 }} stroke={1.5} />;

  return (
    <Stack w="100%" gap="lg" mb="md">
      <Group justify="space-between">
        <Title order={2}>Create New Job {isPending && <Loader size={20} />}</Title>
        {/* <div className={styles.HeaderCSV}>
              {!loading ? (
                <>
                  {readyJobs ? (
                    <Button disabled={loading || !readyJobs} onClick={sendData}>
                      Save Jobs
                    </Button>
                  ) : (
                    <FileInput
                      onChange={(file) => handleUpload(file)}
                      leftSection={icon}
                      label="Job Upload"
                      placeholder="Click to upload"
                      leftSectionPointerEvents="none"
                      accept=".xlsx"
                      clearable
                      value={uploadedFile}
                    />
                  )}
                </>
              ) : (
                <Loader />
              )}
            </div> */}
      </Group>
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

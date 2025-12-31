import {
  Group,
  List,
  Title,
  Container,
  Grid,
  Accordion,
  SegmentedControl,
  Loader,
  Button,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useState } from 'react';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import type { ExistingJobType } from '../../types.ts';
import { useExistingJobs } from '../../services/queries.ts';

dayjs.extend(customParseFormat);

const options = [
  { label: 'All Complete', value: 'all' },
  { label: 'Admin Incomplete', value: 'admin_incomplete' },
];

const Home = () => {
  const [selectedOrders, setSelectedOrders] = useState(options[0].value);
  const [isExporting, setIsExporting] = useState(false);
  const [exportDate, setExportDate] = useState<string | null>(String(new Date()));

  const { historyJobs, historyLoading } = useExistingJobs(selectedOrders);

  const setOrderType = async (orderType: string) => {
    setSelectedOrders(orderType);
  };

  const handleExportCSV = async () => {
    if (!exportDate) {
      alert('Please select a date');
      return;
    }
    setIsExporting(true);
    try {
      const { jobsApi } = await import('../../services/api');
      const formattedDate = dayjs(exportDate).format('YYYY-MM-DD');
      const blob = await jobsApi.exportDailyReport(formattedDate);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `daily-report-${formattedDate}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export CSV:', error);
      alert('Failed to export CSV. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // const todayDate = new Date().toISOString().slice(0, 10);
  // const downloadName = `Monthly(${selectedOrders}) - ${todayDate}`;

  if (historyLoading) {
    return (
      <Container>
        <Loader />
      </Container>
    );
  }

  return (
    <Container>
      <Grid>
        <Grid.Col span={12}>
          <Grid>
            <Grid.Col span={11}>
              <Group justify="space-between" style={{ marginBottom: '1rem' }}>
                <Title order={2}>Recent Orders</Title>
                <Group>
                  <SegmentedControl value={selectedOrders} onChange={setOrderType} data={options} />
                  <DatePickerInput
                    value={exportDate}
                    onChange={(value) => setExportDate(value)}
                    placeholder="Select date"
                    clearable
                    style={{ width: 200 }}
                    firstDayOfWeek={0}
                  />
                  <Button onClick={handleExportCSV} loading={isExporting}>
                    Export CSV
                  </Button>
                </Group>

                {/* <Button>
                  <CSVLink
                    style={{ color: "white" }}
                    headers={csvHeaders}
                    data={csvData}
                    filename={downloadName}
                  >
                    Download CSV
                  </CSVLink>
                </Button> */}
              </Group>
            </Grid.Col>
            <Grid.Col span={1}>{historyLoading && <Loader />}</Grid.Col>
          </Grid>
          <Accordion>
            {historyJobs?.map((job: ExistingJobType) => (
              <Accordion.Item
                key={job.id}
                value={`${job.customer} - ${job.jobNumber} (${dayjs(job.date).format(
                  'MM/DD/YYYY'
                )})`}
              >
                <Accordion.Control>
                  {`${job.customer} - ${job.jobNumber} (${selectedOrders === 'all' ? 'Completed' : 'Created'}: ${dayjs(selectedOrders === 'all' ? job.date : job.createdAt).format('MM/DD/YYYY')})`}
                </Accordion.Control>
                <Accordion.Panel>
                  <Grid>
                    <Grid.Col span={6}>
                      <b>Work Done By:</b>{' '}
                      {/* {
                        users.find(
                          (user) => user.user_id === job.createdById
                        )?.name
                      } */}
                    </Grid.Col>
                  </Grid>
                  <Grid>
                    <Grid.Col span={6}>
                      <b>Customer:</b> {job.customer}
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <b>Sales Order # / Job Name:</b> {job.jobNumber}
                    </Grid.Col>
                  </Grid>
                  <Grid>
                    <Grid.Col span={6}>
                      <b>Date:</b> {dayjs(job.date).format('MM/DD/YYYY')}
                    </Grid.Col>
                  </Grid>
                  <Grid>
                    <Grid.Col span={6}>
                      <b>Description:</b> {job.description}
                    </Grid.Col>
                  </Grid>
                  <Grid>
                    <Grid.Col span={6}>
                      <b>Location:</b> {job.location}
                    </Grid.Col>
                  </Grid>
                  <Grid>
                    <Grid.Col span={6}>
                      <b>Links:</b> {job.links?.join(', ')}
                    </Grid.Col>
                  </Grid>
                  {!job.isEdit && (
                    <>
                      <div style={{ background: 'lightblue', padding: '1rem' }}>
                        <Grid>
                          <Grid.Col span={6}>Employees:</Grid.Col>
                        </Grid>
                        <Grid>
                          <Grid.Col span={12}>
                            <List>
                              {job.employees.map((emp) => {
                                const start = dayjs(emp.startTime, 'HH:mm');
                                const end = dayjs(emp.endTime, 'HH:mm');
                                const diffHours = end.diff(start, 'hour', true).toFixed(2);
                                return (
                                  <List.Item key={emp.id}>
                                    <b>Persons:</b> {emp.employee.firstName} {emp.employee.lastName}{' '}
                                    <b>Hours Per man:</b> {diffHours} <b>Desc:</b> {emp.description}
                                  </List.Item>
                                );
                              })}
                            </List>
                          </Grid.Col>
                        </Grid>
                      </div>
                      <div style={{ backgroundColor: 'cyan', padding: '1rem' }}>
                        <Grid>
                          <Grid.Col span={6}>Drivers:</Grid.Col>
                        </Grid>
                        <Grid>
                          <Grid.Col span={12}>
                            <List>
                              {Object.values(job.drivers || {}).map((emp) => (
                                <List.Item key={emp.id}>
                                  <b>Driver:</b> {emp.driver.firstName} {emp.driver.lastName}{' '}
                                  <b>Vehicle:</b> {emp.vehicle.name}
                                </List.Item>
                              ))}
                            </List>
                          </Grid.Col>
                        </Grid>
                      </div>
                      <div style={{ backgroundColor: 'lavender', padding: '1rem' }}>
                        <Grid>
                          <Grid.Col span={6}>Equipment:</Grid.Col>
                        </Grid>
                        <Grid>
                          <Grid.Col span={12}>
                            <List>
                              {Object.values(job.equipment || {}).map((emp) => (
                                <List.Item key={emp.id}>
                                  <b>Equipment:</b> {emp.equipment.name} <b>Hours:</b> {emp.hours}
                                </List.Item>
                              ))}
                            </List>
                          </Grid.Col>
                        </Grid>
                      </div>
                      <div
                        style={{
                          backgroundColor: 'lightcoral',
                          padding: '1rem',
                        }}
                      >
                        <Grid>
                          <Grid.Col span={6}>Subcontractors:</Grid.Col>
                        </Grid>
                        <Grid>
                          <Grid.Col span={12}>
                            <List>
                              {job.subcontractors.map((emp) => (
                                <List.Item key={emp.id}>
                                  <b>Subcontractor:</b> {emp.subcontractor.name}{' '}
                                  <b>Hours Per Man:</b> {emp.hoursPerMan}
                                  <b>Number Per Man:</b> {emp.numberOfMen}
                                </List.Item>
                              ))}
                            </List>
                          </Grid.Col>
                        </Grid>
                      </div>
                      <div
                        style={{
                          backgroundColor: 'lightpink',
                          padding: '1rem',
                        }}
                      >
                        <Grid>
                          <Grid.Col span={6}>Work Needed:</Grid.Col>
                        </Grid>
                        <Grid>
                          <Grid.Col span={12}>
                            {Object.values(job.parts).map((part) => (
                              <div key={part.id}>
                                <b>Description:</b> {part.description}{' '}
                                <div>
                                  <b>Items:</b>
                                </div>
                              </div>
                            ))}
                          </Grid.Col>
                        </Grid>
                      </div>
                    </>
                  )}
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        </Grid.Col>
      </Grid>
    </Container>
  );
};

export default Home;

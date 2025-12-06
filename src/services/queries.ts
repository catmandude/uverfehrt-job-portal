import { useQuery } from '@tanstack/react-query';
import { employeesApi, jobsApi } from './api';

export const useUsers = () => {
  const { data: users, isPending } = useQuery({
    queryKey: ['users'],
    queryFn: () => employeesApi.getUsers(),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
  return { users, isPending };
};

export const useEmployees = () => {
  const { data: employees, isPending: employeesLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeesApi.getEmployees(),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
  return { employees, employeesLoading };
};

export const useVehicles = () => {
  const { data: vehicles, isPending: vehiclesLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => employeesApi.getVehicles(),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
  return { vehicles, vehiclesLoading };
};

export const useEquipment = () => {
  const { data: equipment, isPending: equipmentLoading } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => employeesApi.getEquipment(),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
  return { equipment, equipmentLoading };
};

export const useSubcontractors = () => {
  const { data: subcontractors, isPending: subcontractorsLoading } = useQuery({
    queryKey: ['subcontractors'],
    queryFn: () => employeesApi.getSubcontractors(),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
  return { subcontractors, subcontractorsLoading };
};

export const useMyPredefinedJobs = () => {
  const { data: myPredefinedJobs, isPending: myPredefinedJobsLoading } = useQuery({
    queryKey: ['my-predefined-jobs'],
    queryFn: () => jobsApi.getMyJobs(),
  });
  return { myPredefinedJobs, myPredefinedJobsLoading };
};

export const useExistingJobs = (selectedOrders: string) => {
  const { data: historyJobs, isPending: historyLoading } = useQuery({
    queryKey: ['history', selectedOrders],
    queryFn: () => jobsApi.getAllExistingJobs(selectedOrders), // Set this up for both complete and incomplete
  });
  return { historyJobs, historyLoading };
};

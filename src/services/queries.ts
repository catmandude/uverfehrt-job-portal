import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { firstName: string; lastName: string }) => 
      employeesApi.createEmployee(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => employeesApi.deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

export const useCreateVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string }) => 
      employeesApi.createVehicle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
};

export const useDeleteVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => employeesApi.deleteVehicle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
};

export const useCreateSubcontractor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string }) => 
      employeesApi.createSubcontractor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subcontractors'] });
    },
  });
};

export const useDeleteSubcontractor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => employeesApi.deleteSubcontractor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subcontractors'] });
    },
  });
};

export const useCreateEquipment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string }) => 
      employeesApi.createEquipment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });
};

export const useDeleteEquipment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => employeesApi.deleteEquipment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });
};

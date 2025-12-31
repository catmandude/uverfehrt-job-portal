import axios from 'axios';
import type {
  EmployeeType,
  EquipmentType,
  ExistingJobType,
  JobType,
  LoginCredentials,
  LoginResponse,
  PredefinedJobType,
  SubcontractorType,
  User,
  VehicleType,
} from '../types';

// -----------------------------
// Axios instance
// -----------------------------
//'http://localhost:8000'
//'https://unverfehrt-fast-1065632368040.us-central1.run.app/',
const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL || 'https://unverfehrt-fast-1065632368040.us-central1.run.app',
  headers: {
    'Content-Type': 'application/json',
  },
});

let logoutHandler: (() => void) | null = null;

export const registerLogoutHandler = (fn: () => void) => {
  logoutHandler = fn;
};
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error.response?.status;
    // ---- AUTO LOGOUT ----
    if (status === 401) {
      if (logoutHandler) logoutHandler();
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

// -----------------------------
// Shared logout helper
// -----------------------------
function logoutAndRedirect() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  window.location.href = '/login';
}

// -----------------------------
// API Wrapper Functions
// -----------------------------
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/login', credentials);

    // Store both tokens
    localStorage.setItem('authToken', response.data.idToken);
    localStorage.setItem('refreshToken', response.data.refreshToken);

    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/logout');
    logoutAndRedirect();
  },

  verifyToken: async (): Promise<LoginResponse['user']> => {
    const response = await api.get<LoginResponse['user']>('/verify');
    return response.data;
  },
};

export const jobsApi = {
  getJobById: async (id: number | undefined): Promise<JobType> => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },
  getMyClosedJobs: async (): Promise<JobType[]> => {
    const response = await api.get('/my_jobs/closed');
    return response.data;
  },
  getMyOpenJobs: async (): Promise<PredefinedJobType[]> => {
    const response = await api.get('/my_jobs/open');
    return response.data;
  },
  createNewJobForUser: async (data: PredefinedJobType) => {
    const response = await api.post('/admin_jobs', data);
    return response.data;
  },
  utilizeJob: async (data: JobType) => {
    const response = await api.post('/jobs', data);
    return response.data;
  },
  getAllExistingJobs: async (orderType: string): Promise<ExistingJobType[]> => {
    const res = await api.get(`/jobs?selected=${orderType}`);
    return res.data;
  },
  exportDailyReport: async (date: string): Promise<Blob> => {
    const response = await api.get<Blob>(`/daily-report?report_date=${date}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export const employeesApi = {
  getUsers: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },

  getEmployees: async (): Promise<EmployeeType[]> => {
    const response = await api.get('/employees');
    return response.data;
  },

  createEmployee: async (data: { firstName: string; lastName: string }): Promise<EmployeeType> => {
    const response = await api.post('/employees', data);
    return response.data;
  },

  deleteEmployee: async (id: number): Promise<void> => {
    await api.delete(`/employees/${id}`);
  },

  getVehicles: async (): Promise<VehicleType[]> => {
    const response = await api.get('/vehicles');
    return response.data;
  },

  createVehicle: async (data: { name: string }): Promise<VehicleType> => {
    const response = await api.post('/vehicles', data);
    return response.data;
  },

  deleteVehicle: async (id: number): Promise<void> => {
    await api.delete(`/vehicles/${id}`);
  },

  getEquipment: async (): Promise<EquipmentType[]> => {
    const response = await api.get('/equipment');
    return response.data;
  },

  createEquipment: async (data: { name: string }): Promise<EquipmentType> => {
    const response = await api.post('/equipment', data);
    return response.data;
  },

  deleteEquipment: async (id: number): Promise<void> => {
    await api.delete(`/equipment/${id}`);
  },

  getSubcontractors: async (): Promise<SubcontractorType[]> => {
    const response = await api.get('/subcontractors');
    return response.data;
  },

  createSubcontractor: async (data: { name: string }): Promise<SubcontractorType> => {
    const response = await api.post('/subcontractors', data);
    return response.data;
  },

  deleteSubcontractor: async (id: number): Promise<void> => {
    await api.delete(`/subcontractors/${id}`);
  },
};

export default api;

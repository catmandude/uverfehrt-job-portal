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
  baseURL: import.meta.env.VITE_API_URL || 'https://unverfehrt-fast-1065632368040.us-central1.run.app/',
  headers: { 'Content-Type': 'application/json' },
});

// -----------------------------
// Attach access token to requests
// -----------------------------
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// -----------------------------
// Refresh Logic
// -----------------------------
let isRefreshing = false;
let refreshQueue: ((token: string) => void)[] = [];

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const original = error.config;

    // Only intercept 401s once per request
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        console.log('No refresh token → logging out');
        logoutAndRedirect();
        return;
      }

      // If NOT refreshing, start refresh
      if (!isRefreshing) {
        isRefreshing = true;

        try {
          // Use RAW axios to avoid interceptors & expired token headers
          const refreshResponse = await axios.post(
            `${import.meta.env.VITE_API_URL}/reauthenticate`,
            { refresh_token: refreshToken },
            { headers: { 'Content-Type': 'application/json' } }
          );

          const newToken = refreshResponse.data.accessToken;
          localStorage.setItem('authToken', newToken);

          // Resolve queued requests
          refreshQueue.forEach((cb) => cb(newToken));
          refreshQueue = [];
        } catch (refreshErr) {
          console.error('Refresh failed:', refreshErr);
          logoutAndRedirect();
          return;
        } finally {
          isRefreshing = false;
        }
      }

      // Queue requests while refreshing
      return new Promise((resolve) => {
        refreshQueue.push((newToken: string) => {
          original.headers.Authorization = `Bearer ${newToken}`;
          resolve(api(original)); // re-run original request
        });
      });
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
  getMyJobs: async (): Promise<PredefinedJobType[]> => {
    const response = await api.get('/jobs_predefined');
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
  getVehicles: async (): Promise<VehicleType[]> => {
    const response = await api.get('/vehicles');
    return response.data;
  },
  getEquipment: async (): Promise<EquipmentType[]> => {
    const response = await api.get('/equipment');
    return response.data;
  },
  getSubcontractors: async (): Promise<SubcontractorType[]> => {
    const response = await api.get('/subcontractors');
    return response.data;
  },
};

export default api;

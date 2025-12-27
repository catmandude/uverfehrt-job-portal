export type LoginResponse = {
  localId: string;
  email: string;
  displayName: string;
  idToken: string;
  registered: boolean;
  refreshToken: string;
  expiresIn: string;
  user: User;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type User = {
  id: number;
  role: string;
  legacyId: string | null;
  uid: string;
  name: string;
  email: string;
  isActive: boolean;
};

export type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
};

export type PredefinedJobType = {
  createdAt: string | Date;
  customer: string;
  jobNumber: string;
  location: string;
  isEdit: boolean;
  description: string;
  createdById: number | undefined;
  date: string | Date;
  links: string[];
  id?: number;
  adminCreatedById?: number | null;
  employees: EmployeeJobType[];
  subcontractors: SubcontractorJobType[];
  equipment: EquipmentJobType[];
  drivers: DriverVehicleJobType[];
  parts: PartJobType[];
};

export interface EmployeeType {
  firstName: string;
  lastName: string;
  id: number;
  name: string;
  legacyId: string;
}

export interface EquipmentType {
  name: string;
  id: number;
  legacyId: string;
}

export interface SubcontractorType {
  subcontractor: React.ReactNode;
  name: string;
  legacyId: string;
  id: number;
}

export interface VehicleType {
  name: string;
  id: number;
  legacyId: string;
}

export interface SubcontractorType {
  name: string;
  legacyId: string;
  id: number;
}

export type EmployeeJobType = {
  groupId: string;
  jobId: number;
  employeeId: number;
  startTime: string;
  endTime: string;
  description: string;
};

export type SubcontractorJobType = {
  jobId: number;
  subContractorId: number;
  hoursPerMan: number;
  numberOfMen: number;
  description: string | null;
};

export type EquipmentJobType = {
  id: number;
  jobId: number;
  equipmentId: number;
  hours: number;
};

export type DriverVehicleJobType = {
  id?: number;
  jobId: number;
  driverId: number;
  vehicleId: number;
};

export type PartJobType = {
  id: number;
  jobId: number;
  quantity: number;
  description: string;
  partNumber: string;
};

export type JobType = {
  id?: number;
  createdFromJobId?: number | null;
  adminCreatedById?: number | null;
  createdAt?: string | Date;
  customer: string;
  jobNumber: string;
  location?: string;
  isEdit: boolean;
  description?: string;
  createdById: number | undefined;
  date: string | Date;
  links: string[];
  employees: EmployeeJobType[];
  subcontractors: SubcontractorJobType[];
  equipment: EquipmentJobType[];
  drivers: DriverVehicleJobType[];
  parts: PartJobType[];
};

export type ExistingEmployeeJobType = {
  id: number;
  groupId: string;
  jobId: number;
  startTime: string;
  endTime: string;
  description: string;
  employee: {
    id: number;
    firstName: string;
    lastName: string;
  }
};

export type ExistingEquipmentJobType = {
  id: number;
  jobId: number;
  equipment: {
    id: number;
    name: string;
  }
  hours: number;
};

export type ExistingSubcontractorJobType = {
  id: number;
  jobId: number;
  subcontractor: {
    id: number;
    name: string;
  }
  hoursPerMan: number;
  numberOfMen: number;
  description: string | null;
};

export type ExistingDriverVehicleJobType = {
  id: number;
  jobId: number;
  driver: {
    id: number;
    firstName: string;
    lastName: string;
  };
  vehicle: {
    id: number;
    name: string;
  };
};

export type ExistingPartJobType = {
  id: number;
  jobId: number;
  partId: number;
  quantity: number;
  description: string;
  partNumber: string;
};


export type ExistingJobType = {
  id: number;
  createdFromJobId?: number | null;
  adminCreatedById?: number | null;
  createdAt: string | Date;
  customer: string;
  jobNumber: string;
  location: string;
  isEdit: boolean;
  description: string;
  createdById: number;
  date: string;
  links: string[];
  employees: ExistingEmployeeJobType[];
  subcontractors: ExistingSubcontractorJobType[];
  equipment: ExistingEquipmentJobType[];
  drivers: ExistingDriverVehicleJobType[];
  parts: ExistingPartJobType[];
}

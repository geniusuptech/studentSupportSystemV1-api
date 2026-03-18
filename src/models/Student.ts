export interface Student {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  studentId: string; // Student Number e.g. ST2026001
  idNumber?: string;
  university?: string;
  program?: string;
  major?: string;
  minor?: string;
  year?: string;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
  gpa: number;
  risk: 'Safe' | 'At Risk' | 'Critical';
  status: 'Active' | 'Inactive';
  lastActivity?: string;
  enrollmentDate?: string;
  avatarUrl?: string;
  assignedCoordinatorId?: string;
  nativeLanguage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentStatistics {
  totalStudents: number;
  riskLevels: {
    safe: number;
    atRisk: number;
    critical: number;
  };
  averageGPA: number;
  universities: {
    [key: string]: number;
  };
  programs: {
    [key: string]: number;
  };
  yearDistribution: {
    [key: string]: number;
  };
}
export interface Student {
  StudentID: number;
  StudentName: string;
  StudentNumber: string;
  UniversityID: number;
  UniversityName: string;
  ProgramID: number;
  ProgramName: string;
  YearOfStudy: number;
  GPA: number;
  RiskLevel: 'Safe' | 'At Risk' | 'Critical';
  ContactEmail: string;
  ContactPhone?: string;
  EmergencyContact?: string;
  EmergencyPhone?: string;
  DateEnrolled: string;
  LastLoginDate?: string;
  IsActive: boolean;
  CreatedAt: string;
  UpdatedAt: string;
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
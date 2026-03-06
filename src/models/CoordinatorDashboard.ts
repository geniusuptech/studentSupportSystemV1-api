
export interface CoordinatorDashboard {
  totalStudents: number;
  averageGPA: number;
  activeInterventions: number;
  studentsByRisk: {
    safe: number;
    atRisk: number;
    critical: number;
  };
  filters:{
    universities: Array<{
      universityId: number;
      universityName: string;
    }>;
    programs: Array<{
      programId: number;
      programName: string;
    }>;
    studentsByRiskLevel: Array<{
      riskLevel: 'Safe' | 'At Risk' | 'Critical';
      count: number;
    }>;
  }
  studentsOverview: {
    studentId: number;
    studentName: string;
    universityName: string;
    programName: string;
    yearOfStudy: number;
    gpa: number;
    riskLevel: 'Safe' | 'At Risk' | 'Critical';
    lastLoginDate: string;
    };
  }
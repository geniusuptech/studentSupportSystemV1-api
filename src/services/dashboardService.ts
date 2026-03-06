import { 
  dashboardRepository, 
  DashboardSummary, 
  RiskDistribution, 
  Intervention,
  University,
  Program
} from '../repository/dashboardRepository';

export interface RiskLevel {
  value: string;
  label: string;
  description: string;
  color: string;
}

export class DashboardService {
  async getSummary(): Promise<DashboardSummary> {
    return dashboardRepository.getSummary();
  }

  async getRiskDistribution(): Promise<RiskDistribution> {
    return dashboardRepository.getRiskDistribution();
  }

  async getAllUniversities(): Promise<University[]> {
    return dashboardRepository.getAllUniversities();
  }

  async getAllPrograms(): Promise<Program[]> {
    return dashboardRepository.getAllPrograms();
  }

  getRiskLevels(): RiskLevel[] {
    return [
      {
        value: 'Safe',
        label: 'Safe',
        description: 'Student is performing well with no concerns',
        color: '#10B981' // green
      },
      {
        value: 'At Risk',
        label: 'At Risk',
        description: 'Student requires monitoring and preventive support',
        color: '#F59E0B' // amber/orange
      },
      {
        value: 'Critical',
        label: 'Critical',
        description: 'Student requires immediate intervention and support',
        color: '#EF4444' // red
      }
    ];
  }

  async getActiveInterventions(): Promise<Intervention[]> {
    return dashboardRepository.getActiveInterventions();
  }

  async createIntervention(data: {
    studentId: number;
    interventionType: string;
    description?: string;
    priority?: string;
    assignedTo?: string;
    notes?: string;
  }): Promise<Intervention> {
    // Validate intervention type
    const validTypes = [
      'Academic Support',
      'Counseling',
      'Peer Mentorship',
      'Financial Aid',
      'Health Services',
      'Career Guidance',
      'Other'
    ];
    
    if (!validTypes.includes(data.interventionType)) {
      throw new Error(`Invalid intervention type. Must be one of: ${validTypes.join(', ')}`);
    }

    // Validate priority
    const validPriorities = ['Low', 'Medium', 'High', 'Critical'];
    if (data.priority && !validPriorities.includes(data.priority)) {
      throw new Error(`Invalid priority. Must be one of: ${validPriorities.join(', ')}`);
    }

    return dashboardRepository.createIntervention(data);
  }

  async getStudentsForExport(): Promise<any[]> {
    return dashboardRepository.getStudentsForExport();
  }

  generateCSV(students: any[]): string {
    if (students.length === 0) {
      return '';
    }

    const headers = [
      'Student ID',
      'Student Name',
      'Student Number',
      'University',
      'Program',
      'Year of Study',
      'GPA',
      'Risk Level',
      'Contact Email',
      'Contact Phone',
      'Emergency Contact',
      'Emergency Phone',
      'Date Enrolled',
      'Last Login',
      'Active Interventions'
    ];

    const rows = students.map(s => [
      s.StudentID,
      `"${s.StudentName}"`,
      s.StudentNumber,
      `"${s.UniversityName}"`,
      `"${s.ProgramName}"`,
      s.YearOfStudy,
      s.GPA,
      s.RiskLevel,
      s.ContactEmail,
      s.ContactPhone,
      `"${s.EmergencyContact || ''}"`,
      s.EmergencyPhone || '',
      s.DateEnrolled ? new Date(s.DateEnrolled).toISOString().split('T')[0] : '',
      s.LastLoginDate ? new Date(s.LastLoginDate).toISOString().split('T')[0] : '',
      s.ActiveInterventions
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
}

export const dashboardService = new DashboardService();

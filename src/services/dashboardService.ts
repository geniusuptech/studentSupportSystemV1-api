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

  async createIntervention(data: any): Promise<Intervention> {
    return dashboardRepository.createIntervention(data);
  }

  async getStudentsForExport(): Promise<any[]> {
    // Fetch all active students for export (D1 implementation)
    return dashboardRepository.getAllStudentsForExport();
  }

  generateCSV(students: any[]): string {
    if (students.length === 0) {
      return '';
    }

    const headers = [
      'ID',
      'Name',
      'Student Number',
      'Email',
      'University',
      'Program',
      'Year',
      'GPA',
      'Risk Level',
      'Enrollment Date',
      'Last Activity'
    ];

    const rows = students.map(s => [
      s.id,
      `"${s.name}"`,
      s.student_id,
      s.email,
      `"${s.universityName}"`,
      `"${s.programName}"`,
      s.year,
      s.gpa,
      s.risk,
      s.enrollment_date,
      s.last_activity
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
}

export const dashboardService = new DashboardService();

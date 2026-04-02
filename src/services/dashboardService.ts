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

  async getUniversityByStudentId(studentId: string): Promise<University> {
    return dashboardRepository.getUniversityByStudentId(studentId);
  }

  async getAllPrograms(): Promise<Program[]> {
    return dashboardRepository.getAllPrograms();
  }

  async getProgramByStudentId(studentId: string): Promise<Program> {
    return dashboardRepository.getProgramByStudentId(studentId);
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

  async getRiskLevelByStudentId(studentId: string): Promise<RiskLevel> {
    return dashboardRepository.getRiskLevelByStudentId(studentId);
  }

  async getStudentsForDashboard(filters: any): Promise<any[]> {
    return dashboardRepository.getStudentsForDashboard(filters);
  }

  async getActiveInterventions(): Promise<Intervention[]> {
    return dashboardRepository.getActiveInterventions();
  }

  async createIntervention(data: any): Promise<Intervention> {
    return dashboardRepository.createIntervention(data);
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

  async getStudentManagementStats(): Promise<any> {
    return dashboardRepository.getStudentManagementStats();
  }

  async searchStudents(keyword: string, filters: any): Promise<any[]> {
    return dashboardRepository.searchStudents(keyword, filters);
  }

  async getStudentsForExport(filters: any = {}): Promise<any[]> {
    return dashboardRepository.getStudentsForExport(filters);
  }

  generateXLSX(students: any[]): ArrayBuffer {
    // For now, return CSV as text since we need to implement a proper XLSX library
    // In a real implementation, you'd use a library like xlsx or exceljs
    const csvData = this.generateCSV(students);
    return new TextEncoder().encode(csvData).buffer as ArrayBuffer;
  }
}

export const dashboardService = new DashboardService();

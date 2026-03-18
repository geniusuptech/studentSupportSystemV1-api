import databaseService from '../config/database';

export interface DashboardSummary {
  totalStudents: number;
  criticalStudents: number;
  averageGPA: number;
  activeInterventions: number;
}

export interface RiskDistribution {
  safe: { count: number; percentage: number };
  atRisk: { count: number; percentage: number };
  critical: { count: number; percentage: number };
  totalStudents: number;
}

export interface Intervention {
  id: string | number;
  studentId: string | number;
  studentName?: string;
  type: string;
  notes?: string;
  status: string;
  riskLevel: string;
  dateLogged: string;
  followUpDate?: string;
  origin?: string;
  isStudentRequest?: boolean;
}

export interface University {
  id: string | number;
  name: string;
  studentCount?: number;
}

export interface Program {
  id: string | number;
  name: string;
  studentCount?: number;
}

export class DashboardRepository {
  async getSummary(): Promise<DashboardSummary> {
    const studentsQuery = `SELECT COUNT(*) as total FROM Students WHERE IsActive = 1`;
    const criticalQuery = `SELECT COUNT(*) as critical FROM Students WHERE RiskLevel = 'Critical' AND IsActive = 1`;
    const gpaQuery = `SELECT AVG(GPA) as avgGPA FROM Students WHERE IsActive = 1`;
    const interventionsQuery = `SELECT COUNT(*) as active FROM SupportRequests WHERE Status IN ('Open', 'In Progress')`;

    const results = await Promise.all([
      databaseService.executeQuery(studentsQuery),
      databaseService.executeQuery(criticalQuery),
      databaseService.executeQuery(gpaQuery),
      databaseService.executeQuery(interventionsQuery)
    ]);

    return {
      totalStudents: results[0][0].total || 0,
      criticalStudents: results[1][0].critical || 0,
      averageGPA: Math.round((results[2][0].avgGPA || 0) * 100) / 100,
      activeInterventions: results[3][0].active || 0
    };
  }

  async getRiskDistribution(): Promise<RiskDistribution> {
    const query = `
      SELECT RiskLevel, COUNT(*) as Count 
      FROM Students 
      WHERE IsActive = 1 
      GROUP BY RiskLevel
    `;
    const data = await databaseService.executeQuery(query);
    
    let total = 0;
    const counts: any = { Safe: 0, 'At Risk': 0, Critical: 0 };
    
    data.forEach((row: any) => {
      counts[row.RiskLevel] = row.Count;
      total += row.Count;
    });

    return {
      safe: {
        count: counts.Safe,
        percentage: total > 0 ? Math.round((counts.Safe / total) * 100) : 0
      },
      atRisk: {
        count: counts['At Risk'],
        percentage: total > 0 ? Math.round((counts['At Risk'] / total) * 100) : 0
      },
      critical: {
        count: counts.Critical,
        percentage: total > 0 ? Math.round((counts.Critical / total) * 100) : 0
      },
      totalStudents: total
    };
  }

  async getAllUniversities(): Promise<University[]> {
    const query = `
      SELECT u.UniversityID as id, u.UniversityName as name, COUNT(s.StudentID) as studentCount
      FROM Universities u
      LEFT JOIN Students s ON u.UniversityID = s.UniversityID AND s.IsActive = 1
      GROUP BY u.UniversityID, u.UniversityName
    `;
    const data = await databaseService.executeQuery(query);
    return data;
  }

  async getAllPrograms(): Promise<Program[]> {
    const query = `
      SELECT p.ProgramID as id, p.ProgramName as name, COUNT(s.StudentID) as studentCount
      FROM Programs p
      LEFT JOIN Students s ON p.ProgramID = s.ProgramID AND s.IsActive = 1
      GROUP BY p.ProgramID, p.ProgramName
    `;
    const data = await databaseService.executeQuery(query);
    return data;
  }

  async getActiveInterventions(): Promise<Intervention[]> {
    const query = `
      SELECT sr.*, s.StudentName
      FROM SupportRequests sr
      JOIN Students s ON sr.StudentID = s.StudentID
      WHERE sr.Status IN ('Open', 'In Progress')
      ORDER BY sr.CreatedAt DESC
    `;
    const data = await databaseService.executeQuery(query);

    return data.map(i => ({
        id: i.RequestID,
        studentId: i.StudentID,
        studentName: i.StudentName,
        type: i.Title, // Mapping Title to type for compatibility
        notes: i.Notes,
        status: i.Status,
        riskLevel: i.Priority, // Mapping Priority to riskLevel for compatibility
        dateLogged: i.CreatedAt,
        origin: 'System',
        isStudentRequest: true
    }));
  }

  async createIntervention(data: any): Promise<Intervention> {
    const query = `
      INSERT INTO SupportRequests (StudentID, CategoryID, Title, Description, Priority, Status, CreatedAt)
      VALUES (@studentId, 1, @title, @notes, @priority, 'Open', CURRENT_TIMESTAMP)
      RETURNING *
    `;
    const params = {
      studentId: data.studentId,
      title: data.type || 'Intervention',
      notes: data.notes || '',
      priority: data.riskLevel || 'Medium'
    };
    
    const results = await databaseService.executeQuery(query, params);
    const i = results[0];
    
    return {
        id: i.RequestID,
        studentId: i.StudentID,
        type: i.Title,
        notes: i.Notes,
        status: i.Status,
        riskLevel: i.Priority,
        dateLogged: i.CreatedAt
    };
  }
}

export const dashboardRepository = new DashboardRepository();

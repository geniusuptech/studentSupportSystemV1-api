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
  InterventionID: number;
  StudentID: number;
  StudentName?: string;
  InterventionType: string;
  Description: string | null;
  Status: string;
  Priority: string;
  AssignedTo: string | null;
  Notes: string | null;
  StartDate: Date;
  EndDate: Date | null;
  CreatedAt: Date;
  UpdatedAt: Date;
}

export interface University {
  UniversityID: number;
  UniversityName: string;
  StudentCount?: number;
}

export interface Program {
  ProgramID: number;
  ProgramName: string;
  StudentCount?: number;
}

export class DashboardRepository {
  async getSummary(): Promise<DashboardSummary> {
    const query = `
      SELECT
        (SELECT COUNT(*) FROM Students WHERE IsActive = 1) as TotalStudents,
        (SELECT COUNT(*) FROM Students WHERE IsActive = 1 AND RiskLevel = 'Critical') as CriticalStudents,
        (SELECT AVG(CAST(GPA as FLOAT)) FROM Students WHERE IsActive = 1) as AverageGPA,
        (SELECT COUNT(*) FROM Interventions WHERE Status = 'Active') as ActiveInterventions
    `;
    const result = await databaseService.executeQuery<{
      TotalStudents: number;
      CriticalStudents: number;
      AverageGPA: number;
      ActiveInterventions: number;
    }>(query);
    
    return {
      totalStudents: result[0]?.TotalStudents || 0,
      criticalStudents: result[0]?.CriticalStudents || 0,
      averageGPA: result[0]?.AverageGPA || 0,
      activeInterventions: result[0]?.ActiveInterventions || 0
    };
  }

  async getRiskDistribution(): Promise<RiskDistribution> {
    const query = `
      SELECT
        COUNT(*) as TotalStudents,
        SUM(CASE WHEN RiskLevel = 'Safe' THEN 1 ELSE 0 END) as SafeCount,
        SUM(CASE WHEN RiskLevel = 'At Risk' THEN 1 ELSE 0 END) as AtRiskCount,
        SUM(CASE WHEN RiskLevel = 'Critical' THEN 1 ELSE 0 END) as CriticalCount
      FROM Students
      WHERE IsActive = 1
    `;
    const result = await databaseService.executeQuery<{
      TotalStudents: number;
      SafeCount: number;
      AtRiskCount: number;
      CriticalCount: number;
    }>(query);
    
    const total = result[0]?.TotalStudents || 0;
    const safeCount = result[0]?.SafeCount || 0;
    const atRiskCount = result[0]?.AtRiskCount || 0;
    const criticalCount = result[0]?.CriticalCount || 0;
    
    return {
      safe: {
        count: safeCount,
        percentage: total > 0 ? Math.round((safeCount / total) * 100) : 0
      },
      atRisk: {
        count: atRiskCount,
        percentage: total > 0 ? Math.round((atRiskCount / total) * 100) : 0
      },
      critical: {
        count: criticalCount,
        percentage: total > 0 ? Math.round((criticalCount / total) * 100) : 0
      },
      totalStudents: total
    };
  }

  async getAllUniversities(): Promise<University[]> {
    const query = `
      SELECT 
        u.UniversityID,
        u.UniversityName,
        COUNT(s.StudentID) as StudentCount
      FROM Universities u
      LEFT JOIN Students s ON u.UniversityID = s.UniversityID AND s.IsActive = 1
      GROUP BY u.UniversityID, u.UniversityName
      ORDER BY u.UniversityName
    `;
    return databaseService.executeQuery<University>(query);
  }

  async getAllPrograms(): Promise<Program[]> {
    const query = `
      SELECT 
        p.ProgramID,
        p.ProgramName,
        COUNT(s.StudentID) as StudentCount
      FROM Programs p
      LEFT JOIN Students s ON p.ProgramID = s.ProgramID AND s.IsActive = 1
      GROUP BY p.ProgramID, p.ProgramName
      ORDER BY p.ProgramName
    `;
    return databaseService.executeQuery<Program>(query);
  }

  async getActiveInterventions(): Promise<Intervention[]> {
    const query = `
      SELECT 
        i.InterventionID,
        i.StudentID,
        s.StudentName,
        i.InterventionType,
        i.Description,
        i.Status,
        i.Priority,
        i.AssignedTo,
        i.Notes,
        i.StartDate,
        i.EndDate,
        i.CreatedAt,
        i.UpdatedAt
      FROM Interventions i
      JOIN Students s ON i.StudentID = s.StudentID
      WHERE i.Status = 'Active'
      ORDER BY 
        CASE i.Priority 
          WHEN 'Critical' THEN 1 
          WHEN 'High' THEN 2 
          WHEN 'Medium' THEN 3 
          WHEN 'Low' THEN 4 
        END,
        i.CreatedAt DESC
    `;
    return databaseService.executeQuery<Intervention>(query);
  }

  async createIntervention(data: {
    studentId: number;
    interventionType: string;
    description?: string;
    priority?: string;
    assignedTo?: string;
    notes?: string;
  }): Promise<Intervention> {
    const query = `
      INSERT INTO Interventions (StudentID, InterventionType, Description, Priority, AssignedTo, Notes)
      OUTPUT INSERTED.*
      VALUES (@studentId, @interventionType, @description, @priority, @assignedTo, @notes)
    `;
    const result = await databaseService.executeQuery<Intervention>(query, {
      studentId: data.studentId,
      interventionType: data.interventionType,
      description: data.description || null,
      priority: data.priority || 'Medium',
      assignedTo: data.assignedTo || null,
      notes: data.notes || null
    });
    return result[0] as Intervention;
  }

  async getStudentsForExport(): Promise<any[]> {
    const query = `
      SELECT 
        s.StudentID,
        s.StudentName,
        s.StudentNumber,
        u.UniversityName,
        p.ProgramName,
        s.YearOfStudy,
        s.GPA,
        s.RiskLevel,
        s.ContactEmail,
        s.ContactPhone,
        s.EmergencyContact,
        s.EmergencyPhone,
        s.DateEnrolled,
        s.LastLoginDate,
        (SELECT COUNT(*) FROM Interventions i WHERE i.StudentID = s.StudentID AND i.Status = 'Active') as ActiveInterventions
      FROM Students s
      JOIN Universities u ON s.UniversityID = u.UniversityID
      JOIN Programs p ON s.ProgramID = p.ProgramID
      WHERE s.IsActive = 1
      ORDER BY s.StudentName
    `;
    return databaseService.executeQuery(query);
  }
}

export const dashboardRepository = new DashboardRepository();

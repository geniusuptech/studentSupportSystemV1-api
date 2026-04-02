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

  async getUniversityByStudentId(studentId: string): Promise<University> {
    const query = `
      SELECT u.UniversityID as id, u.UniversityName as name
      FROM Universities u
      JOIN Students s ON u.UniversityID = s.UniversityID
      WHERE s.StudentID = ? AND s.IsActive = 1
    `;
    const data = await databaseService.executeQuery(query, [studentId]);
    if (data.length === 0) {
      throw new Error('Student not found');
    }
    return data[0];
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

  async getProgramByStudentId(studentId: string): Promise<Program> {
    const query = `
      SELECT p.ProgramID as id, p.ProgramName as name
      FROM Programs p
      JOIN Students s ON p.ProgramID = s.ProgramID
      WHERE s.StudentID = ? AND s.IsActive = 1
    `;
    const data = await databaseService.executeQuery(query, [studentId]);
    if (data.length === 0) {
      throw new Error('Student not found');
    }
    return data[0];
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
  async getAllStudentsForExport(): Promise<any[]> {
    const query = `
      SELECT 
        StudentID as id,
        StudentName as name,
        StudentNumber as student_id,
        ContactEmail as email,
        ContactPhone as phone,
        UniversityName as universityName,
        ProgramName as programName,
        YearOfStudy as year,
        GPA as gpa,
        RiskLevel as risk,
        'Active' as status,
        CreatedAt as enrollment_date,
        LastLoginDate as last_activity
      FROM vw_StudentDetails
      WHERE IsActive = 1
    `;
    return databaseService.executeQuery(query);
  }

  async getRiskLevelByStudentId(studentId: string): Promise<any> {
    const query = `
      SELECT 
        RiskLevel as value,
        RiskLevel as label,
        CASE 
          WHEN RiskLevel = 'Safe' THEN 'Student is performing well with no concerns'
          WHEN RiskLevel = 'At Risk' THEN 'Student requires monitoring and preventive support'
          WHEN RiskLevel = 'Critical' THEN 'Student requires immediate intervention and support'
          ELSE 'Unknown risk level'
        END as description,
        CASE 
          WHEN RiskLevel = 'Safe' THEN '#10B981'
          WHEN RiskLevel = 'At Risk' THEN '#F59E0B'
          WHEN RiskLevel = 'Critical' THEN '#EF4444'
          ELSE '#6B7280'
        END as color
      FROM Students
      WHERE StudentID = ? AND IsActive = 1
    `;
    const data = await databaseService.executeQuery(query, [studentId]);
    if (data.length === 0) {
      throw new Error('Student not found');
    }
    return data[0];
  }

  async getStudentsForDashboard(filters: any): Promise<any[]> {
    let query = `
      SELECT 
        s.StudentID as id,
        s.StudentName as name,
        s.StudentNumber as studentId,
        s.ContactEmail as email,
        u.UniversityName as university,
        p.ProgramName as program,
        s.YearOfStudy as year,
        PRINTF('%.2f', s.GPA) as gpa,
        s.RiskLevel as riskLevel,
        CASE 
          WHEN s.LastLoginDate IS NULL THEN 'Never'
          ELSE datetime(s.LastLoginDate, 'localtime')
        END as lastActivity,
        s.CreatedAt as enrollmentDate,
        CASE 
          WHEN s.RiskLevel = 'Safe' THEN '#10B981'
          WHEN s.RiskLevel = 'At Risk' THEN '#F59E0B'
          WHEN s.RiskLevel = 'Critical' THEN '#EF4444'
          ELSE '#6B7280'
        END as riskColor
      FROM Students s
      JOIN Universities u ON s.UniversityID = u.UniversityID
      JOIN Programs p ON s.ProgramID = p.ProgramID
      WHERE s.IsActive = 1
    `;
    
    const params: any = {};
    
    if (filters.university) {
      query += ` AND u.UniversityName LIKE @university`;
      params.university = `%${filters.university}%`;
    }
    
    if (filters.program) {
      query += ` AND p.ProgramName LIKE @program`;
      params.program = `%${filters.program}%`;
    }
    
    if (filters.riskLevel) {
      query += ` AND s.RiskLevel = @riskLevel`;
      params.riskLevel = filters.riskLevel;
    }
    
    if (filters.year) {
      query += ` AND s.YearOfStudy = @year`;
      params.year = parseInt(filters.year);
    }
    
    query += ` ORDER BY s.StudentName ASC`;
    
    const data = await databaseService.executeQuery(query, params);
    
    return data.map(student => ({
      ...student,
      displayName: student.name,
      universityShort: this.getUniversityShortName(student.university),
      yearDisplay: this.getYearDisplay(student.year),
      gpaFormatted: parseFloat(student.gpa).toFixed(2),
      riskLevelDisplay: {
        value: student.riskLevel,
        color: student.riskColor,
        label: student.riskLevel
      },
      lastActivityFormatted: this.formatLastActivity(student.lastActivity)
    }));
  }
  
  private getUniversityShortName(universityName: string): string {
    const shortNames: { [key: string]: string } = {
      'University of Cape Town': 'UCT',
      'University of the Witwatersrand': 'Wits',
      'University of Johannesburg': 'UJ',
      'University of KwaZulu-Natal': 'UKZN',
      'Stellenbosch University': 'Stellenbosch',
      'University of Pretoria': 'UP'
    };
    return shortNames[universityName] || universityName;
  }
  
  private getYearDisplay(year: number): string {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = year % 100;
    return year + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]) + ' Year';
  }
  
  private formatLastActivity(lastActivity: string): string {
    if (!lastActivity || lastActivity === 'Never') {
      return 'Never';
    }
    
    const now = new Date();
    const activityDate = new Date(lastActivity);
    const diffMs = now.getTime() - activityDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 60) {
      return `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return activityDate.toLocaleDateString();
    }
  }

  async getStudentManagementStats(): Promise<any> {
    // Get total students
    const totalQuery = `SELECT COUNT(*) as total FROM Students WHERE IsActive = 1`;
    
    // Get risk distribution
    const riskQuery = `
      SELECT 
        RiskLevel,
        COUNT(*) as count
      FROM Students 
      WHERE IsActive = 1 
      GROUP BY RiskLevel
    `;
    
    // Get active interventions
    const interventionsQuery = `
      SELECT COUNT(*) as interventions 
      FROM SupportRequests 
      WHERE Status IN ('Open', 'In Progress')
    `;

    const results = await Promise.all([
      databaseService.executeQuery(totalQuery),
      databaseService.executeQuery(riskQuery),
      databaseService.executeQuery(interventionsQuery)
    ]);

    const total = results[0][0].total || 0;
    const riskData = results[1];
    const interventions = results[2][0].interventions || 0;

    const riskCounts = { Safe: 0, 'At Risk': 0, Critical: 0 };
    riskData.forEach((row: any) => {
      riskCounts[row.RiskLevel as keyof typeof riskCounts] = row.count;
    });

    return {
      total: total,
      safe: riskCounts.Safe,
      atRisk: riskCounts['At Risk'],
      critical: riskCounts.Critical,
      interventions: interventions
    };
  }

  async searchStudents(keyword: string, filters: any): Promise<any[]> {
    let query = `
      SELECT 
        s.StudentID as id,
        s.StudentName as name,
        s.StudentNumber as studentId,
        s.ContactEmail as email,
        u.UniversityName as university,
        p.ProgramName as program,
        s.YearOfStudy as year,
        PRINTF('%.2f', s.GPA) as gpa,
        s.RiskLevel as riskLevel,
        CASE 
          WHEN s.LastLoginDate IS NULL THEN 'Never'
          ELSE datetime(s.LastLoginDate, 'localtime')
        END as lastActivity,
        s.CreatedAt as enrollmentDate,
        CASE 
          WHEN s.RiskLevel = 'Safe' THEN '#10B981'
          WHEN s.RiskLevel = 'At Risk' THEN '#F59E0B'
          WHEN s.RiskLevel = 'Critical' THEN '#EF4444'
          ELSE '#6B7280'
        END as riskColor
      FROM Students s
      JOIN Universities u ON s.UniversityID = u.UniversityID
      JOIN Programs p ON s.ProgramID = p.ProgramID
      WHERE s.IsActive = 1
    `;
    
    const params: any = {};
    
    if (keyword && keyword.trim()) {
      query += ` AND (
        s.StudentName LIKE @keyword OR 
        s.StudentNumber LIKE @keyword OR 
        s.ContactEmail LIKE @keyword
      )`;
      params.keyword = `%${keyword.trim()}%`;
    }
    
    if (filters.university) {
      query += ` AND u.UniversityName = @university`;
      params.university = filters.university;
    }
    
    if (filters.program) {
      query += ` AND p.ProgramName = @program`;
      params.program = filters.program;
    }
    
    if (filters.riskLevel) {
      query += ` AND s.RiskLevel = @riskLevel`;
      params.riskLevel = filters.riskLevel;
    }
    
    if (filters.year) {
      query += ` AND s.YearOfStudy = @year`;
      params.year = parseInt(filters.year);
    }
    
    query += ` ORDER BY s.StudentName ASC`;
    
    const data = await databaseService.executeQuery(query, params);
    
    return data.map(student => ({
      ...student,
      displayName: student.name,
      universityShort: this.getUniversityShortName(student.university),
      yearDisplay: this.getYearDisplay(student.year),
      gpaFormatted: parseFloat(student.gpa).toFixed(2),
      riskLevelDisplay: {
        value: student.riskLevel,
        color: student.riskColor,
        label: student.riskLevel
      },
      lastActivityFormatted: this.formatLastActivity(student.lastActivity)
    }));
  }

  async getStudentsForExport(filters: any = {}): Promise<any[]> {
    let query = `
      SELECT 
        s.StudentID as id,
        s.StudentName as name,
        s.StudentNumber as student_number,
        s.ContactEmail as email,
        s.ContactPhone as phone,
        u.UniversityName as university,
        p.ProgramName as program,
        s.YearOfStudy as year,
        PRINTF('%.2f', s.GPA) as gpa,
        s.RiskLevel as risk_level,
        'Active' as status,
        s.CreatedAt as enrollment_date,
        CASE 
          WHEN s.LastLoginDate IS NULL THEN 'Never'
          ELSE datetime(s.LastLoginDate, 'localtime')
        END as last_activity
      FROM Students s
      JOIN Universities u ON s.UniversityID = u.UniversityID
      JOIN Programs p ON s.ProgramID = p.ProgramID
      WHERE s.IsActive = 1
    `;
    
    const params: any = {};
    
    if (filters.university) {
      query += ` AND u.UniversityName = @university`;
      params.university = filters.university;
    }
    
    if (filters.program) {
      query += ` AND p.ProgramName = @program`;
      params.program = filters.program;
    }
    
    if (filters.riskLevel) {
      query += ` AND s.RiskLevel = @riskLevel`;
      params.riskLevel = filters.riskLevel;
    }
    
    if (filters.year) {
      query += ` AND s.YearOfStudy = @year`;
      params.year = parseInt(filters.year);
    }
    
    if (filters.keyword && filters.keyword.trim()) {
      query += ` AND (
        s.StudentName LIKE @keyword OR 
        s.StudentNumber LIKE @keyword OR 
        s.ContactEmail LIKE @keyword
      )`;
      params.keyword = `%${filters.keyword.trim()}%`;
    }
    
    query += ` ORDER BY s.StudentName ASC`;
    
    return databaseService.executeQuery(query, params);
  }
}

export const dashboardRepository = new DashboardRepository();

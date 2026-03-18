import { studentsRepository } from '../repository/studentsRepository';
import { Student } from '../models/Student';
import databaseService from '../config/database';

interface StudentStatistics {
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

interface UpdateRiskLevelResult {
  student: any;
  previousRiskLevel: string;
  newRiskLevel: string;
  reason: string;
  updatedAt: string;
}

export class StudentsService {
  async getAllStudents(filters: any): Promise<(Student & { ActiveRequestCount: number })[]> {
    const students = await studentsRepository.getAllStudents(filters);
    
    // For production ready, we could fetch actual counts
    const data = await Promise.all(students.map(async (student: Student) => {
      const query = `SELECT COUNT(*) as count FROM SupportRequests WHERE StudentID = @id AND Status IN ('Open', 'In Progress')`;
      const results = await databaseService.executeQuery(query, { id: student.id });
      return {
        ...student,
        ActiveRequestCount: results[0].count || 0
      };
    }));
    return data;
  }

  async getStudentById(id: string | number): Promise<Student> {
    const student = await studentsRepository.getStudentById(id);
    if (!student) throw new Error('Student not found');
    return student;
  }

  async getStudentsByRiskLevel(riskLevel: 'Safe' | 'At Risk' | 'Critical'): Promise<Student[]> {
    return await studentsRepository.getStudentsByRiskLevel(riskLevel);
  }

  async getStudentStatistics(): Promise<StudentStatistics> {
    const query = `
        SELECT RiskLevel, GPA, YearOfStudy, UniversityName, ProgramName
        FROM vw_StudentDetails
        WHERE IsActive = 1
    `;
    const students = await databaseService.executeQuery(query);

    const total = students.length;
    const gpas = students.map((s: any) => parseFloat(s.GPA) || 0);
    const avgGPA = total > 0 ? gpas.reduce((a: number, b: number) => a + b, 0) / total : 0;

    const stats: StudentStatistics = {
      totalStudents: total,
      riskLevels: {
        safe: students.filter((s: any) => s.RiskLevel === 'Safe').length,
        atRisk: students.filter((s: any) => s.RiskLevel === 'At Risk').length,
        critical: students.filter((s: any) => s.RiskLevel === 'Critical').length
      },
      averageGPA: Math.round(avgGPA * 100) / 100,
      universities: {},
      programs: {},
      yearDistribution: {}
    };

    students.forEach((s: any) => {
        const uniName = s.UniversityName || 'Unknown';
        stats.universities[uniName] = (stats.universities[uniName] || 0) + 1;

        const progName = s.ProgramName || 'Unknown';
        stats.programs[progName] = (stats.programs[progName] || 0) + 1;

        const yearLabel = s.YearOfStudy ? `Year ${s.YearOfStudy}` : 'Unknown';
        stats.yearDistribution[yearLabel] = (stats.yearDistribution[yearLabel] || 0) + 1;
    });

    return stats;
  }

  async updateStudentRiskLevel(studentId: string | number, riskLevel: string, reason?: string): Promise<UpdateRiskLevelResult> {
    const existing = await studentsRepository.getStudentById(studentId);
    if (!existing) throw new Error('Student not found');

    const currentRiskLevel = existing.risk;
    const updatedAt = new Date().toISOString();
    await studentsRepository.updateRiskLevel(studentId, riskLevel, updatedAt);
    
    const updated = await studentsRepository.getStudentById(studentId);

    return {
      student: updated,
      previousRiskLevel: currentRiskLevel,
      newRiskLevel: riskLevel,
      reason: reason || 'No reason provided',
      updatedAt: updatedAt
    };
  }
}

export const studentsService = new StudentsService();
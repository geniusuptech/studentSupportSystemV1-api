import { studentsRepository } from '../repository/studentsRepository';
import { Student, StudentAssessmentRecord } from '../models/Student';
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

interface CreateStudentAssessmentInput {
  date: string;
  subject: string;
  assessment: string;
  grade: number;
  status: string;
  notes?: string;
}

export class StudentsService {
  async getAllStudents(filters: any): Promise<(Student & { ActiveRequestCount: number })[]> {
    const students = await studentsRepository.getAllStudents(filters);
    return students.map((student: Student) => ({
      ...student,
      ActiveRequestCount: 0 // Replace 0 with actual logic if needed
    }));
  }

  async getStudentById(id: number): Promise<Student | undefined> {
    const student = await studentsRepository.getStudentById(id);
    if (!student.length) throw new Error('Student not found');

    const studentData = student[0] as Student;
    const assessmentHistory = await studentsRepository.getAssessmentHistoryByStudentId(id);
    const modules = [
      studentData.Module1,
      studentData.Module2,
      studentData.Module3,
      studentData.Module4
    ].filter((module): module is string => Boolean(module && module.trim()));

    const normalizedAssessmentHistory: StudentAssessmentRecord[] = assessmentHistory.map((record) => ({
      ...record,
      Grade: Math.round((record.Grade || 0) * 100) / 100
    }));

    return {
      ...studentData,
      Modules: modules,
      AssessmentHistory: normalizedAssessmentHistory
    };
  }

  async getStudentsByRiskLevel(riskLevel: 'Safe' | 'At Risk' | 'Critical'): Promise<Student[]> {
    return await studentsRepository.getStudentsByRiskLevel(riskLevel);
  }

  async getStudentsByUniversity(universityId: number): Promise<Student[]> {
    return await studentsRepository.getStudentsByUniversity(universityId);
  }

  async getStudentsByProgram(programId: number): Promise<Student[]> {
    return await studentsRepository.getStudentsByProgram(programId);
  }

  async getStudentStatistics(): Promise<StudentStatistics> {
    // Get total students and risk level breakdown
    const riskStatsQuery = `
      SELECT
        COUNT(*) as TotalStudents,
        SUM(CASE WHEN RiskLevel = 'Safe' THEN 1 ELSE 0 END) as SafeCount,
        SUM(CASE WHEN RiskLevel = 'At Risk' THEN 1 ELSE 0 END) as AtRiskCount,
        SUM(CASE WHEN RiskLevel = 'Critical' THEN 1 ELSE 0 END) as CriticalCount,
        AVG(CAST(GPA as FLOAT)) as AverageGPA
      FROM Students
      WHERE IsActive = 1
    `;

    // Get university distribution
    const universityStatsQuery = `
      SELECT u.UniversityName, COUNT(s.StudentID) as StudentCount
      FROM Students s
      LEFT JOIN Universities u ON s.UniversityID = u.UniversityID
      WHERE s.IsActive = 1
      GROUP BY u.UniversityName
      ORDER BY StudentCount DESC
    `;

    // Get program distribution
    const programStatsQuery = `
      SELECT p.ProgramName, COUNT(s.StudentID) as StudentCount
      FROM Students s
      LEFT JOIN Programs p ON s.ProgramID = p.ProgramID
      WHERE s.IsActive = 1
      GROUP BY p.ProgramName
      ORDER BY StudentCount DESC
    `;

    // Get year distribution
    const yearStatsQuery = `
      SELECT YearOfStudy, COUNT(*) as StudentCount
      FROM Students
      WHERE IsActive = 1
      GROUP BY YearOfStudy
      ORDER BY YearOfStudy ASC
    `;

    const [riskStats, universityStats, programStats, yearStats] = await Promise.all([
      databaseService.executeQuery(riskStatsQuery),
      databaseService.executeQuery(universityStatsQuery),
      databaseService.executeQuery(programStatsQuery),
      databaseService.executeQuery(yearStatsQuery)
    ]);

    const stats = riskStats[0];

    return {
      totalStudents: stats.TotalStudents || 0,
      riskLevels: {
        safe: stats.SafeCount || 0,
        atRisk: stats.AtRiskCount || 0,
        critical: stats.CriticalCount || 0
      },
      averageGPA: Math.round((stats.AverageGPA || 0) * 100) / 100,
      universities: universityStats.reduce((acc: any, item: any) => {
        acc[item.UniversityName] = item.StudentCount;
        return acc;
      }, {}),
      programs: programStats.reduce((acc: any, item: any) => {
        acc[item.ProgramName] = item.StudentCount;
        return acc;
      }, {}),
      yearDistribution: yearStats.reduce((acc: any, item: any) => {
        acc[`Year ${item.YearOfStudy}`] = item.StudentCount;
        return acc;
      }, {})
    };
  }

  async updateStudentRiskLevel(studentId: number, riskLevel: string, reason?: string): Promise<UpdateRiskLevelResult> {
    // First check if student exists
    const checkQuery = `
      SELECT StudentID, StudentName, RiskLevel
      FROM Students
      WHERE StudentID = @studentId AND IsActive = 1
    `;

    const existingStudent = await databaseService.executeQuery(checkQuery, { studentId });

    if (existingStudent.length === 0) {
      throw new Error('Student not found');
    }

    const currentRiskLevel = existingStudent[0].RiskLevel;

    if (currentRiskLevel === riskLevel) {
      throw new Error(`No change required: Student ${existingStudent[0].StudentName} is already at ${riskLevel} risk level`);
    }

    // Update the risk level
    const updateQuery = `
      UPDATE Students
      SET RiskLevel = @riskLevel, UpdatedAt = GETDATE()
      WHERE StudentID = @studentId
    `;

    await databaseService.executeQuery(updateQuery, {
      studentId,
      riskLevel
    });

    // Get updated student data
    const updatedStudentQuery = `
      SELECT
        s.StudentID,
        s.StudentName,
        s.StudentNumber,
        s.RiskLevel,
        s.GPA,
        u.UniversityName,
        p.ProgramName,
        s.UpdatedAt
      FROM Students s
      LEFT JOIN Universities u ON s.UniversityID = u.UniversityID
      LEFT JOIN Programs p ON s.ProgramID = p.ProgramID
      WHERE s.StudentID = @studentId
    `;

    const updatedStudent = await databaseService.executeQuery(updatedStudentQuery, { studentId });

    return {
      student: updatedStudent[0],
      previousRiskLevel: currentRiskLevel,
      newRiskLevel: riskLevel,
      reason: reason || 'No reason provided',
      updatedAt: new Date().toISOString()
    };
  }

  async createStudentAssessment(studentId: number, input: CreateStudentAssessmentInput): Promise<StudentAssessmentRecord> {
    const student = await studentsRepository.getStudentById(studentId);
    if (!student.length) {
      throw new Error('Student not found');
    }

    const submissionDate = input.date.trim();
    const isValidDateFormat = /^\d{4}-\d{2}-\d{2}$/.test(submissionDate);
    const parsedDate = new Date(`${submissionDate}T12:00:00Z`);
    if (!isValidDateFormat || Number.isNaN(parsedDate.getTime())) {
      throw new Error('Invalid date format. Use YYYY-MM-DD.');
    }

    const grade = Number(input.grade);
    if (!Number.isFinite(grade) || grade < 0 || grade > 100) {
      throw new Error('Grade must be a number between 0 and 100.');
    }

    const subject = input.subject.trim();
    const assessmentName = input.assessment.trim();
    const statusName = input.status.trim();

    if (!subject) {
      throw new Error('Subject is required.');
    }
    if (!assessmentName) {
      throw new Error('Assessment type is required.');
    }
    if (!statusName) {
      throw new Error('Status is required.');
    }

    const typeRows = await databaseService.executeQuery<{ AssessmentTypeID: number }>(
      `
      SELECT TOP 1 AssessmentTypeID
      FROM AssessmentTypes
      WHERE AssessmentTypeName = @assessmentName
        AND IsActive = 1
      `,
      { assessmentName }
    );

    if (!typeRows.length) {
      throw new Error(`Invalid assessment type: ${assessmentName}`);
    }
    const assessmentTypeId = typeRows[0]!.AssessmentTypeID;

    const statusRows = await databaseService.executeQuery<{ AssessmentStatusID: number }>(
      `
      SELECT TOP 1 AssessmentStatusID
      FROM AssessmentStatuses
      WHERE StatusName = @statusName
        AND IsActive = 1
      `,
      { statusName }
    );

    if (!statusRows.length) {
      throw new Error(`Invalid assessment status: ${statusName}`);
    }
    const assessmentStatusId = statusRows[0]!.AssessmentStatusID;

    const insertRows = await databaseService.executeQuery<{ AssessmentRecordID: number }>(
      `
      INSERT INTO StudentAssessments (
        StudentID,
        SubjectName,
        AssessmentTypeID,
        GradePercentage,
        AssessmentStatusID,
        SubmissionDate,
        Notes,
        CreatedAt,
        UpdatedAt
      )
      OUTPUT INSERTED.StudentAssessmentID AS AssessmentRecordID
      VALUES (
        @studentId,
        @subject,
        @assessmentTypeId,
        @grade,
        @assessmentStatusId,
        @submissionDate,
        @notes,
        GETDATE(),
        GETDATE()
      )
      `,
      {
        studentId,
        subject,
        assessmentTypeId,
        grade,
        assessmentStatusId,
        submissionDate,
        notes: input.notes || null
      }
    );

    const assessmentRecordId = insertRows[0]?.AssessmentRecordID;
    if (!assessmentRecordId) {
      throw new Error('Failed to create assessment record.');
    }

    const createdRows = await databaseService.executeQuery<StudentAssessmentRecord>(
      `
      SELECT
        sa.StudentAssessmentID AS AssessmentRecordID,
        CONVERT(NVARCHAR(10), sa.SubmissionDate, 23) AS [Date],
        sa.SubjectName AS Subject,
        at.AssessmentTypeName AS Assessment,
        CAST(sa.GradePercentage AS FLOAT) AS Grade,
        gs.StatusName AS Status
      FROM StudentAssessments sa
      INNER JOIN AssessmentTypes at ON sa.AssessmentTypeID = at.AssessmentTypeID
      INNER JOIN AssessmentStatuses gs ON sa.AssessmentStatusID = gs.AssessmentStatusID
      WHERE sa.StudentAssessmentID = @assessmentRecordId
      `,
      { assessmentRecordId }
    );

    if (!createdRows.length) {
      throw new Error('Failed to fetch created assessment record.');
    }

    const created = createdRows[0]!;
    return {
      AssessmentRecordID: created.AssessmentRecordID,
      Date: created.Date,
      Subject: created.Subject,
      Assessment: created.Assessment,
      Grade: Math.round((created.Grade || 0) * 100) / 100,
      Status: created.Status
    };
  }
}

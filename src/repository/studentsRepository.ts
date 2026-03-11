import databaseService from '../config/database';
import { Student, StudentAssessmentRecord } from '../models/Student';

export class StudentsRepository {
    async getAllStudents(filters: any): Promise<Student[]> {
        let query = `
            SELECT
                s.StudentID,    
                s.StudentName,
                s.StudentNumber,
                s.UniversityID,
                u.UniversityName,
                s.ProgramID,
                p.ProgramName,
                s.YearOfStudy,
                s.GPA,
                s.RiskLevel,
                s.ContactEmail,
                s.ContactPhone,
                s.EmergencyContact,
                s.EmergencyPhone,
                s.Module1,
                s.Module2,
                s.Module3,
                s.Module4,
                s.DateEnrolled,
                s.LastLoginDate,
                s.IsActive,
                s.CreatedAt,
                s.UpdatedAt
            FROM Students s
            JOIN Universities u ON s.UniversityID = u.UniversityID
            JOIN Programs p ON s.ProgramID = p.ProgramID
            WHERE s.IsActive = 1
        `;
        const params: any = {};
        // Optionally, you can add filter logic here to modify query and params
        return databaseService.executeQuery(query, params);
    }

    async getStudentById(id: number): Promise<Student[]> {
        const query = `
            SELECT
                s.StudentID,    
                s.StudentName,
                s.StudentNumber,
                s.UniversityID,
                u.UniversityName,
                s.ProgramID,
                p.ProgramName,
                s.YearOfStudy,
                s.GPA,
                s.RiskLevel,
                s.ContactEmail,
                s.ContactPhone,
                s.EmergencyContact,
                s.EmergencyPhone,
                s.Module1,
                s.Module2,
                s.Module3,
                s.Module4,
                s.DateEnrolled,
                s.LastLoginDate,
                s.IsActive,
                s.CreatedAt,
                s.UpdatedAt
            FROM Students s
            JOIN Universities u ON s.UniversityID = u.UniversityID
            JOIN Programs p ON s.ProgramID = p.ProgramID
            WHERE s.StudentID = @id AND s.IsActive = 1
        `;
        return databaseService.executeQuery(query, { id });
    }

    //get student by risk level
    async getStudentsByRiskLevel(riskLevel: 'Safe' | 'At Risk' | 'Critical'): Promise<Student[]> {
        const query = `
            SELECT
                s.StudentID,
                s.StudentName,
                s.StudentNumber,
                s.UniversityID,
                u.UniversityName,
                s.ProgramID,
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
                s.IsActive,
                s.CreatedAt,
                s.UpdatedAt
            FROM Students s
            JOIN Universities u ON s.UniversityID = u.UniversityID
            JOIN Programs p ON s.ProgramID = p.ProgramID
            WHERE s.RiskLevel = @riskLevel AND s.IsActive = 1
        `;
        return databaseService.executeQuery(query, { riskLevel });
    }

    //get student by university
    async getStudentsByUniversity(universityId: number): Promise<Student[]> {
        const query = `
            SELECT
                s.StudentID,
                s.StudentName,
                s.StudentNumber,
                s.UniversityID,
                u.UniversityName,
                s.ProgramID,
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
                s.IsActive,
                s.CreatedAt,
                s.UpdatedAt
            FROM Students s
            JOIN Universities u ON s.UniversityID = u.UniversityID
            JOIN Programs p ON s.ProgramID = p.ProgramID
            WHERE s.UniversityID = @universityId AND s.IsActive = 1
        `;
        return databaseService.executeQuery(query, { universityId });
    }

    //get student by program
    async getStudentsByProgram(programId: number): Promise<Student[]> {
        const query = `
            SELECT
                s.StudentID,    
                s.StudentName,
                s.StudentNumber,
                s.UniversityID,
                u.UniversityName,
                s.ProgramID,
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
                s.IsActive,
                s.CreatedAt,
                s.UpdatedAt
            FROM Students s
            JOIN Universities u ON s.UniversityID = u.UniversityID
            JOIN Programs p ON s.ProgramID = p.ProgramID
            WHERE s.ProgramID = @programId AND s.IsActive = 1
        `;
        return databaseService.executeQuery(query, { programId });
    }

    async getAssessmentHistoryByStudentId(studentId: number): Promise<StudentAssessmentRecord[]> {
        const query = `
            IF OBJECT_ID(N'dbo.StudentAssessments', N'U') IS NULL
            BEGIN
                SELECT
                    CAST(NULL AS INT) AS AssessmentRecordID,
                    CAST(NULL AS NVARCHAR(10)) AS [Date],
                    CAST(NULL AS NVARCHAR(150)) AS Subject,
                    CAST(NULL AS NVARCHAR(50)) AS Assessment,
                    CAST(NULL AS FLOAT) AS Grade,
                    CAST(NULL AS NVARCHAR(30)) AS Status
                WHERE 1 = 0;
            END
            ELSE
            BEGIN
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
                WHERE sa.StudentID = @studentId
                ORDER BY sa.SubmissionDate DESC, sa.StudentAssessmentID DESC;
            END
        `;

        return databaseService.executeQuery<StudentAssessmentRecord>(query, { studentId });
    }

}
export const studentsRepository = new StudentsRepository();

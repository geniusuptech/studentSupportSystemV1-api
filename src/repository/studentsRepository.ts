import databaseService from '../config/database';
import { Student } from '../models/Student';

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

}
export const studentsRepository = new StudentsRepository();
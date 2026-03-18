import databaseService from '../config/database';
import { Student } from '../models/Student';

export class StudentsRepository {
    private mapStudent(s: any): Student {
        return {
            id: s.StudentID,
            name: s.StudentName,
            firstName: s.FirstName || (s.StudentName ? s.StudentName.split(' ')[0] : ''),
            lastName: s.LastName || (s.StudentName && s.StudentName.split(' ').length > 1 ? s.StudentName.split(' ')[1] : ''),
            email: s.ContactEmail,
            phone: s.ContactPhone,
            studentId: s.StudentNumber,
            idNumber: s.IDNumber,
            university: s.UniversityName,
            program: s.ProgramName,
            major: s.Major,
            minor: s.Minor,
            year: s.YearOfStudy,
            gender: s.Gender,
            dateOfBirth: s.DateOfBirth,
            address: s.Address,
            gpa: parseFloat(s.GPA) || 0,
            risk: s.RiskLevel as any || 'Safe',
            status: s.IsActive ? 'Active' : 'Inactive',
            lastActivity: s.LastLoginDate,
            enrollmentDate: s.DateEnrolled,
            avatarUrl: s.ProfilePictureURL,
            assignedCoordinatorId: s.AssignedCoordinatorID,
            nativeLanguage: s.NativeLanguage,
            createdAt: s.CreatedAt,
            updatedAt: s.UpdatedAt
        };
    }

    async getAllStudents(filters: any): Promise<Student[]> {
        let query = `SELECT * FROM vw_StudentDetails WHERE 1=1`;
        const params: any = {};

        if (filters.status) {
            query += ` AND IsActive = @status`;
            params.status = filters.status === 'Active' ? 1 : 0;
        }
        if (filters.risk) {
            query += ` AND RiskLevel = @risk`;
            params.risk = filters.risk;
        }
        if (filters.university) {
            query += ` AND UniversityID = @university`;
            params.university = filters.university;
        }

        const data = await databaseService.executeQuery(query, params);
        return data.map(s => this.mapStudent(s));
    }

    async getStudentById(id: string | number): Promise<Student | null> {
        const query = `SELECT * FROM vw_StudentDetails WHERE StudentID = @id`;
        const data = await databaseService.executeQuery(query, { id });
        
        if (data.length === 0) return null;
        return this.mapStudent(data[0]);
    }

    async getStudentsByRiskLevel(riskLevel: 'Safe' | 'At Risk' | 'Critical'): Promise<Student[]> {
        const query = `SELECT * FROM vw_StudentDetails WHERE RiskLevel = @riskLevel AND IsActive = 1`;
        const data = await databaseService.executeQuery(query, { riskLevel });
        return data.map(s => this.mapStudent(s));
    }

    async updateRiskLevel(id: string | number, risk: string, updatedAt: string): Promise<void> {
        const query = `UPDATE Students SET RiskLevel = @risk, UpdatedAt = @updatedAt WHERE StudentID = @id`;
        await databaseService.executeQuery(query, { risk, updatedAt, id });
    }
}

export const studentsRepository = new StudentsRepository();
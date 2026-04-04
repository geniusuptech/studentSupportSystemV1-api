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

    async createStudent(data: any): Promise<Student> {
        const query = `
            INSERT INTO Students (
                StudentName, StudentNumber, UniversityID, ProgramID, YearOfStudy, 
                GPA, RiskLevel, ContactEmail, ContactPhone, EmergencyContact, 
                EmergencyPhone, DateEnrolled, IsActive, CreatedAt, UpdatedAt
            ) VALUES (
                @name, @studentNumber, @universityId, @programId, @year,
                @gpa, @riskLevel, @email, @phone, @emergencyContact,
                @emergencyPhone, @dateEnrolled, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            )
            RETURNING *
        `;
        const params = {
            name: data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim(),
            studentNumber: data.studentNumber || data.studentId,
            universityId: data.universityId,
            programId: data.programId,
            year: data.year || data.yearOfStudy || 1,
            gpa: data.gpa || 0,
            riskLevel: data.riskLevel || 'Safe',
            email: data.email || data.contactEmail,
            phone: data.phone || data.contactPhone || null,
            emergencyContact: data.emergencyContact || null,
            emergencyPhone: data.emergencyPhone || null,
            dateEnrolled: data.dateEnrolled || new Date().toISOString().split('T')[0]
        };

        const result = await databaseService.executeQuery(query, params);
        // Fetch with view to get university/program names
        return this.getStudentById(result[0].StudentID) as Promise<Student>;
    }

    async updateStudent(id: string | number, data: any): Promise<Student | null> {
        const fields: string[] = [];
        const params: any = { id };

        if (data.name !== undefined) { fields.push('StudentName = @name'); params.name = data.name; }
        if (data.studentNumber !== undefined) { fields.push('StudentNumber = @studentNumber'); params.studentNumber = data.studentNumber; }
        if (data.universityId !== undefined) { fields.push('UniversityID = @universityId'); params.universityId = data.universityId; }
        if (data.programId !== undefined) { fields.push('ProgramID = @programId'); params.programId = data.programId; }
        if (data.year !== undefined || data.yearOfStudy !== undefined) { fields.push('YearOfStudy = @year'); params.year = data.year || data.yearOfStudy; }
        if (data.gpa !== undefined) { fields.push('GPA = @gpa'); params.gpa = data.gpa; }
        if (data.riskLevel !== undefined) { fields.push('RiskLevel = @riskLevel'); params.riskLevel = data.riskLevel; }
        if (data.email !== undefined) { fields.push('ContactEmail = @email'); params.email = data.email; }
        if (data.phone !== undefined) { fields.push('ContactPhone = @phone'); params.phone = data.phone; }
        if (data.emergencyContact !== undefined) { fields.push('EmergencyContact = @emergencyContact'); params.emergencyContact = data.emergencyContact; }
        if (data.emergencyPhone !== undefined) { fields.push('EmergencyPhone = @emergencyPhone'); params.emergencyPhone = data.emergencyPhone; }
        if (data.isActive !== undefined) { fields.push('IsActive = @isActive'); params.isActive = data.isActive ? 1 : 0; }

        if (fields.length === 0) return this.getStudentById(id);

        fields.push('UpdatedAt = CURRENT_TIMESTAMP');
        const query = `UPDATE Students SET ${fields.join(', ')} WHERE StudentID = @id`;
        await databaseService.executeQuery(query, params);
        return this.getStudentById(id);
    }

    async deleteStudent(id: string | number): Promise<void> {
        // Soft delete
        const query = `UPDATE Students SET IsActive = 0, UpdatedAt = CURRENT_TIMESTAMP WHERE StudentID = @id`;
        await databaseService.executeQuery(query, { id });
    }
}

export const studentsRepository = new StudentsRepository();
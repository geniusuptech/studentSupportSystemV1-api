import databaseService from '../config/database';

export interface StudentLoginWithDetails {
  id: string | number;
  email: string;
  passwordHash: string;
  isActive: boolean;
  lastLoginAt: string | null;
  studentId: string | number;
  studentName: string;
  studentNumber: string;
  universityId: string | number;
  universityName: string;
  programId: string | number;
  programName: string;
  risk: string;
}

export class StudentAuthRepository {
  async findByEmail(email: string): Promise<StudentLoginWithDetails | null> {
    const query = `
      SELECT u.*, s.StudentName, s.StudentNumber, s.UniversityID, s.ProgramID, s.RiskLevel,
             univ.UniversityName, prog.ProgramName
      FROM Users u
      JOIN Students s ON u.StudentID = s.StudentID
      JOIN Universities univ ON s.UniversityID = univ.UniversityID
      JOIN Programs prog ON s.ProgramID = prog.ProgramID
      WHERE u.Email = @email AND u.UserType = 'Student' AND u.IsActive = 1 AND s.IsActive = 1
    `;
    const data = await databaseService.executeQuery(query, { email });

    if (data.length === 0) return null;

    const row = data[0];
    return {
      id: row.UserID,
      email: row.Email,
      passwordHash: row.PasswordHash,
      isActive: row.IsActive,
      lastLoginAt: row.LastLoginDate,
      studentId: row.StudentID,
      studentName: row.StudentName,
      studentNumber: row.StudentNumber,
      universityId: row.UniversityID,
      universityName: row.UniversityName,
      programId: row.ProgramID,
      programName: row.ProgramName,
      risk: row.RiskLevel
    };
  }

  async updateLastLogin(id: string | number): Promise<void> {
    const query = `UPDATE Users SET LastLoginDate = CURRENT_TIMESTAMP, UpdatedAt = CURRENT_TIMESTAMP WHERE UserID = @id`;
    await databaseService.executeQuery(query, { id });
  }

  async createLogin(studentId: string | number, email: string, passwordHash: string): Promise<string | number> {
    const query = `
      INSERT INTO Users (Email, PasswordHash, UserType, FirstName, LastName, StudentID, IsActive, CreatedAt, UpdatedAt)
      VALUES (@email, @passwordHash, 'Student', '', '', @studentId, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING UserID
    `;
    const result = await databaseService.executeQuery(query, { email, passwordHash, studentId });
    return result[0].UserID;
  }

  async updatePassword(id: string | number, passwordHash: string): Promise<void> {
    const query = `UPDATE Users SET PasswordHash = @passwordHash, UpdatedAt = CURRENT_TIMESTAMP WHERE UserID = @id`;
    await databaseService.executeQuery(query, { id, passwordHash });
  }
}

export const studentAuthRepository = new StudentAuthRepository();

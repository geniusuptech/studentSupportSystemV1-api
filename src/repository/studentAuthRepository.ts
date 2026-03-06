import databaseService from '../config/database';

export interface StudentLogin {
  LoginID: number;
  StudentID: number;
  Email: string;
  PasswordHash: string;
  IsActive: boolean;
  LastLoginAt: Date | null;
  FailedLoginAttempts: number;
  LockedUntil: Date | null;
  PasswordResetToken: string | null;
  PasswordResetExpires: Date | null;
  CreatedAt: Date;
  UpdatedAt: Date;
}

export interface StudentLoginWithDetails extends StudentLogin {
  StudentName: string;
  StudentNumber: string;
  UniversityID: number;
  UniversityName: string;
  ProgramID: number;
  ProgramName: string;
  RiskLevel: string;
}

export class StudentAuthRepository {
  async findByEmail(email: string): Promise<StudentLoginWithDetails | null> {
    const query = `
      SELECT 
        sl.LoginID,
        sl.StudentID,
        sl.Email,
        sl.PasswordHash,
        sl.IsActive,
        sl.LastLoginAt,
        sl.FailedLoginAttempts,
        sl.LockedUntil,
        sl.CreatedAt,
        sl.UpdatedAt,
        s.StudentName,
        s.StudentNumber,
        s.UniversityID,
        u.UniversityName,
        s.ProgramID,
        p.ProgramName,
        s.RiskLevel
      FROM StudentLogins sl
      JOIN Students s ON sl.StudentID = s.StudentID
      JOIN Universities u ON s.UniversityID = u.UniversityID
      JOIN Programs p ON s.ProgramID = p.ProgramID
      WHERE sl.Email = @email AND s.IsActive = 1
    `;
    const result = await databaseService.executeQuery<StudentLoginWithDetails>(query, { email });
    return result.length > 0 ? result[0] as StudentLoginWithDetails : null;
  }

  async updateLastLogin(loginId: number): Promise<void> {
    const query = `
      UPDATE StudentLogins 
      SET LastLoginAt = GETDATE(), 
          FailedLoginAttempts = 0,
          LockedUntil = NULL,
          UpdatedAt = GETDATE()
      WHERE LoginID = @loginId
    `;
    await databaseService.executeQuery(query, { loginId });
  }

  async incrementFailedAttempts(loginId: number): Promise<number> {
    const query = `
      UPDATE StudentLogins 
      SET FailedLoginAttempts = FailedLoginAttempts + 1,
          UpdatedAt = GETDATE()
      OUTPUT INSERTED.FailedLoginAttempts
      WHERE LoginID = @loginId
    `;
    const result = await databaseService.executeQuery<{ FailedLoginAttempts: number }>(query, { loginId });
    return result[0]?.FailedLoginAttempts || 0;
  }

  async lockAccount(loginId: number, lockUntil: Date): Promise<void> {
    const query = `
      UPDATE StudentLogins 
      SET LockedUntil = @lockUntil,
          UpdatedAt = GETDATE()
      WHERE LoginID = @loginId
    `;
    await databaseService.executeQuery(query, { loginId, lockUntil });
  }

  async createLogin(studentId: number, email: string, passwordHash: string): Promise<number> {
    const query = `
      INSERT INTO StudentLogins (StudentID, Email, PasswordHash)
      OUTPUT INSERTED.LoginID
      VALUES (@studentId, @email, @passwordHash)
    `;
    const result = await databaseService.executeQuery<{ LoginID: number }>(query, {
      studentId,
      email,
      passwordHash
    });
    return result[0]!.LoginID;
  }

  async updatePassword(loginId: number, passwordHash: string): Promise<void> {
    const query = `
      UPDATE StudentLogins 
      SET PasswordHash = @passwordHash,
          PasswordResetToken = NULL,
          PasswordResetExpires = NULL,
          UpdatedAt = GETDATE()
      WHERE LoginID = @loginId
    `;
    await databaseService.executeQuery(query, { loginId, passwordHash });
  }
}

export const studentAuthRepository = new StudentAuthRepository();

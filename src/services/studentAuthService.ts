import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import databaseService from '../config/database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME_MINUTES = 15;

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

export interface LoginResult {
  success: boolean;
  message: string;
  token?: string;
  student?: {
    studentId: number;
    studentName: string;
    studentNumber: string;
    email: string;
    universityId: number;
    universityName: string;
    programId: number;
    programName: string;
    riskLevel: string;
  };
}

export interface TokenPayload {
  loginId: number;
  studentId: number;
  email: string;
  studentName: string;
  type: 'student';
}

export class StudentAuthService {
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

  async login(email: string, password: string): Promise<LoginResult> {
    // Find user by email
    const studentLogin = await this.findByEmail(email.toLowerCase().trim());

    if (!studentLogin) {
      return {
        success: false,
        message: 'Invalid email or password'
      };
    }

    // Check if account is locked
    if (studentLogin.LockedUntil && new Date(studentLogin.LockedUntil) > new Date()) {
      const minutesRemaining = Math.ceil(
        (new Date(studentLogin.LockedUntil).getTime() - Date.now()) / 60000
      );
      return {
        success: false,
        message: `Account is locked. Please try again in ${minutesRemaining} minutes.`
      };
    }

    // Check if account is active
    if (!studentLogin.IsActive) {
      return {
        success: false,
        message: 'Account is deactivated. Please contact support.'
      };
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, studentLogin.PasswordHash);

    if (!isPasswordValid) {
      // Increment failed attempts
      const failedAttempts = await this.incrementFailedAttempts(studentLogin.LoginID);

      // Lock account if too many failed attempts
      if (failedAttempts >= MAX_LOGIN_ATTEMPTS) {
        const lockUntil = new Date(Date.now() + LOCK_TIME_MINUTES * 60000);
        await this.lockAccount(studentLogin.LoginID, lockUntil);
        return {
          success: false,
          message: `Too many failed login attempts. Account locked for ${LOCK_TIME_MINUTES} minutes.`
        };
      }

      return {
        success: false,
        message: `Invalid email or password. ${MAX_LOGIN_ATTEMPTS - failedAttempts} attempts remaining.`
      };
    }

    // Update last login timestamp
    await this.updateLastLogin(studentLogin.LoginID);

    // Generate JWT token
    const tokenPayload: TokenPayload = {
      loginId: studentLogin.LoginID,
      studentId: studentLogin.StudentID,
      email: studentLogin.Email,
      studentName: studentLogin.StudentName,
      type: 'student'
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: '24h'
    } as jwt.SignOptions);

    return {
      success: true,
      message: 'Login successful',
      token,
      student: {
        studentId: studentLogin.StudentID,
        studentName: studentLogin.StudentName,
        studentNumber: studentLogin.StudentNumber,
        email: studentLogin.Email,
        universityId: studentLogin.UniversityID,
        universityName: studentLogin.UniversityName,
        programId: studentLogin.ProgramID,
        programName: studentLogin.ProgramName,
        riskLevel: studentLogin.RiskLevel
      }
    };
  }

  verifyToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
      return decoded;
    } catch {
      return null;
    }
  }
}

export const studentAuthService = new StudentAuthService();

import bcrypt from 'bcryptjs';
import { sign, verify } from 'hono/jwt';
import { studentAuthRepository } from '../repository/studentAuthRepository';

const JWT_SECRET = 'your-secret-key-change-in-production';

export interface LoginResult {
  success: boolean;
  message: string;
  token?: string;
  student?: {
    id: string;
    studentId: string;
    studentName: string;
    studentNumber: string;
    email: string;
    universityId: string;
    universityName: string;
    programId: string;
    programName: string;
    risk: string;
  };
}

export interface TokenPayload {
  id: string;
  studentId: string;
  email: string;
  studentName: string;
  type: 'student';
  exp?: number;
}

export class StudentAuthService {
  async login(email: string, password: string): Promise<LoginResult> {
    const studentLogin = await studentAuthRepository.findByEmail(email.toLowerCase().trim());

    if (!studentLogin || !studentLogin.isActive) {
      return { success: false, message: 'Invalid email or password or account deactivated' };
    }

    const isPasswordValid = await bcrypt.compare(password, studentLogin.passwordHash);
    if (!isPasswordValid) {
      return { success: false, message: 'Invalid email or password' };
    }

    await studentAuthRepository.updateLastLogin(studentLogin.id);

    const tokenPayload: TokenPayload = {
      id: studentLogin.id,
      studentId: studentLogin.studentId,
      email: studentLogin.email,
      studentName: studentLogin.studentName,
      type: 'student',
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 // 24h
    };

    const token = await sign(tokenPayload, JWT_SECRET);

    return {
      success: true,
      message: 'Login successful',
      token,
      student: {
        id: studentLogin.id,
        studentId: studentLogin.studentId,
        studentName: studentLogin.studentName,
        studentNumber: studentLogin.studentNumber,
        email: studentLogin.email,
        universityId: studentLogin.universityId,
        universityName: studentLogin.universityName,
        programId: studentLogin.programId,
        programName: studentLogin.programName,
        risk: studentLogin.risk
      }
    };
  }

  async verifyToken(token: string): Promise<TokenPayload | null> {
    try {
      const decoded = await verify(token, JWT_SECRET) as unknown as TokenPayload;
      return decoded;
    } catch {
      return null;
    }
  }
}

export const studentAuthService = new StudentAuthService();

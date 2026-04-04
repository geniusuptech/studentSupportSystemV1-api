// Student-specific auth service - delegates to the unified authService for login
// but provides student-specific token verification

import { authService } from './authServices';

export interface LoginResult {
  success: boolean;
  message: string;
  token?: string;
  student?: any;
}

export interface TokenPayload {
  id: string;
  studentId: string;
  email: string;
  studentName: string;
  type: string;
  exp: number;
}

export class StudentAuthService {
  async login(email: string, password: string): Promise<LoginResult> {
    // Use unified auth service for login
    const result = await authService.login({ email, password });
    
    if (!result.success) {
      return { success: false, message: result.message };
    }

    // Verify this is a student user
    if (result.user && result.user.type?.toLowerCase() !== 'student') {
      return { success: false, message: 'This account is not a student account' };
    }

    return {
      success: true,
      message: result.message,
      token: result.token,
      student: result.user ? {
        id: result.user.id,
        studentId: result.user.studentId,
        email: result.user.email,
        studentName: `${result.user.firstName} ${result.user.lastName}`.trim(),
        type: result.user.type
      } : undefined
    };
  }

  async verifyToken(token: string): Promise<TokenPayload | null> {
    const decoded = await authService.validateToken(token);
    if (!decoded) return null;

    return {
      id: decoded.userID,
      studentId: decoded.studentID || decoded.userID,
      email: decoded.email,
      studentName: `${decoded.firstName || ''} ${decoded.lastName || ''}`.trim(),
      type: decoded.userType || 'student',
      exp: decoded.exp || 0
    };
  }
}

export const studentAuthService = new StudentAuthService();
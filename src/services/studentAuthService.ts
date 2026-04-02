// DEPRECATED: This service is no longer used in production
// All authentication now goes through the unified authService (/api/auth endpoints)
// This file is kept to prevent import errors but should not be used

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
    throw new Error('DEPRECATED: Use unified authService instead (/api/auth/login)');
  }

  async verifyToken(token: string): Promise<TokenPayload | null> {
    throw new Error('DEPRECATED: Use unified authService instead');
  }
}

export const studentAuthService = new StudentAuthService();
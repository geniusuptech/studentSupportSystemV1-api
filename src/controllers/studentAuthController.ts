import { Context } from 'hono';
import { studentAuthService } from '../services/studentAuthService';

export class StudentAuthController {
  // Student Login
  login = async (c: Context) => {
    try {
      const { email, password } = await c.req.json();
      if (!email || !password) {
        return c.json({ success: false, error: 'Validation Error', message: 'Email and password are required' }, 400);
      }
      const result = await studentAuthService.login(email, password);
      if (!result.success) {
        return c.json({ success: false, error: 'Authentication Failed', message: result.message }, 401);
      }
      return c.json({ success: true, message: result.message, data: { token: result.token, student: result.student } });
    } catch (error: any) {
      console.error('Login error:', error);
      return c.json({ success: false, error: 'Internal Server Error' }, 500);
    }
  };

  // Verify Token
  verifyToken = async (c: Context) => {
    try {
      const authHeader = c.req.header('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ success: false, error: 'Unauthorized', message: 'No token provided' }, 401);
      }
      const token = authHeader.split(' ')[1] || '';
      const decoded = studentAuthService.verifyToken(token);
      if (!decoded) {
        return c.json({ success: false, error: 'Unauthorized', message: 'Invalid or expired token' }, 401);
      }
      return c.json({ success: true, message: 'Token is valid', data: { id: decoded.id, studentId: decoded.studentId, email: decoded.email, studentName: decoded.studentName } });
    } catch (error: any) {
      console.error('Token verification error:', error);
      return c.json({ success: false, error: 'Internal Server Error' }, 500);
    }
  };

  // Get Current Student (from token)
  getCurrentStudent = async (c: Context) => {
    try {
      const authHeader = c.req.header('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ success: false, error: 'Unauthorized', message: 'No token provided' }, 401);
      }
      const token = authHeader.split(' ')[1] || '';
      const decoded = studentAuthService.verifyToken(token);
      if (!decoded) {
        return c.json({ success: false, error: 'Unauthorized', message: 'Invalid or expired token' }, 401);
      }
      return c.json({ success: true, data: { id: decoded.id, studentId: decoded.studentId, email: decoded.email, studentName: decoded.studentName, type: decoded.type } });
    } catch (error: any) {
      console.error('Get current student error:', error);
      return c.json({ success: false, error: 'Internal Server Error' }, 500);
    }
  };
}

export const studentAuthController = new StudentAuthController();

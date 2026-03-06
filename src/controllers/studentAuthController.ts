import { Request, Response, NextFunction } from 'express';
import { studentAuthService } from '../services/studentAuthService';

export class StudentAuthController {
  /**
   * Student Login
   * POST /api/students/auth/login
   */
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Email and password are required'
        });
        return;
      }

      console.log(`Student login attempt for: ${email}`);

      const result = await studentAuthService.login(email, password);

      if (!result.success) {
        res.status(401).json({
          success: false,
          error: 'Authentication Failed',
          message: result.message
        });
        return;
      }

      console.log(`Student login successful: ${email}`);

      res.json({
        success: true,
        message: result.message,
        data: {
          token: result.token,
          student: result.student
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      next(error);
    }
  };

  /**
   * Verify Token
   * GET /api/students/auth/verify
   */
  verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'No token provided'
        });
        return;
      }

      const token = authHeader.split(' ')[1] || '';
      const decoded = studentAuthService.verifyToken(token);

      if (!decoded) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Invalid or expired token'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Token is valid',
        data: {
          studentId: decoded.studentId,
          email: decoded.email,
          studentName: decoded.studentName
        }
      });
    } catch (error) {
      console.error('Token verification error:', error);
      next(error);
    }
  };

  /**
   * Get Current Student (from token)
   * GET /api/students/auth/me
   */
  getCurrentStudent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'No token provided'
        });
        return;
      }

      const token = authHeader.split(' ')[1] || '';
      const decoded = studentAuthService.verifyToken(token);

      if (!decoded) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Invalid or expired token'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          studentId: decoded.studentId,
          email: decoded.email,
          studentName: decoded.studentName,
          type: decoded.type
        }
      });
    } catch (error) {
      console.error('Get current student error:', error);
      next(error);
    }
  };
}

export const studentAuthController = new StudentAuthController();

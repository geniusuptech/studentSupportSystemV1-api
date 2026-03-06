import { Request, Response, NextFunction } from 'express';
import { validationResult, body } from 'express-validator';
import { authService } from '../services/authServices';
import { LoginRequest, RegisterRequest } from '../models/User';
import { AuthenticatedRequest } from '../middleware/auth';

export class AuthController {
    
    // Validation rules for login
    static validateLogin = [
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Please provide a valid email address'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long'),
    ];
    
    // Validation rules for registration  
    static validateRegister = [
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Please provide a valid email address'),
        body('password')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters long')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
        body('confirmPassword')
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('Passwords do not match');
                }
                return true;
            }),
        body('firstName')
            .isLength({ min: 2 })
            .withMessage('First name must be at least 2 characters long')
            .matches(/^[a-zA-Z\s]+$/)
            .withMessage('First name must contain only letters and spaces'),
        body('lastName')
            .isLength({ min: 2 })
            .withMessage('Last name must be at least 2 characters long')
            .matches(/^[a-zA-Z\s]+$/)
            .withMessage('Last name must contain only letters and spaces'),
        body('userType')
            .isIn(['Student', 'Coordinator', 'Partner'])
            .withMessage('User type must be Student, Coordinator, or Partner'),
    ];
    
    // Validation rules for password change
    static validatePasswordChange = [
        body('currentPassword')
            .notEmpty()
            .withMessage('Current password is required'),
        body('newPassword')
            .isLength({ min: 8 })
            .withMessage('New password must be at least 8 characters long')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
        body('confirmNewPassword')
            .custom((value, { req }) => {
                if (value !== req.body.newPassword) {
                    throw new Error('New passwords do not match');
                }
                return true;
            }),
    ];

    // POST /api/auth/login
    login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    error: 'Validation Error',
                    message: 'Please check your input data',
                    errors: errors.array()
                });
                return;
            }

            const loginData: LoginRequest = req.body;
            const result = await authService.login(loginData);

            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(401).json(result);
            }

        } catch (error) {
            console.error('Login controller error:', error);
            next(error);
        }
    };

    // POST /api/auth/register
    register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    error: 'Validation Error',
                    message: 'Please check your input data',
                    errors: errors.array()
                });
                return;
            }

            const registerData: RegisterRequest = req.body;
            const result = await authService.register(registerData);

            if (result.success) {
                res.status(201).json(result);
            } else {
                res.status(400).json(result);
            }

        } catch (error) {
            console.error('Register controller error:', error);
            next(error);
        }
    };

    // GET /api/auth/me
    getCurrentUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                    message: 'Authentication required'
                });
                return;
            }

            const userId = req.user.userID;
            const user = await authService.getCurrentUser(userId);

            if (!user) {
                res.status(404).json({
                    success: false,
                    error: 'User Not Found',
                    message: 'User account not found'
                });
                return;
            }

            // Remove sensitive information
            const { PasswordHash, ...userWithoutPassword } = user;

            res.status(200).json({
                success: true,
                message: 'User retrieved successfully',
                user: userWithoutPassword
            });

        } catch (error) {
            console.error('Get current user error:', error);
            next(error);
        }
    };

    // POST /api/auth/change-password
    changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                    message: 'Authentication required'
                });
                return;
            }

            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    error: 'Validation Error',
                    message: 'Please check your input data',
                    errors: errors.array()
                });
                return;
            }

            const { currentPassword, newPassword } = req.body;
            const userId = req.user.userID;

            const result = await authService.changePassword(userId, currentPassword, newPassword);

            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(400).json(result);
            }

        } catch (error) {
            console.error('Change password error:', error);
            next(error);
        }
    };

    // POST /api/auth/logout
    logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // For JWT, logout is handled client-side by removing the token
            // You could implement a token blacklist here if needed
            
            res.status(200).json({
                success: true,
                message: 'Logged out successfully'
            });

        } catch (error) {
            console.error('Logout error:', error);
            next(error);
        }
    };

    // POST /api/auth/deactivate
    deactivateAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                    message: 'Authentication required'
                });
                return;
            }

            const { password } = req.body;
            
            if (!password) {
                res.status(400).json({
                    success: false,
                    error: 'Validation Error',
                    message: 'Password is required to deactivate account'
                });
                return;
            }

            const userId = req.user.userID;
            const result = await authService.deactivateAccount(userId, password);

            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(400).json(result);
            }

        } catch (error) {
            console.error('Deactivate account error:', error);
            next(error);
        }
    };

    // GET /api/auth/validate-token
    validateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1];

            if (!token) {
                res.status(400).json({
                    success: false,
                    error: 'Token Required',
                    message: 'No token provided'
                });
                return;
            }

            const tokenData = authService.validateToken(token);

            if (tokenData) {
                res.status(200).json({
                    success: true,
                    message: 'Token is valid',
                    user: tokenData
                });
            } else {
                res.status(401).json({
                    success: false,
                    error: 'Invalid Token',
                    message: 'Token is invalid or expired'
                });
            }

        } catch (error) {
            console.error('Token validation error:', error);
            next(error);
        }
    };
}
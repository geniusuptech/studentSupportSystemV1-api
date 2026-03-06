import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthTokenPayload } from '../models/User';

// Extend Express Request interface to include user
declare global {
    namespace Express {
        interface Request {
            user?: AuthTokenPayload;
        }
    }
}

export interface AuthenticatedRequest extends Request {
    user: AuthTokenPayload;
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        res.status(401).json({
            success: false,
            error: 'Unauthorized',
            message: 'Access token is required'
        });
        return;
    }

    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

    try {
        const decoded = jwt.verify(token, jwtSecret) as AuthTokenPayload;
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Token verification failed:', error);
        
        if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({
                success: false,
                error: 'Token Expired',
                message: 'Access token has expired. Please login again.'
            });
            return;
        }
        
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(403).json({
                success: false,
                error: 'Invalid Token',
                message: 'Invalid access token provided'
            });
            return;
        }
        
        res.status(500).json({
            success: false,
            error: 'Token Verification Error',
            message: 'Failed to verify access token'
        });
    }
};

export const requireRole = (...allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Unauthorized',
                message: 'Authentication required'
            });
            return;
        }

        if (!allowedRoles.includes(req.user.userType)) {
            res.status(403).json({
                success: false,
                error: 'Forbidden',
                message: `Access denied. Required role: ${allowedRoles.join(' or ')}`
            });
            return;
        }

        next();
    };
};

export const requireCoordinatorAccess = requireRole('Coordinator', 'Admin');
export const requireStudentAccess = requireRole('Student', 'Coordinator', 'Admin');
export const requirePartnerAccess = requireRole('Partner', 'Coordinator', 'Admin');
export const requireAdminAccess = requireRole('Admin');

// Optional authentication - doesn't fail if no token provided
export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        next();
        return;
    }

    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

    try {
        const decoded = jwt.verify(token, jwtSecret) as AuthTokenPayload;
        req.user = decoded;
    } catch (error) {
        // Ignore token errors for optional auth
        console.warn('Optional auth token invalid:', error);
    }

    next();
};
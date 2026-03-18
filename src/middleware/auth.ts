import { Context, Next } from 'hono';
import { jwt, sign, verify } from 'hono/jwt';
import { AuthTokenPayload } from '../models/User';

export const authenticateToken = async (c: Context, next: Next) => {
    const authHeader = c.req.header('authorization');
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return c.json({ success: false, error: 'Unauthorized', message: 'Access token is required' }, 401);
    }

    const jwtSecret = c.env.JWT_SECRET || 'your-secret-key-change-in-production';

    try {
        const decoded = await verify(token, jwtSecret, 'HS256') as unknown as AuthTokenPayload;
        c.set('user', decoded);
        await next();
    } catch (error: any) {
        console.error('Token verification failed:', error);
        
        if (error.name === 'JwtTokenExpired') {
            return c.json({ success: false, error: 'Token Expired', message: 'Access token has expired. Please login again.' }, 401);
        }
        
        return c.json({ success: false, error: 'Invalid Token', message: 'Invalid or expired access token provided' }, 401);
    }
};

export const requireRole = (...allowedRoles: string[]) => {
    return async (c: Context, next: Next) => {
        const user = c.get('user') as AuthTokenPayload;
        if (!user) {
            return c.json({ success: false, error: 'Unauthorized', message: 'Authentication required' }, 401);
        }

        const userRole = user.userType.toLowerCase();
        const lowercaseAllowedRoles = allowedRoles.map(r => r.toLowerCase());

        if (!lowercaseAllowedRoles.includes(userRole)) {
            return c.json({ success: false, error: 'Forbidden', message: `Access denied. Required role: ${allowedRoles.join(' or ')}` }, 403);
        }

        await next();
    };
};

export const requireCoordinatorAccess = requireRole('coordinator', 'admin');
export const requireStudentAccess = requireRole('student', 'coordinator', 'admin');
export const requirePartnerAccess = requireRole('partner', 'coordinator', 'admin');
export const requireAdminAccess = requireRole('admin');

export const optionalAuth = async (c: Context, next: Next) => {
    const authHeader = c.req.header('authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        await next();
        return;
    }

    const jwtSecret = c.env.JWT_SECRET || 'your-secret-key-change-in-production';

    try {
        const decoded = await verify(token, jwtSecret, 'HS256') as unknown as AuthTokenPayload;
        c.set('user', decoded);
    } catch (error) {
        console.warn('Optional auth token invalid:', error);
    }

    await next();
};
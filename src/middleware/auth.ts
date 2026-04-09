import { Context, Next } from 'hono';
import { jwt, sign, verify } from 'hono/jwt';
import { getCookie } from 'hono/cookie';
import { AuthTokenPayload } from '../models/User';

export const authenticateToken = async (c: Context, next: Next) => {
  let token = c.req.header('authorization')?.trim() || '';
  
  // Remove "Bearer " prefix if present (case insensitive)
  if (token.toLowerCase().startsWith('bearer ')) {
    token = token.substring(7).trim();
  }
  
  // Guard against "Bearer Bearer" pattern and clean up extra Bearer prefixes
  while (token.toLowerCase().startsWith('bearer ')) {
    token = token.substring(7).trim();
  }
  
  if (!token) {
    token = getCookie(c, 'jwt') || '';
  }
  if (!token) {
    console.warn('No token found in Authorization header or JWT cookie');
    return c.json({ success: false, error: 'Unauthorized', message: 'Access token is required' }, 401);
  }

  const jwtSecret = c.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('JWT_SECRET environment variable is required but not found in c.env');
    throw new Error('JWT_SECRET environment variable is required');
  }

  try {
    console.log('Token verification attempt - Secret length:', jwtSecret.length, 'Token length:', token?.length);
    const decoded = await verify(token, jwtSecret, 'HS256') as unknown as AuthTokenPayload;
    console.log('Token verified successfully for user:', decoded.userID);
    c.set('user', decoded);
    await next();
  } catch (error: any) {
    console.error('Token verification failed:', error.message, 'Error name:', error.name);
    console.error('Token value (first 50 chars):', token?.substring(0, 50));
    console.error('Secret value (first 50 chars):', jwtSecret?.substring(0, 50));
    
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
    let token = c.req.header('authorization')?.trim() || '';

    // Remove "Bearer " prefix if present (case insensitive)
    if (token.toLowerCase().startsWith('bearer ')) {
        token = token.substring(7).trim();
    }
    
    // Guard against "Bearer Bearer" pattern and clean up extra Bearer prefixes
    while (token.toLowerCase().startsWith('bearer ')) {
        token = token.substring(7).trim();
    }

    if (!token) {
        await next();
        return;
    }

    const jwtSecret = c.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('[optionalAuth] JWT_SECRET environment variable is required but not found');
      await next();
      return;
    }

    try {
        console.log('[optionalAuth] Attempting to verify token');
        const decoded = await verify(token, jwtSecret, 'HS256') as unknown as AuthTokenPayload;
        console.log('[optionalAuth] Token verified successfully');
        c.set('user', decoded);
    } catch (error) {
        console.warn('[optionalAuth] Token verification failed:', error instanceof Error ? error.message : error);
    }

    await next();
};
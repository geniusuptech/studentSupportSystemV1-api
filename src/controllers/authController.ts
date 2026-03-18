import { Context } from 'hono';
import { authService } from '../services/authServices';

export class AuthController {
    // Validation rules (empty since express-validator is removed)
    static validateLogin = [];
    static validateRegister = [];
    static validatePasswordChange = [];

    // POST /api/auth/login
    login = async (c: Context) => {
        try {
            const body = await c.req.json();
            const result = await authService.login(body);
            return c.json(result, result.success ? 200 : 401);
        } catch (error: any) {
            return c.json({ success: false, error: 'Internal Server Error' }, 500);
        }
    };

    // POST /api/auth/register
    register = async (c: Context) => {
        try {
            const body = await c.req.json();
            const result = await authService.register(body);
            return c.json(result, result.success ? 201 : 400);
        } catch (error: any) {
            return c.json({ success: false, error: 'Internal Server Error' }, 500);
        }
    };

    // GET /api/auth/me
    getCurrentUser = async (c: Context) => {
        try {
            // In Hono, we use c.get('user') if set by middleware, 
            // but the adapter logic was adding it to req.user.
            // For now, we'll assume the middleware sets it in Context.
            const userPayload = c.get('user');
            if (!userPayload) return c.json({ success: false, message: 'Unauthorized' }, 401);

            const user = await authService.getCurrentUser(userPayload.userID);
            if (!user) return c.json({ success: false, message: 'User not found' }, 404);

            const { passwordHash, ...userWithoutPassword } = user;
            return c.json({ success: true, data: userWithoutPassword });
        } catch (error: any) {
            return c.json({ success: false, error: 'Internal Server Error' }, 500);
        }
    };

    // POST /api/auth/change-password
    changePassword = async (c: Context) => {
        try {
            const userPayload = c.get('user');
            if (!userPayload) return c.json({ success: false, message: 'Unauthorized' }, 401);

            const { currentPassword, newPassword } = await c.req.json();
            const result = await authService.changePassword(userPayload.userID, currentPassword, newPassword);
            return c.json(result, result.success ? 200 : 400);
        } catch (error: any) {
            return c.json({ success: false, error: 'Internal Server Error' }, 500);
        }
    };

    logout = async (c: Context) => {
        return c.json({ success: true, message: 'Logged out successfully' });
    };

    validateToken = async (c: Context) => {
        const authHeader = c.req.header('authorization');
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) return c.json({ success: false, message: 'No token provided' }, 400);

        const tokenData = authService.validateToken(token);
        if (tokenData) {
            return c.json({ success: true, user: tokenData });
        } else {
            return c.json({ success: false, message: 'Invalid token' }, 401);
        }
    };

    deactivateAccount = async (c: Context) => {
        try {
            const userPayload = c.get('user');
            if (!userPayload) return c.json({ success: false, message: 'Unauthorized' }, 401);

            const { password } = await c.req.json();
            const result = await authService.deactivateAccount(userPayload.userID, password);
            return c.json(result, result.success ? 200 : 400);
        } catch (error: any) {
            return c.json({ success: false, error: 'Internal Server Error' }, 500);
        }
    };
}

export const authController = new AuthController();
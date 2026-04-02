import { Context } from 'hono';
import { setCookie, deleteCookie } from 'hono/cookie';
import { authService } from '../services/authServices';


export class AuthController {
    // Validation rules (empty since express-validator is removed)
    static validateLogin = [];
    static validateRegister = [];
    static validatePasswordChange = [];

    // POST /api/auth/login - Unified login endpoint for all user types (student, coordinator, partner, admin)
    // Accepts LoginRequest { email, password }, generates JWT cookie, returns user with userType for frontend routing
    login = async (c: Context) => {
        try {
            const body = await c.req.json(); // LoginRequest: { email, password }
            const result = await authService.login(body);
            if (result.success && result.token) {
              setCookie(c, 'jwt', result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 // 24h
              });
            }
            return c.json(result, result.success ? 200 : 401);
        } catch (error: any) {
            console.error('Login error:', error.message);
            return c.json({ success: false, message: 'Login failed', error: error.message }, 500);
        }
    };

    // POST /api/auth/register - Register new user with all required fields
    register = async (c: Context) => {
        try {
            const body = await c.req.json();
            const { email, password, userType, firstName, lastName, studentID, coordinatorID, partnerID } = body;
            
            // Validate required fields
            if (!email || !password || !userType || !firstName || !lastName) {
                return c.json({ 
                    success: false, 
                    message: 'Email, password, userType, firstName, and lastName are required' 
                }, 400);
            }

            // Create a proper RegisterRequest object
            const registerRequest = {
                email, 
                password, 
                confirmPassword: password, // Auto-confirm for API registration
                userType, 
                firstName, 
                lastName, 
                studentID, 
                coordinatorID, 
                partnerID
            };

            const result = await authService.register(registerRequest);
            
            return c.json(result, result.success ? 201 : 400);
        } catch (error: any) {
            console.error('Registration error:', error.message);
            return c.json({ success: false, message: 'Registration failed', error: error.message }, 500);
        }
    };

    // POST /api/auth/update-password - Update password for existing user
    updatePassword = async (c: Context) => {
        try {
            const body = await c.req.json();
            const { email, newPassword } = body;
            
            if (!email || !newPassword) {
                return c.json({ 
                    success: false, 
                    message: 'Email and newPassword are required' 
                }, 400);
            }

            const result = await authService.updatePassword(email, newPassword);
            return c.json(result, result.success ? 200 : 400);
        } catch (error: any) {
            console.error('Password update error:', error.message);
            return c.json({ success: false, message: 'Password update failed', error: error.message }, 500);
        }
    };

    // GET /api/auth/users - Get all users (for password setup)
    getAllUsers = async (c: Context) => {
        try {
            const users = await authService.getAllUsers();
            return c.json({ success: true, users });
        } catch (error: any) {
            console.error('Get users error:', error.message);
            return c.json({ success: false, message: 'Failed to get users', error: error.message }, 500);
        }
    };

    // GET /api/auth/users/:id - Get user by ID
    getUserById = async (c: Context) => {
        try {
            const id = c.req.param('id');
            if (!id) {
                return c.json({ success: false, message: 'User ID is required' }, 400);
            }
            const user = await authService.getUserById(id);
            
            if (!user) {
                return c.json({ success: false, message: 'User not found' }, 404);
            }
            
            return c.json({ success: true, user });
        } catch (error: any) {
            console.error('Get user error:', error.message);
            return c.json({ success: false, message: 'Failed to get user', error: error.message }, 500);
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

    // GET /api/auth/user-details - Unified endpoint for getting user details with userType for frontend routing
    getUserDetails = async (c: Context) => {
        try {
            const userPayload = c.get('user');
            if (!userPayload) return c.json({ success: false, message: 'Unauthorized' }, 401);

            const user = await authService.getCurrentUser(userPayload.userID);
            if (!user) return c.json({ success: false, message: 'User not found' }, 404);

            // Return user details specifically formatted for frontend routing
            return c.json({ 
                success: true, 
                user: {
                    id: user.id,
                    email: user.email,
                    userType: user.role, // This is key for frontend routing
                    firstName: user.firstName,
                    lastName: user.lastName,
                    profilePictureUrl: user.profilePictureUrl,
                    studentId: user.studentId,
                    coordinatorId: user.coordinatorId,
                    partnerId: user.partnerId,
                    isActive: user.isActive,
                    lastLoginAt: user.lastLoginAt
                }
            });
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
        // Clear the JWT cookie
        deleteCookie(c, 'jwt');
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
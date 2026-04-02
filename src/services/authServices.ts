import bcrypt from 'bcryptjs';
import { sign, verify } from 'hono/jwt';
import { authRepository } from '../repository/authRepository';
import { User, LoginRequest, LoginResponse, RegisterRequest, AuthTokenPayload } from '../models/User';

export class AuthService {
    private secret: string = 'your-secret-key-change-in-production';

    setSecret(secret: string) {
        this.secret = secret;
    }

    async login(loginData: LoginRequest): Promise<LoginResponse> {
        try {
            const { email, password } = loginData;
            const user = await authRepository.getUserByEmail(email);

            if (!user || !user.isActive) {
                return { success: false, message: 'Invalid email or password or account deactivated' };
            }

            // Check if user needs to set a password
            if (user.passwordHash === 'NEEDS_PASSWORD_RESET') {
                return { 
                    success: false, 
                    message: 'Password not set. Please use the update-password endpoint to set your password first.',
                    needsPasswordReset: true
                };
            }

            const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
            if (!isPasswordValid) {
                return { success: false, message: 'Invalid email or password' };
            }

            const tokenPayload: AuthTokenPayload = {
                userID: user.id,
                email: user.email,
                userType: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                studentID: user.studentId,
                coordinatorID: user.coordinatorId,
                partnerID: user.partnerId,
                exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 // 24h
            };

            const token = await sign(tokenPayload, this.secret);
            await authRepository.updateLastLoginAt(user.id);

            return {
                success: true,
                message: 'Login successful',
                user: {
                    id: user.id,
                    email: user.email,
                    type: user.role,
                    firstName: user.firstName || '',
                    lastName: user.lastName || '',
                    studentId: user.studentId,
                    coordinatorId: user.coordinatorId,
                    partnerId: user.partnerId
                },
                token,
                expiresIn: '24h'
            };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'An error occurred during login.' };
        }
    }

    async register(registerData: RegisterRequest): Promise<LoginResponse> {
        try {
            const { email, password, confirmPassword } = registerData;
            if (password !== confirmPassword) {
                return { success: false, message: 'Passwords do not match' };
            }

            const existingUser = await authRepository.getUserByEmail(email);
            if (existingUser) {
                return { success: false, message: 'User with this email already exists' };
            }

            const passwordHash = await bcrypt.hash(password, 12);
            const newUser = await authRepository.createUser(registerData, passwordHash);

            const tokenPayload: AuthTokenPayload = {
                userID: newUser.id,
                email: newUser.email,
                userType: newUser.role,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                studentID: newUser.studentId,
                coordinatorID: newUser.coordinatorId,
                partnerID: newUser.partnerId,
                exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 // 24h
            };

            const token = await sign(tokenPayload, this.secret);

            return {
                success: true,
                message: 'Account created successfully',
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    type: newUser.role,
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    studentId: newUser.studentId,
                    coordinatorId: newUser.coordinatorId,
                    partnerId: newUser.partnerId
                },
                token,
                expiresIn: '24h'
            };
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, message: 'An error occurred during registration.' };
        }
    }

    async getCurrentUser(userId: string): Promise<User | null> {
        return authRepository.getUserById(userId);
    }

    async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
        try {
            const user = await authRepository.getUserById(userId);
            if (!user) return { success: false, message: 'User not found' };

            const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
            if (!isCurrentPasswordValid) return { success: false, message: 'Current password is incorrect' };

            const newPasswordHash = await bcrypt.hash(newPassword, 12);
            await authRepository.updatePassword(userId, newPasswordHash);

            return { success: true, message: 'Password updated successfully' };
        } catch (error) {
            console.error('Change password error:', error);
            return { success: false, message: 'An error occurred while changing password' };
        }
    }

    async validateToken(token: string): Promise<AuthTokenPayload | null> {
        try {
            return await verify(token, this.secret, 'HS256') as unknown as AuthTokenPayload;
        } catch (error) {
            console.error('Token validation error:', error);
            return null;
        }
    }

    async deactivateAccount(userId: string, password: string): Promise<{ success: boolean; message: string }> {
        try {
            const user = await authRepository.getUserById(userId);
            if (!user) return { success: false, message: 'User not found' };

            const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
            if (!isPasswordValid) return { success: false, message: 'Password is incorrect' };

            await authRepository.deactivateUser(userId);
            return { success: true, message: 'Account deactivated successfully' };
        } catch (error) {
            console.error('Deactivate account error:', error);
            return { success: false, message: 'An error occurred while deactivating account' };
        }
    }

    async updatePassword(email: string, newPassword: string): Promise<{ success: boolean; message: string }> {
        try {
            const user = await authRepository.getUserByEmail(email);
            if (!user) {
                return { success: false, message: 'User not found' };
            }

            const newPasswordHash = await bcrypt.hash(newPassword, 12);
            await authRepository.updatePasswordByEmail(email, newPasswordHash);

            return { success: true, message: 'Password updated successfully' };
        } catch (error) {
            console.error('Update password error:', error);
            return { success: false, message: 'An error occurred while updating password' };
        }
    }

    async getAllUsers(): Promise<User[]> {
        try {
            return await authRepository.getAllUsers();
        } catch (error) {
            console.error('Get all users error:', error);
            return [];
        }
    }

    async getUserById(id: string): Promise<User | null> {
        try {
            return await authRepository.getUserById(id);
        } catch (error) {
            console.error('Get user by ID error:', error);
            return null;
        }
    }
}

export const authService = new AuthService();
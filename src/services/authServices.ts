import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authRepository } from '../repository/authRepository';
import { User, LoginRequest, LoginResponse, RegisterRequest, AuthTokenPayload } from '../models/User';
import { getJwtExpiresIn, getJwtSecret } from '../config/security';

export class AuthService {
    
    async login(loginData: LoginRequest): Promise<LoginResponse> {
        try {
            const { email, password } = loginData;
            
            // Get user by email
            const user = await authRepository.getUserByEmail(email);
            
            if (!user) {
                return {
                    success: false,
                    message: 'Invalid email or password'
                };
            }
            
            // Check if user is active
            if (!user.IsActive) {
                return {
                    success: false,
                    message: 'Account has been deactivated. Please contact support.'
                };
            }
            
            // Verify password
            const isPasswordValid = await bcrypt.compare(password, user.PasswordHash);
            
            if (!isPasswordValid) {
                return {
                    success: false,
                    message: 'Invalid email or password'
                };
            }
            
            // Generate JWT token
            const tokenPayload: AuthTokenPayload = {
                userID: user.UserID,
                email: user.Email,
                userType: user.UserType,
                firstName: user.FirstName,
                lastName: user.LastName,
                studentID: user.StudentID,
                coordinatorID: user.CoordinatorID,
                partnerID: user.PartnerID
            };
            
            const jwtSecret = getJwtSecret();
            const expiresIn = getJwtExpiresIn();
            
            const token = jwt.sign(tokenPayload, jwtSecret as string, { expiresIn: expiresIn as any });
            
            // Update last login date
            await authRepository.updateLastLoginAt(user.UserID, user.UserType);
            
            return {
                success: true,
                message: 'Login successful',
                user: {
                    UserID: user.UserID,
                    Email: user.Email,
                    UserType: user.UserType,
                    FirstName: user.FirstName,
                    LastName: user.LastName,
                    ProfilePictureURL: user.ProfilePictureURL,
                    StudentID: user.StudentID,
                    CoordinatorID: user.CoordinatorID,
                    PartnerID: user.PartnerID
                },
                token,
                expiresIn
            };
            
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: 'An error occurred during login. Please try again.'
            };
        }
    }
    
    async register(registerData: RegisterRequest): Promise<LoginResponse> {
        try {
            const { email, password, confirmPassword, firstName, lastName, userType } = registerData;
            
            // Validate password confirmation
            if (password !== confirmPassword) {
                return {
                    success: false,
                    message: 'Passwords do not match'
                };
            }
            
            // Check if user already exists
            const existingUser = await authRepository.getUserByEmail(email);
            if (existingUser) {
                return {
                    success: false,
                    message: 'User with this email already exists'
                };
            }
            
            // Hash password
            const saltRounds = 12;
            const passwordHash = await bcrypt.hash(password, saltRounds);
            
            // Create user
            const newUser = await authRepository.createUser(registerData, passwordHash);
            
            // Generate JWT token for immediate login
            const tokenPayload: AuthTokenPayload = {
                userID: newUser.UserID,
                email: newUser.Email,
                userType: newUser.UserType,
                firstName: newUser.FirstName,
                lastName: newUser.LastName,
                studentID: newUser.StudentID,
                coordinatorID: newUser.CoordinatorID,
                partnerID: newUser.PartnerID
            };
            
            const jwtSecret = getJwtSecret();
            const expiresIn = getJwtExpiresIn();
            
            const token = jwt.sign(tokenPayload, jwtSecret as string, { expiresIn: expiresIn as any });
            
            return {
                success: true,
                message: 'Account created successfully',
                user: {
                    UserID: newUser.UserID,
                    Email: newUser.Email,
                    UserType: newUser.UserType,
                    FirstName: newUser.FirstName,
                    LastName: newUser.LastName,
                    ProfilePictureURL: newUser.ProfilePictureURL,
                    StudentID: newUser.StudentID,
                    CoordinatorID: newUser.CoordinatorID,
                    PartnerID: newUser.PartnerID
                },
                token,
                expiresIn
            };
            
        } catch (error) {
            console.error('Registration error:', error);
            
            if (error instanceof Error && error.message.includes('already exists')) {
                return {
                    success: false,
                    message: error.message
                };
            }
            
            return {
                success: false,
                message: 'An error occurred during registration. Please try again.'
            };
        }
    }
    
    async getCurrentUser(userId: number): Promise<User | null> {
        try {
            return await authRepository.getUserById(userId);
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }
    
    async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
        try {
            // Get current user
            const user = await authRepository.getUserById(userId);
            if (!user) {
                return {
                    success: false,
                    message: 'User not found'
                };
            }
            
            // Verify current password
            const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.PasswordHash);
            if (!isCurrentPasswordValid) {
                return {
                    success: false,
                    message: 'Current password is incorrect'
                };
            }
            
            // Hash new password
            const saltRounds = 12;
            const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
            
            // Update password
            await authRepository.updatePassword(userId, newPasswordHash);
            
            return {
                success: true,
                message: 'Password updated successfully'
            };
            
        } catch (error) {
            console.error('Change password error:', error);
            return {
                success: false,
                message: 'An error occurred while changing password'
            };
        }
    }
    
    async deactivateAccount(userId: number, password: string): Promise<{ success: boolean; message: string }> {
        try {
            // Get current user
            const user = await authRepository.getUserById(userId);
            if (!user) {
                return {
                    success: false,
                    message: 'User not found'
                };
            }
            
            // Verify password
            const isPasswordValid = await bcrypt.compare(password, user.PasswordHash);
            if (!isPasswordValid) {
                return {
                    success: false,
                    message: 'Password is incorrect'
                };
            }
            
            // Deactivate user
            await authRepository.deactivateUser(userId);
            
            return {
                success: true,
                message: 'Account deactivated successfully'
            };
            
        } catch (error) {
            console.error('Deactivate account error:', error);
            return {
                success: false,
                message: 'An error occurred while deactivating account'
            };
        }
    }
    
    validateToken(token: string): AuthTokenPayload | null {
        try {
            return jwt.verify(token, getJwtSecret()) as AuthTokenPayload;
        } catch (error) {
            console.error('Token validation error:', error);
            return null;
        }
    }
}

export const authService = new AuthService();

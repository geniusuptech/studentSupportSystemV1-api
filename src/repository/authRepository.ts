import databaseService from '../config/database';
import { User, RegisterRequest } from '../models/User';

export class AuthRepository {
    
    async getUserByEmail(email: string): Promise<User | null> {
        try {
            const query = `
                SELECT 
                    u.UserID,
                    u.Email,
                    u.PasswordHash,
                    u.UserType,
                    u.FirstName,
                    u.LastName,
                    u.ProfilePictureURL,
                    u.IsActive,
                    u.IsEmailVerified,
                    u.LastLoginDate,
                    u.CreatedAt,
                    u.UpdatedAt,
                    u.StudentID,
                    u.CoordinatorID,
                    u.PartnerID
                FROM Users u
                WHERE u.Email = @Email AND u.IsActive = 1
            `;
            
            const result = await databaseService.executeQuery<User>(query, { Email: email });
            
            if (result.length === 0) {
                return null;
            }
            
            return result[0] as User;
        } catch (error) {
            console.error('Error getting user by email:', error);
            throw new Error('Failed to retrieve user by email');
        }
    }
    
    async getUserById(userId: number, userType?: string): Promise<User | null> {
        try {
            const query = `
                SELECT 
                    u.UserID,
                    u.Email,
                    u.PasswordHash,
                    u.UserType,
                    u.FirstName,
                    u.LastName,
                    u.ProfilePictureURL,
                    u.IsActive,
                    u.IsEmailVerified,
                    u.LastLoginDate,
                    u.CreatedAt,
                    u.UpdatedAt,
                    u.StudentID,
                    u.CoordinatorID,
                    u.PartnerID
                FROM Users u
                WHERE u.UserID = @UserID AND u.IsActive = 1
            `;
            
            const result = await databaseService.executeQuery<User>(query, { UserID: userId });
            
            if (result.length === 0) {
                return null;
            }
            
            return result[0] as User;
        } catch (error) {
            console.error('Error getting user by ID:', error);
            throw new Error('Failed to retrieve user by ID');
        }
    }
    
    async createUser(userData: RegisterRequest, passwordHash: string): Promise<User> {
        try {
            const query = `
                INSERT INTO Users (
                    Email, PasswordHash, UserType, FirstName, LastName, 
                    StudentID, CoordinatorID, PartnerID, 
                    IsActive, IsEmailVerified, CreatedAt, UpdatedAt
                )
                OUTPUT 
                    INSERTED.UserID,
                    INSERTED.Email,
                    INSERTED.PasswordHash,
                    INSERTED.UserType,
                    INSERTED.FirstName,
                    INSERTED.LastName,
                    INSERTED.ProfilePictureURL,
                    INSERTED.IsActive,
                    INSERTED.IsEmailVerified,
                    INSERTED.LastLoginDate,
                    INSERTED.CreatedAt,
                    INSERTED.UpdatedAt,
                    INSERTED.StudentID,
                    INSERTED.CoordinatorID,
                    INSERTED.PartnerID
                VALUES (
                    @Email, @PasswordHash, @UserType, @FirstName, @LastName,
                    @StudentID, @CoordinatorID, @PartnerID,
                    1, 0, GETDATE(), GETDATE()
                )
            `;
            
            const result = await databaseService.executeQuery<User>(query, {
                Email: userData.email,
                PasswordHash: passwordHash,
                UserType: userData.userType,
                FirstName: userData.firstName,
                LastName: userData.lastName,
                StudentID: userData.studentID || null,
                CoordinatorID: userData.coordinatorID || null,
                PartnerID: userData.partnerID || null
            });
            
            return result[0] as User;
        } catch (error) {
            console.error('Error creating user:', error);
            if ((error as any).number === 2627) { // Duplicate key error
                throw new Error('User with this email already exists');
            }
            throw new Error('Failed to create user account');
        }
    }
    
    async updateLastLoginAt(userId: number, userType?: string): Promise<void> {
        try {
            const query = `
                UPDATE Users 
                SET LastLoginDate = GETDATE(), UpdatedAt = GETDATE()
                WHERE UserID = @UserID
            `;
            await databaseService.executeQuery(query, { UserID: userId });
        } catch (error) {
            console.error('Error updating last login date:', error);
            // This is not critical, so we don't throw
        }
    }
    
    async updatePassword(userId: number, newPasswordHash: string): Promise<void> {
        try {
            const query = `
                UPDATE Users 
                SET PasswordHash = @PasswordHash, UpdatedAt = GETDATE()
                WHERE UserID = @UserID
            `;
            await databaseService.executeQuery(query, { UserID: userId, PasswordHash: newPasswordHash });
        } catch (error) {
            console.error('Error updating password:', error);
            throw new Error('Failed to update password');
        }
    }
    
    async deactivateUser(userId: number): Promise<void> {
        try {
            const query = `
                UPDATE Users 
                SET IsActive = 0, UpdatedAt = GETDATE()
                WHERE UserID = @UserID
            `;
            await databaseService.executeQuery(query, { UserID: userId });
        } catch (error) {
            console.error('Error deactivating user:', error);
            throw new Error('Failed to deactivate user');
        }
    }
}

export const authRepository = new AuthRepository();

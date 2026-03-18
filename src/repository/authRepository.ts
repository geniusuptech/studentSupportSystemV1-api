import databaseService from '../config/database';
import { User, RegisterRequest } from '../models/User';

export class AuthRepository {
    private mapUser(u: any): User {
        return {
            id: u.UserID,
            email: u.Email,
            passwordHash: u.PasswordHash,
            role: u.UserType as any,
            firstName: u.FirstName,
            lastName: u.LastName,
            isActive: u.IsActive,
            isEmailVerified: u.IsEmailVerified,
            lastLoginAt: u.LastLoginDate,
            createdAt: u.CreatedAt,
            updatedAt: u.UpdatedAt,
            studentId: u.StudentID,
            coordinatorId: u.CoordinatorID,
            partnerId: u.PartnerID
        };
    }

    async getUserByEmail(email: string): Promise<User | null> {
        const query = `SELECT * FROM Users WHERE Email = @email AND IsActive = 1`;
        const data = await databaseService.executeQuery(query, { email });

        if (data.length === 0) return null;
        return this.mapUser(data[0]);
    }

    async getUserById(id: string | number): Promise<User | null> {
        const query = `SELECT * FROM Users WHERE UserID = @id AND IsActive = 1`;
        const data = await databaseService.executeQuery(query, { id });

        if (data.length === 0) return null;
        return this.mapUser(data[0]);
    }

    async createUser(userData: RegisterRequest, passwordHash: string): Promise<User> {
        const query = `
            INSERT INTO Users (Email, PasswordHash, UserType, FirstName, LastName, StudentID, CoordinatorID, PartnerID, IsActive, IsEmailVerified, CreatedAt, UpdatedAt)
            VALUES (@email, @passwordHash, @role, @firstName, @lastName, @studentId, @coordinatorId, @partnerId, 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING *
        `;
        
        const params = {
            email: userData.email,
            passwordHash: passwordHash,
            role: userData.userType,
            firstName: userData.firstName,
            lastName: userData.lastName,
            studentId: userData.studentID || null,
            coordinatorId: userData.coordinatorID || null,
            partnerId: userData.partnerID || null
        };

        const data = await databaseService.executeQuery(query, params);
        return this.mapUser(data[0]);
    }

    async updateLastLoginAt(id: string | number): Promise<void> {
        const query = `UPDATE Users SET LastLoginDate = CURRENT_TIMESTAMP, UpdatedAt = CURRENT_TIMESTAMP WHERE UserID = @id`;
        await databaseService.executeQuery(query, { id });
    }

    async updatePassword(id: string | number, newPasswordHash: string): Promise<void> {
        const query = `UPDATE Users SET PasswordHash = @newPasswordHash, UpdatedAt = CURRENT_TIMESTAMP WHERE UserID = @id`;
        await databaseService.executeQuery(query, { id, newPasswordHash });
    }

    async deactivateUser(id: string | number): Promise<void> {
        const query = `UPDATE Users SET IsActive = 0, UpdatedAt = CURRENT_TIMESTAMP WHERE UserID = @id`;
        await databaseService.executeQuery(query, { id });
    }
}

export const authRepository = new AuthRepository();
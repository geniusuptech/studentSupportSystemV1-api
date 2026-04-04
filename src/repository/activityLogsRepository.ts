import databaseService from '../config/database';

export interface ActivityLog {
    id: number;
    userType: string;
    userId: number;
    action: string;
    entityType?: string;
    entityId?: number;
    details?: string;
    ipAddress?: string;
    createdAt: string;
}

export class ActivityLogsRepository {
    async createLog(data: {
        userType: string;
        userId: number | string;
        action: string;
        entityType?: string;
        entityId?: number | string;
        details?: string;
        ipAddress?: string;
    }): Promise<ActivityLog> {
        const query = `
            INSERT INTO ActivityLogs (UserType, UserID, Action, EntityType, EntityID, Details, IPAddress, CreatedAt)
            VALUES (@userType, @userId, @action, @entityType, @entityId, @details, @ipAddress, CURRENT_TIMESTAMP)
            RETURNING *
        `;
        const params = {
            userType: data.userType,
            userId: data.userId,
            action: data.action,
            entityType: data.entityType || null,
            entityId: data.entityId || null,
            details: data.details || null,
            ipAddress: data.ipAddress || null
        };
        const result = await databaseService.executeQuery(query, params);
        return this.mapLog(result[0]);
    }

    async getLogs(filters: any = {}): Promise<ActivityLog[]> {
        let query = `SELECT * FROM ActivityLogs WHERE 1=1`;
        const params: any = {};

        if (filters.userType) {
            query += ` AND UserType = @userType`;
            params.userType = filters.userType;
        }
        if (filters.userId) {
            query += ` AND UserID = @userId`;
            params.userId = filters.userId;
        }
        if (filters.action) {
            query += ` AND Action LIKE @action`;
            params.action = `%${filters.action}%`;
        }
        if (filters.entityType) {
            query += ` AND EntityType = @entityType`;
            params.entityType = filters.entityType;
        }
        if (filters.startDate) {
            query += ` AND CreatedAt >= @startDate`;
            params.startDate = filters.startDate;
        }
        if (filters.endDate) {
            query += ` AND CreatedAt <= @endDate`;
            params.endDate = filters.endDate;
        }

        query += ` ORDER BY CreatedAt DESC`;

        if (filters.limit) {
            query += ` LIMIT ${parseInt(filters.limit)}`;
        } else {
            query += ` LIMIT 100`;
        }

        const data = await databaseService.executeQuery(query, params);
        return data.map(l => this.mapLog(l));
    }

    async getLogsByEntity(entityType: string, entityId: string | number): Promise<ActivityLog[]> {
        const query = `
            SELECT * FROM ActivityLogs 
            WHERE EntityType = @entityType AND EntityID = @entityId
            ORDER BY CreatedAt DESC
            LIMIT 50
        `;
        const data = await databaseService.executeQuery(query, { entityType, entityId });
        return data.map(l => this.mapLog(l));
    }

    async updateLogStatus(logId: string | number, details: string): Promise<void> {
        const query = `UPDATE ActivityLogs SET Details = @details WHERE LogID = @id`;
        await databaseService.executeQuery(query, { id: logId, details });
    }

    private mapLog(l: any): ActivityLog {
        return {
            id: l.LogID,
            userType: l.UserType,
            userId: l.UserID,
            action: l.Action,
            entityType: l.EntityType,
            entityId: l.EntityID,
            details: l.Details,
            ipAddress: l.IPAddress,
            createdAt: l.CreatedAt
        };
    }
}

export const activityLogsRepository = new ActivityLogsRepository();

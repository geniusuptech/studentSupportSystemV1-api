import databaseService from '../config/database';

export interface Intervention {
    id: number;
    studentId: number;
    studentName?: string;
    coordinatorId?: number;
    coordinatorName?: string;
    type: string;
    interventionTypeId?: number;
    interventionType?: string;
    riskLevel?: string;
    notes?: string;
    status: string;
    priority: string;
    followUpDate?: string;
    completedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export class InterventionsRepository {
    async getActiveInterventions(filters: any = {}): Promise<Intervention[]> {
        let query = `
            SELECT i.*, s.StudentName, c.CoordinatorName
            FROM Interventions i
            JOIN Students s ON i.StudentID = s.StudentID
            LEFT JOIN Coordinators c ON i.CoordinatorID = c.CoordinatorID
            WHERE i.Status IN ('Active', 'Pending')
        `;
        const params: any = {};

        if (filters.coordinatorId) {
            query += ` AND i.CoordinatorID = @coordinatorId`;
            params.coordinatorId = filters.coordinatorId;
        }
        if (filters.studentId) {
            query += ` AND i.StudentID = @studentId`;
            params.studentId = filters.studentId;
        }
        if (filters.priority) {
            query += ` AND i.Priority = @priority`;
            params.priority = filters.priority;
        }

        query += ` ORDER BY i.CreatedAt DESC`;

        const data = await databaseService.executeQuery(query, params);
        return data.map(i => this.mapIntervention(i));
    }

    async getAllInterventions(filters: any = {}): Promise<Intervention[]> {
        let query = `
            SELECT i.*, s.StudentName, c.CoordinatorName
            FROM Interventions i
            JOIN Students s ON i.StudentID = s.StudentID
            LEFT JOIN Coordinators c ON i.CoordinatorID = c.CoordinatorID
            WHERE 1=1
        `;
        const params: any = {};

        if (filters.status) {
            query += ` AND i.Status = @status`;
            params.status = filters.status;
        }
        if (filters.coordinatorId) {
            query += ` AND i.CoordinatorID = @coordinatorId`;
            params.coordinatorId = filters.coordinatorId;
        }
        if (filters.studentId) {
            query += ` AND i.StudentID = @studentId`;
            params.studentId = filters.studentId;
        }

        query += ` ORDER BY i.CreatedAt DESC`;

        if (filters.limit) {
            query += ` LIMIT ${parseInt(filters.limit)}`;
        } else {
            query += ` LIMIT 100`;
        }

        const data = await databaseService.executeQuery(query, params);
        return data.map(i => this.mapIntervention(i));
    }

    async getInterventionById(id: string | number): Promise<Intervention | null> {
        const query = `
            SELECT i.*, s.StudentName, c.CoordinatorName
            FROM Interventions i
            JOIN Students s ON i.StudentID = s.StudentID
            LEFT JOIN Coordinators c ON i.CoordinatorID = c.CoordinatorID
            WHERE i.InterventionID = @id
        `;
        const data = await databaseService.executeQuery(query, { id });
        if (data.length === 0) return null;
        return this.mapIntervention(data[0]);
    }

    async createIntervention(data: any): Promise<Intervention> {
        const query = `
            INSERT INTO Interventions (StudentID, CoordinatorID, Type, InterventionTypeID, Notes, Status, Priority, FollowUpDate, CreatedAt, UpdatedAt)
            VALUES (@studentId, @coordinatorId, @type, @interventionTypeId, @notes, @status, @priority, @followUpDate, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING *
        `;
        const params = {
            studentId: data.studentId,
            coordinatorId: data.coordinatorId || null,
            type: data.type,
            interventionTypeId: data.interventionType || null,
            notes: data.notes || null,
            status: data.status || 'Active',
            priority: data.priority || data.riskLevel || 'Medium',
            followUpDate: data.followUpDate || null
        };
        const result = await databaseService.executeQuery(query, params);
        return this.mapIntervention(result[0]);
    }

    async updateIntervention(id: string | number, data: any): Promise<Intervention | null> {
        const fields: string[] = [];
        const params: any = { id };

        if (data.type !== undefined) { fields.push('Type = @type'); params.type = data.type; }
        if (data.notes !== undefined) { fields.push('Notes = @notes'); params.notes = data.notes; }
        if (data.status !== undefined) { fields.push('Status = @status'); params.status = data.status; }
        if (data.priority !== undefined) { fields.push('Priority = @priority'); params.priority = data.priority; }
        if (data.followUpDate !== undefined) { fields.push('FollowUpDate = @followUpDate'); params.followUpDate = data.followUpDate; }
        if (data.status === 'Completed') { fields.push('CompletedAt = CURRENT_TIMESTAMP'); }

        if (fields.length === 0) return this.getInterventionById(id);

        fields.push('UpdatedAt = CURRENT_TIMESTAMP');
        const query = `UPDATE Interventions SET ${fields.join(', ')} WHERE InterventionID = @id`;
        await databaseService.executeQuery(query, params);
        return this.getInterventionById(id);
    }

    async getInterventionStats(): Promise<any> {
        const query = `
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN Status = 'Active' THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN Status = 'Pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN Status = 'Completed' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN Status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled,
                SUM(CASE WHEN Priority = 'Critical' THEN 1 ELSE 0 END) as critical,
                SUM(CASE WHEN Priority = 'High' THEN 1 ELSE 0 END) as high
            FROM Interventions
        `;
        const data = await databaseService.executeQuery(query);
        return data[0] || { total: 0, active: 0, pending: 0, completed: 0, cancelled: 0, critical: 0, high: 0 };
    }

    private mapIntervention(i: any): Intervention {
        return {
            id: i.InterventionID,
            studentId: i.StudentID,
            studentName: i.StudentName,
            coordinatorId: i.CoordinatorID,
            coordinatorName: i.CoordinatorName,
            type: i.Type,
            notes: i.Notes,
            status: i.Status,
            priority: i.Priority,
            followUpDate: i.FollowUpDate,
            completedAt: i.CompletedAt,
            createdAt: i.CreatedAt,
            updatedAt: i.UpdatedAt
        };
    }
}

export const interventionsRepository = new InterventionsRepository();

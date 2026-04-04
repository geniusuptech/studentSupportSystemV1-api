import databaseService from '../config/database';
import { Coordinator } from '../models/Coordinator';

export class CoordinatorsRepository {
    private mapCoordinator(c: any): Coordinator {
        return {
            id: c.CoordinatorID.toString(),
            name: c.CoordinatorName,
            email: c.Email || c.ContactEmail,
            department: c.Department,
            phone: c.ContactPhone,
            role: 'Coordinator',
            avatarUrl: c.ProfilePictureURL,
            createdAt: c.CreatedAt,
            updatedAt: c.UpdatedAt
        };
    }

    async getAllCoordinators(filters: any): Promise<Coordinator[]> {
        const query = `SELECT * FROM Coordinators WHERE IsActive = 1`;
        const data = await databaseService.executeQuery(query);
        return data.map(c => this.mapCoordinator(c));
    }

    async getCoordinatorById(id: string | number): Promise<Coordinator | null> {
        const query = `SELECT * FROM Coordinators WHERE CoordinatorID = @id`;
        const data = await databaseService.executeQuery(query, { id });

        if (data.length === 0) return null;
        return this.mapCoordinator(data[0]);
    }

    async updateCoordinator(id: string | number, data: any): Promise<Coordinator | null> {
        const fields: string[] = [];
        const params: any = { id };

        if (data.name !== undefined) { fields.push('CoordinatorName = @name'); params.name = data.name; }
        if (data.email !== undefined) { fields.push('Email = @email'); params.email = data.email; }
        if (data.department !== undefined) { fields.push('Department = @department'); params.department = data.department; }

        if (fields.length === 0) return this.getCoordinatorById(id);

        const query = `UPDATE Coordinators SET ${fields.join(', ')} WHERE CoordinatorID = @id`;
        await databaseService.executeQuery(query, params);
        return this.getCoordinatorById(id);
    }

    async getCoordinatorDashboardStats(coordinatorId: string | number): Promise<any> {
        // Get students possibly assigned or in same university
        const totalStudentsQuery = `SELECT COUNT(*) as total FROM Students WHERE IsActive = 1`;
        const criticalQuery = `SELECT COUNT(*) as critical FROM Students WHERE RiskLevel = 'Critical' AND IsActive = 1`;
        const requestsQuery = `SELECT COUNT(*) as requests FROM SupportRequests WHERE Status IN ('Open', 'In Progress')`;
        const interventionsQuery = `SELECT COUNT(*) as interventions FROM Interventions WHERE CoordinatorID = @id AND Status = 'Active'`;

        const results = await Promise.all([
            databaseService.executeQuery(totalStudentsQuery),
            databaseService.executeQuery(criticalQuery),
            databaseService.executeQuery(requestsQuery),
            databaseService.executeQuery(interventionsQuery, { id: coordinatorId })
        ]);

        return {
            totalStudents: results[0][0]?.total || 0,
            criticalStudents: results[1][0]?.critical || 0,
            openRequests: results[2][0]?.requests || 0,
            activeInterventions: results[3][0]?.interventions || 0
        };
    }
}

export const coordinatorsRepository = new CoordinatorsRepository();
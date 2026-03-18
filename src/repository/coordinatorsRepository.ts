import databaseService from '../config/database';
import { Coordinator } from '../models/Coordinator';

export class CoordinatorsRepository {
    private mapCoordinator(c: any): Coordinator {
        return {
            id: c.CoordinatorID.toString(),
            name: c.CoordinatorName,
            email: c.ContactEmail,
            department: c.Department,
            phone: c.ContactPhone,
            role: 'Coordinator', // Defaulting as SQL doesn't have role field
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
}

export const coordinatorsRepository = new CoordinatorsRepository();
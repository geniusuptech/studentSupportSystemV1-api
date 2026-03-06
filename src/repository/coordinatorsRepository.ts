import databaseService from '@/config/database';
import { Coordinator } from '@/models/Coordinator';

export class CoordinatorsRepository {
    async getAllCoordinators(filters: any): Promise<Coordinator[]> {
        let query = `
            SELECT
                c.CoordinatorID,
                c.CoordinatorName,
                c.ContactEmail,
                c.ContactPhone,
                c.OfficeLocation,
                c.CreatedAt,
                c.UpdatedAt
            FROM Coordinators c
            WHERE 1=1
        `;
        const params: any = {};
        return databaseService.executeQuery(query, params);
    }

    
}
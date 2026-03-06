import databaseService from '../config/database';
import { Partner } from '../models/Partner';

export class PartnersRepository {
  async getAllPartners(filters: any): Promise<(Partner & { ActiveRequestCount: number })[]> {
    let query = `
      SELECT
        p.PartnerID,
        p.PartnerName,
        p.PartnerType,
        p.Specialization,
        p.ContactEmail,
        p.ContactPhone,
        p.IsAvailable,
        p.MaxCapacity,
        p.CurrentWorkload,
        p.Rating,
        p.YearsOfExperience,
        p.HourlyRate,
        p.Location,
        p.CreatedAt,
        p.UpdatedAt,
        (
          SELECT COUNT(*)
          FROM SupportRequests sr
          WHERE sr.AssignedPartnerID = p.PartnerID
            AND sr.Status IN ('Open', 'In Progress')
        ) as ActiveRequestCount
      FROM Partners p
      WHERE 1=1
    `;
    const params: any = {};
    if (filters.type) {
      query += ' AND p.PartnerType = @type';
      params.type = filters.type;
    }
    if (filters.available === 'true') {
      query += ' AND p.IsAvailable = 1';
    } else if (filters.available === 'false') {
      query += ' AND p.IsAvailable = 0';
    }
    if (filters.minRating) {
      query += ' AND p.Rating >= @minRating';
      params.minRating = filters.minRating;
    }
    if (filters.location) {
      query += ' AND p.Location = @location';
      params.location = filters.location;
    }
    query += ' ORDER BY p.Rating DESC, p.PartnerName ASC';
    return databaseService.executeQuery(query, params);
  }

  async getPartnerById(id: number): Promise<Partner[]> {
    const query = `SELECT * FROM Partners WHERE PartnerID = @id`;
    return databaseService.executeQuery(query, { id });
  }

  // Add other repository methods as needed

  

}

export const partnersRepository = new PartnersRepository();
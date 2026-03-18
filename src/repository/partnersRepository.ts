import databaseService from '../config/database';
import { Partner } from '../models/Partner';

export class PartnersRepository {
  private mapPartner(p: any): Partner {
    return {
        id: p.PartnerID.toString(),
        name: p.PartnerName,
        type: p.PartnerType === 'Organization' ? 'Organization' : 'Individual',
        role: p.PartnerType,
        specialization: p.Specialization,
        status: p.IsAvailable ? 'Available' : 'Busy',
        rating: parseFloat(p.Rating) || 0,
        ratingCount: p.RatingCount || 0,
        activeClients: p.CurrentWorkload || 0,
        defaultRate: parseFloat(p.HourlyRate) || 0,
        email: p.ContactEmail,
        phone: p.ContactPhone,
        imageUrl: p.ProfilePictureURL,
        createdAt: p.CreatedAt,
        updatedAt: p.UpdatedAt
    };
  }

  async getAllPartners(filters: any): Promise<(Partner & { ActiveRequestCount: number })[]> {
    let query = `
      SELECT p.*, (SELECT COUNT(*) FROM SupportRequests sr WHERE sr.AssignedPartnerID = p.PartnerID AND sr.Status = 'Open') as ActiveRequestCount
      FROM Partners p
      WHERE 1=1
    `;
    const params: any = {};

    if (filters.type) {
        query += ` AND p.PartnerType = @type`;
        params.type = filters.type;
    }
    if (filters.available === 'true') {
        query += ` AND p.IsAvailable = 1`;
    }
    if (filters.location) {
        query += ` AND p.Location = @location`;
        params.location = filters.location;
    }

    const data = await databaseService.executeQuery(query, params);
    return data.map(p => ({
        ...this.mapPartner(p),
        ActiveRequestCount: p.ActiveRequestCount || 0
    }));
  }

  async getAvailablePartners(filters: any): Promise<any[]> {
    let query = `
      SELECT *, (MaxCapacity - CurrentWorkload) as AvailableCapacity,
             (CAST(CurrentWorkload AS FLOAT) / MaxCapacity * 100) as UtilizationRate
      FROM Partners
      WHERE IsAvailable = 1 AND CurrentWorkload < MaxCapacity
    `;
    const params: any = {};
    if (filters.type) {
        query += ` AND PartnerType = @type`;
        params.type = filters.type;
    }
    if (filters.specialization) {
        query += ` AND Specialization LIKE @spec`;
        params.spec = `%${filters.specialization}%`;
    }

    query += ` ORDER BY AvailableCapacity DESC, Rating DESC`;
    return await databaseService.executeQuery(query, params);
  }

  async getWorkloadAnalysis(): Promise<any> {
    const query = `
      SELECT p.PartnerID, p.PartnerName, p.PartnerType, p.CurrentWorkload, p.MaxCapacity, p.IsAvailable,
             (SELECT COUNT(*) FROM SupportRequests sr WHERE sr.AssignedPartnerID = p.PartnerID AND sr.Status = 'Resolved') as ResolvedRequests,
             (SELECT COUNT(*) FROM SupportRequests sr WHERE sr.AssignedPartnerID = p.PartnerID AND sr.Status IN ('Open', 'In Progress')) as ActiveRequests
      FROM Partners p
    `;
    const data = await databaseService.executeQuery(query);
    
    const summary = {
        totalPartners: data.length,
        availablePartners: data.filter((p: any) => p.IsAvailable).length,
        overCapacity: data.filter((p: any) => p.CurrentWorkload >= p.MaxCapacity).length,
        averageUtilization: data.length > 0 ? data.reduce((sum: number, p: any) => sum + (p.CurrentWorkload / p.MaxCapacity * 100), 0) / data.length : 0
    };

    return { data, summary };
  }

  async getStatistics(): Promise<any> {
    const query = `
      SELECT 
        COUNT(*) as totalPartners,
        SUM(CASE WHEN IsAvailable = 1 THEN 1 ELSE 0 END) as availablePartners,
        AVG(Rating) as averageRating,
        AVG(CAST(YearsOfExperience AS FLOAT)) as averageExperience,
        SUM(MaxCapacity) as totalCapacity,
        SUM(CurrentWorkload) as currentWorkload
      FROM Partners
    `;
    const data = await databaseService.executeQuery(query);
    return data[0];
  }

  async getTypes(): Promise<string[]> {
      const query = `SELECT DISTINCT PartnerType FROM Partners`;
      const data = await databaseService.executeQuery(query);
      return data.map((d: any) => d.PartnerType);
  }

  async getPartnerById(id: string | number): Promise<Partner | null> {
    const query = `SELECT * FROM Partners WHERE PartnerID = @id`;
    const data = await databaseService.executeQuery(query, { id });
    
    if (data.length === 0) return null;
    return this.mapPartner(data[0]);
  }

  async getPartnerDetails(id: string | number): Promise<any> {
    const partner = await this.getPartnerById(id);
    if (!partner) return null;

    const statsQuery = `
        SELECT 
            COUNT(*) as TotalRequests,
            SUM(CASE WHEN Status = 'Resolved' THEN 1 ELSE 0 END) as ResolvedRequests,
            SUM(CASE WHEN Status IN ('Open', 'In Progress') THEN 1 ELSE 0 END) as ActiveRequests
        FROM SupportRequests
        WHERE AssignedPartnerID = @id
    `;
    const stats = await databaseService.executeQuery(statsQuery, { id });

    const recentQuery = `
        SELECT sr.RequestID, sr.Title, sr.Status, sr.CreatedAt, s.StudentName
        FROM SupportRequests sr
        JOIN Students s ON sr.StudentID = s.StudentID
        WHERE sr.AssignedPartnerID = @id
        ORDER BY sr.CreatedAt DESC
        LIMIT 5
    `;
    const recent = await databaseService.executeQuery(recentQuery, { id });

    return {
        ...partner,
        ...stats[0],
        recentRequests: recent
    };
  }
}

export const partnersRepository = new PartnersRepository();
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

  async createPartner(data: any): Promise<Partner> {
    const query = `
      INSERT INTO Partners (
        PartnerName, PartnerType, Specialization, ContactEmail, ContactPhone,
        IsAvailable, MaxCapacity, CurrentWorkload, Rating, YearsOfExperience,
        HourlyRate, Location, Bio, CreatedAt, UpdatedAt
      ) VALUES (
        @name, @type, @specialization, @email, @phone,
        @isAvailable, @maxCapacity, 0, 0, @experience,
        @hourlyRate, @location, @bio, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      RETURNING *
    `;
    const params = {
      name: data.name || data.partnerName,
      type: data.type || data.partnerType || 'Individual',
      specialization: data.specialization || null,
      email: data.email || data.contactEmail,
      phone: data.phone || data.contactPhone || null,
      isAvailable: data.isAvailable !== undefined ? (data.isAvailable ? 1 : 0) : 1,
      maxCapacity: data.maxCapacity || 10,
      experience: data.yearsOfExperience || data.experience || 0,
      hourlyRate: data.hourlyRate || data.defaultRate || null,
      location: data.location || null,
      bio: data.bio || null
    };

    const result = await databaseService.executeQuery(query, params);
    return this.mapPartner(result[0]);
  }

  async updatePartner(id: string | number, data: any): Promise<Partner | null> {
    const fields: string[] = [];
    const params: any = { id };

    if (data.name !== undefined || data.partnerName !== undefined) { fields.push('PartnerName = @name'); params.name = data.name || data.partnerName; }
    if (data.type !== undefined || data.partnerType !== undefined) { fields.push('PartnerType = @type'); params.type = data.type || data.partnerType; }
    if (data.specialization !== undefined) { fields.push('Specialization = @specialization'); params.specialization = data.specialization; }
    if (data.email !== undefined || data.contactEmail !== undefined) { fields.push('ContactEmail = @email'); params.email = data.email || data.contactEmail; }
    if (data.phone !== undefined || data.contactPhone !== undefined) { fields.push('ContactPhone = @phone'); params.phone = data.phone || data.contactPhone; }
    if (data.isAvailable !== undefined) { fields.push('IsAvailable = @isAvailable'); params.isAvailable = data.isAvailable ? 1 : 0; }
    if (data.maxCapacity !== undefined) { fields.push('MaxCapacity = @maxCapacity'); params.maxCapacity = data.maxCapacity; }
    if (data.hourlyRate !== undefined) { fields.push('HourlyRate = @hourlyRate'); params.hourlyRate = data.hourlyRate; }
    if (data.location !== undefined) { fields.push('Location = @location'); params.location = data.location; }
    if (data.bio !== undefined) { fields.push('Bio = @bio'); params.bio = data.bio; }
    if (data.yearsOfExperience !== undefined) { fields.push('YearsOfExperience = @experience'); params.experience = data.yearsOfExperience; }
    if (data.rating !== undefined) { fields.push('Rating = @rating'); params.rating = data.rating; }

    if (fields.length === 0) return this.getPartnerById(id);

    fields.push('UpdatedAt = CURRENT_TIMESTAMP');
    const query = `UPDATE Partners SET ${fields.join(', ')} WHERE PartnerID = @id`;
    await databaseService.executeQuery(query, params);
    return this.getPartnerById(id);
  }

  async deletePartner(id: string | number): Promise<void> {
    // Soft delete by marking as unavailable
    const query = `UPDATE Partners SET IsAvailable = 0, UpdatedAt = CURRENT_TIMESTAMP WHERE PartnerID = @id`;
    await databaseService.executeQuery(query, { id });
  }
}

export const partnersRepository = new PartnersRepository();
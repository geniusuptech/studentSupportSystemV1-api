import databaseService from '../config/database';

export class SupportRequestsRepository {
    async getAllRequests(filters: any): Promise<any[]> {
        let query = `
            SELECT sr.*, s.StudentName, s.StudentNumber, p.PartnerName, p.PartnerType, sc.CategoryName
            FROM SupportRequests sr
            JOIN Students s ON sr.StudentID = s.StudentID
            LEFT JOIN Partners p ON sr.AssignedPartnerID = p.PartnerID
            LEFT JOIN SupportRequestCategories sc ON sr.CategoryID = sc.CategoryID
            WHERE 1=1
        `;
        const params: any = {};

        if (filters.status) {
            query += ` AND sr.Status = @status`;
            params.status = filters.status;
        }
        if (filters.studentId) {
            query += ` AND sr.StudentID = @studentId`;
            params.studentId = filters.studentId;
        }
        if (filters.partnerId) {
            query += ` AND sr.AssignedPartnerID = @partnerId`;
            params.partnerId = filters.partnerId;
        }

        query += ` ORDER BY sr.CreatedAt DESC`;

        const data = await databaseService.executeQuery(query, params);
        return data.map(sr => ({
            id: sr.RequestID,
            requestIdDisplay: `REQ-${sr.RequestID.toString().padStart(6, '0')}`,
            studentId: sr.StudentID,
            studentName: sr.StudentName,
            studentNumber: sr.StudentNumber,
            category: sr.CategoryName,
            status: sr.Status,
            description: sr.Description,
            submittedDate: sr.CreatedAt,
            tag: sr.Priority,
            assignedPartnerId: sr.AssignedPartnerID,
            assignedPartnerName: sr.PartnerName,
            assignedPartnerType: sr.PartnerType,
            createdAt: sr.CreatedAt,
            updatedAt: sr.UpdatedAt
        }));
    }

    async getRequestById(id: string | number): Promise<any> {
        const query = `
            SELECT sr.*, s.StudentName, s.StudentNumber, p.PartnerName, p.PartnerType, sc.CategoryName
            FROM SupportRequests sr
            JOIN Students s ON sr.StudentID = s.StudentID
            LEFT JOIN Partners p ON sr.AssignedPartnerID = p.PartnerID
            LEFT JOIN SupportRequestCategories sc ON sr.CategoryID = sc.CategoryID
            WHERE sr.RequestID = @id
        `;
        const data = await databaseService.executeQuery(query, { id });
        if (data.length === 0) return null;
        
        const sr = data[0];
        return {
            id: sr.RequestID,
            requestIdDisplay: `REQ-${sr.RequestID.toString().padStart(6, '0')}`,
            studentId: sr.StudentID,
            studentName: sr.StudentName,
            studentNumber: sr.StudentNumber,
            category: sr.CategoryName,
            status: sr.Status,
            description: sr.Description,
            submittedDate: sr.CreatedAt,
            tag: sr.Priority,
            assignedPartnerId: sr.AssignedPartnerID,
            assignedPartnerName: sr.PartnerName,
            assignedPartnerType: sr.PartnerType,
            createdAt: sr.CreatedAt,
            updatedAt: sr.UpdatedAt
        };
    }

    async createRequest(data: any): Promise<any> {
        const query = `
            INSERT INTO SupportRequests (StudentID, CategoryID, Title, Description, Priority, Status, CreatedAt, UpdatedAt)
            VALUES (@studentId, @categoryId, @title, @description, @priority, 'Open', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING RequestID
        `;
        const params = {
            studentId: data.studentId,
            categoryId: data.categoryId || 1,
            title: data.title || 'Support Request',
            description: data.description,
            priority: data.priority || 'Medium'
        };
        const results = await databaseService.executeQuery(query, params);
        return this.getRequestById(results[0].RequestID);
    }

    async assignPartner(id: string | number, partnerId: string | number): Promise<void> {
        const query = `
            UPDATE SupportRequests 
            SET AssignedPartnerID = @partnerId, Status = 'In Progress', UpdatedAt = CURRENT_TIMESTAMP
            WHERE RequestID = @id
        `;
        await databaseService.executeQuery(query, { id, partnerId });
    }

    async updateStatus(id: string | number, status: string): Promise<void> {
        const query = `UPDATE SupportRequests SET Status = @status, UpdatedAt = CURRENT_TIMESTAMP WHERE RequestID = @id`;
        await databaseService.executeQuery(query, { id, status });
    }

    async getStatistics(): Promise<any> {
        const query = `SELECT Status, AssignedPartnerID FROM SupportRequests`;
        const data = await databaseService.executeQuery(query);
        
        return {
            total: data.length,
            byStatus: {
                open: data.filter((r: any) => r.Status === 'Open').length,
                assigned: data.filter((r: any) => r.AssignedPartnerID !== null).length,
                inProgress: data.filter((r: any) => r.Status === 'In Progress').length,
                resolved: data.filter((r: any) => r.Status === 'Resolved').length,
                closed: data.filter((r: any) => r.Status === 'Closed').length
            },
            assigned: data.filter((r: any) => r.AssignedPartnerID !== null).length,
            unassigned: data.filter((r: any) => r.AssignedPartnerID === null).length
        };
    }
}

export const supportRequestsRepository = new SupportRequestsRepository();

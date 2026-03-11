import databaseService from '../config/database';
import { Coordinator } from '../models/Coordinator';

export class CoordinatorsRepository {
    
    async getAllCoordinators(filters: any): Promise<Coordinator[]> {
        try {
            let query = `
                SELECT
                    c.CoordinatorID,
                    c.CoordinatorName,
                    c.ContactEmail,
                    c.ContactPhone,
                    c.UniversityID,
                    c.Department,
                    c.IsActive,
                    c.CreatedAt,
                    c.UpdatedAt,
                    u.UniversityName,
                    u.UniversityCode
                FROM Coordinators c
                LEFT JOIN Universities u ON c.UniversityID = u.UniversityID
                WHERE c.IsActive = 1
            `;
            
            let params: any = {};
            
            if (filters.universityId) {
                query += ' AND c.UniversityID = @UniversityID';
                params.UniversityID = filters.universityId;
            }
            
            query += ' ORDER BY c.CoordinatorName';
            
            return await databaseService.executeQuery(query, params);
        } catch (error) {
            console.error('Error getting all coordinators:', error);
            throw new Error('Failed to retrieve coordinators');
        }
    }

    async getCoordinatorById(coordinatorID: number): Promise<Coordinator | null> {
        try {
            const query = `
                SELECT
                    c.CoordinatorID,
                    c.CoordinatorName,
                    c.ContactEmail,
                    c.ContactPhone,
                    c.UniversityID,
                    c.Department,
                    c.IsActive,
                    c.CreatedAt,
                    c.UpdatedAt,
                    u.UniversityName,
                    u.UniversityCode
                FROM Coordinators c
                LEFT JOIN Universities u ON c.UniversityID = u.UniversityID
                WHERE c.CoordinatorID = @CoordinatorID AND c.IsActive = 1
            `;
            
            const results = await databaseService.executeQuery(query, { 
                CoordinatorID: coordinatorID 
            });
            
            return results.length > 0 ? results[0] : null;
        } catch (error) {
            console.error('Error getting coordinator by ID:', error);
            throw new Error('Failed to retrieve coordinator');
        }
    }

    async getDashboardData(coordinatorID: number): Promise<any> {
        try {
            // First, get the coordinator's university
            const coordinatorQuery = `
                SELECT UniversityID FROM Coordinators WHERE CoordinatorID = @CoordinatorID
            `;
            const coordinatorResults = await databaseService.executeQuery(coordinatorQuery, { 
                CoordinatorID: coordinatorID 
            });
            
            if (coordinatorResults.length === 0) {
                throw new Error('Coordinator not found');
            }
            
            const universityID = coordinatorResults[0].UniversityID;
            
            // Get total students and basic metrics
            const dashboardQuery = `
                SELECT 
                    COUNT(DISTINCT s.StudentID) as totalStudents,
                    COUNT(DISTINCT CASE WHEN s.RiskLevel IN ('At Risk', 'Critical') THEN s.StudentID END) as atRiskStudents,
                    AVG(CAST(s.GPA as float)) as averageGPA,
                    COUNT(DISTINCT CASE WHEN sr.Status IN ('Open', 'In Progress') THEN sr.RequestID END) as activeInterventions
                FROM Students s
                LEFT JOIN SupportRequests sr ON s.StudentID = sr.StudentID
                WHERE s.UniversityID = @UniversityID AND s.IsActive = 1
            `;
            
            const dashboardResults = await databaseService.executeQuery(dashboardQuery, { 
                UniversityID: universityID 
            });
            
            // Get risk distribution
            const riskQuery = `
                SELECT 
                    RiskLevel,
                    COUNT(*) as Count
                FROM Students s 
                WHERE s.UniversityID = @UniversityID AND s.IsActive = 1
                GROUP BY RiskLevel
            `;
            
            const riskResults = await databaseService.executeQuery(riskQuery, { 
                UniversityID: universityID 
            });
            
            // Process risk distribution
            const riskDistribution = { safe: 0, atRisk: 0, critical: 0 };
            riskResults.forEach((row: any) => {
                if (row.RiskLevel === 'Safe') riskDistribution.safe = row.Count;
                else if (row.RiskLevel === 'At Risk') riskDistribution.atRisk = row.Count;
                else if (row.RiskLevel === 'Critical') riskDistribution.critical = row.Count;
            });

            const dashboardData = dashboardResults[0] || {};
            
            return {
                totalStudents: dashboardData.totalStudents || 0,
                atRiskStudents: dashboardData.atRiskStudents || 0,
                averageGPA: Math.round((dashboardData.averageGPA || 0) * 100) / 100,
                activeInterventions: dashboardData.activeInterventions || 0,
                riskDistribution,
                recentActivity: [], // Simplified for now
                notifications: []
            };
            
        } catch (error) {
            console.error('Error getting coordinator dashboard data:', error);
            throw new Error('Failed to retrieve dashboard data');
        }
    }

    async updateCoordinator(coordinatorID: number, updateData: any): Promise<any> {
        try {
            const fields = [];
            const params: any = { CoordinatorID: coordinatorID };
            
            if (updateData.coordinatorName) {
                fields.push('CoordinatorName = @CoordinatorName');
                params.CoordinatorName = updateData.coordinatorName;
            }
            
            if (updateData.contactEmail) {
                fields.push('ContactEmail = @ContactEmail');
                params.ContactEmail = updateData.contactEmail;
            }
            
            if (updateData.contactPhone) {
                fields.push('ContactPhone = @ContactPhone');
                params.ContactPhone = updateData.contactPhone;
            }
            
            if (updateData.department) {
                fields.push('Department = @Department');
                params.Department = updateData.department;
            }
            
            fields.push('UpdatedAt = GETDATE()');
            
            const query = `
                UPDATE Coordinators 
                SET ${fields.join(', ')}
                OUTPUT 
                    INSERTED.CoordinatorID,
                    INSERTED.CoordinatorName,
                    INSERTED.ContactEmail,
                    INSERTED.ContactPhone,
                    INSERTED.Department,
                    INSERTED.UpdatedAt
                WHERE CoordinatorID = @CoordinatorID
            `;
            
            const results = await databaseService.executeQuery(query, params);
            return results[0];
        } catch (error) {
            console.error('Error updating coordinator:', error);
            throw new Error('Failed to update coordinator');
        }
    }

    async getStudentsByCoordinator(coordinatorID: number, filters: any): Promise<any[]> {
        try {
            // First get coordinator's university
            const coordQuery = `
                SELECT UniversityID FROM Coordinators WHERE CoordinatorID = @CoordinatorID
            `;
            const coordResults = await databaseService.executeQuery(coordQuery, { 
                CoordinatorID: coordinatorID 
            });
            
            if (coordResults.length === 0) {
                return [];
            }
            
            const universityID = coordResults[0].UniversityID;
            
            let query = `
                SELECT 
                    s.StudentID,
                    s.StudentName,
                    s.StudentNumber,
                    s.YearOfStudy,
                    s.GPA,
                    s.RiskLevel,
                    s.LastLoginDate as LastActivityDate,
                    u.UniversityName,
                    u.UniversityCode,
                    p.ProgramName,
                    COUNT(sr.RequestID) as ActiveRequestCount
                FROM Students s
                LEFT JOIN Universities u ON s.UniversityID = u.UniversityID
                LEFT JOIN Programs p ON s.ProgramID = p.ProgramID
                LEFT JOIN SupportRequests sr ON s.StudentID = sr.StudentID AND sr.Status IN ('Open', 'In Progress')
                WHERE s.UniversityID = @UniversityID AND s.IsActive = 1
            `;
            
            const params: any = { UniversityID: universityID };
            
            if (filters.riskLevel) {
                query += ' AND s.RiskLevel = @RiskLevel';
                params.RiskLevel = filters.riskLevel;
            }
            
            if (filters.yearOfStudy) {
                query += ' AND s.YearOfStudy = @YearOfStudy';
                params.YearOfStudy = filters.yearOfStudy;
            }
            
            if (filters.programId) {
                query += ' AND s.ProgramID = @ProgramID';
                params.ProgramID = filters.programId;
            }
            
            if (filters.search) {
                query += ' AND (s.StudentName LIKE @Search OR s.StudentNumber LIKE @Search)';
                params.Search = `%${filters.search}%`;
            }
            
            query += ' GROUP BY s.StudentID, s.StudentName, s.StudentNumber, s.YearOfStudy, s.GPA, s.RiskLevel, s.LastLoginDate, u.UniversityName, u.UniversityCode, p.ProgramName';
            query += ' ORDER BY s.StudentName';
            
            return await databaseService.executeQuery(query, params);
        } catch (error) {
            console.error('Error getting students by coordinator:', error);
            throw new Error('Failed to retrieve students');
        }
    }

    async getCoordinatorStatistics(coordinatorID: number, timeframe: string): Promise<any> {
        try {
            // Get coordinator's university
            const coordQuery = `
                SELECT UniversityID FROM Coordinators WHERE CoordinatorID = @CoordinatorID
            `;
            const coordResults = await databaseService.executeQuery(coordQuery, { 
                CoordinatorID: coordinatorID 
            });
            
            if (coordResults.length === 0) {
                throw new Error('Coordinator not found');
            }
            
            const universityID = coordResults[0].UniversityID;
            
            // Calculate date filter based on timeframe
            let dateFilter = "";
            switch (timeframe) {
                case '7days':
                    dateFilter = "AND s.CreatedAt >= DATEADD(DAY, -7, GETDATE())";
                    break;
                case '30days':
                    dateFilter = "AND s.CreatedAt >= DATEADD(DAY, -30, GETDATE())";
                    break;
                case '90days':
                    dateFilter = "AND s.CreatedAt >= DATEADD(DAY, -90, GETDATE())";
                    break;
                case '1year':
                    dateFilter = "AND s.CreatedAt >= DATEADD(YEAR, -1, GETDATE())";
                    break;
                default:
                    dateFilter = "AND s.CreatedAt >= DATEADD(DAY, -30, GETDATE())";
            }
            
            // Get statistics
            const statsQuery = `
                SELECT 
                    COUNT(DISTINCT s.StudentID) as totalEnrolled,
                    COUNT(DISTINCT CASE WHEN s.CreatedAt >= DATEADD(DAY, -30, GETDATE()) THEN s.StudentID END) as newEnrollments,
                    AVG(CAST(s.GPA as float)) as averageGPA,
                    COUNT(DISTINCT sr.RequestID) as totalRequests,
                    COUNT(DISTINCT CASE WHEN sr.Status = 'Resolved' THEN sr.RequestID END) as resolvedRequests
                FROM Students s
                LEFT JOIN SupportRequests sr ON s.StudentID = sr.StudentID
                WHERE s.UniversityID = @UniversityID AND s.IsActive = 1
            `;
            
            const statsResults = await databaseService.executeQuery(statsQuery, { 
                UniversityID: universityID 
            });
            
            const stats = statsResults[0] || {};
            
            return {
                timeframe,
                studentStats: {
                    totalEnrolled: stats.totalEnrolled || 0,
                    newEnrollments: stats.newEnrollments || 0
                },
                academicStats: {
                    averageGPA: Math.round((stats.averageGPA || 0) * 100) / 100
                },
                supportStats: {
                    totalRequests: stats.totalRequests || 0,
                    resolvedRequests: stats.resolvedRequests || 0
                }
            };
        } catch (error) {
            console.error('Error getting coordinator statistics:', error);
            throw new Error('Failed to retrieve statistics');
        }
    }

    async getSupportRequestsByCoordinator(coordinatorID: number, filters: any): Promise<any[]> {
        try {
            // Get coordinator's university  
            const coordQuery = `
                SELECT UniversityID FROM Coordinators WHERE CoordinatorID = @CoordinatorID
            `;
            const coordResults = await databaseService.executeQuery(coordQuery, { 
                CoordinatorID: coordinatorID 
            });
            
            if (coordResults.length === 0) {
                return [];
            }
            
            const universityID = coordResults[0].UniversityID;
            
            let query = `
                SELECT 
                    sr.RequestID,
                    src.CategoryName as RequestType,
                    sr.Priority,
                    sr.Status,
                    sr.Description,
                    sr.CreatedAt,
                    sr.ResolvedAt,
                    s.StudentID,
                    s.StudentName,
                    s.StudentNumber,
                    s.RiskLevel,
                    p.PartnerID,
                    p.PartnerName,
                    p.PartnerType,
                    p.Specialization
                FROM SupportRequests sr
                INNER JOIN Students s ON sr.StudentID = s.StudentID
                LEFT JOIN SupportRequestCategories src ON sr.CategoryID = src.CategoryID
                LEFT JOIN Partners p ON sr.AssignedPartnerID = p.PartnerID
                WHERE s.UniversityID = @UniversityID
            `;
            
            const params: any = { UniversityID: universityID };
            
            if (filters.status) {
                query += ' AND sr.Status = @Status';
                params.Status = filters.status;
            }
            
            if (filters.requestType) {
                query += ' AND src.CategoryName = @RequestType';
                params.RequestType = filters.requestType;
            }
            
            if (filters.priority) {
                query += ' AND sr.Priority = @Priority';
                params.Priority = filters.priority;
            }
            
            if (filters.studentId) {
                query += ' AND s.StudentID = @StudentID';
                params.StudentID = filters.studentId;
            }
            
            query += ' ORDER BY sr.CreatedAt DESC';
            
            return await databaseService.executeQuery(query, params);
        } catch (error) {
            console.error('Error getting support requests by coordinator:', error);
            throw new Error('Failed to retrieve support requests');
        }
    }

    async assignPartnerToStudent(
        coordinatorID: number,
        studentID: number,
        partnerID: number,
        requestType: string,
        priority: string,
        description: string
    ): Promise<any> {
        try {
            const requestTypeMap: Record<string, string> = {
                'Academic Support': 'Academic Support',
                'Wellness Support': 'Mental Health',
                'Mental Health': 'Mental Health',
                'Financial Aid': 'Financial Aid',
                'Career Guidance': 'Career Guidance'
            };
            const normalizedRequestType = requestTypeMap[requestType] || requestType;

            const coordinatorUniversity = await databaseService.executeQuery<{ UniversityID: number }>(
                `
                SELECT UniversityID
                FROM Coordinators
                WHERE CoordinatorID = @CoordinatorID AND IsActive = 1
                `,
                { CoordinatorID: coordinatorID }
            );

            if (coordinatorUniversity.length === 0) {
                throw new Error('Coordinator not found');
            }
            const coordinatorUniversityID = coordinatorUniversity[0]!.UniversityID;

            const studentValidation = await databaseService.executeQuery<{ StudentID: number }>(
                `
                SELECT StudentID
                FROM Students
                WHERE StudentID = @StudentID
                  AND UniversityID = @UniversityID
                  AND IsActive = 1
                `,
                {
                    StudentID: studentID,
                    UniversityID: coordinatorUniversityID
                }
            );

            if (studentValidation.length === 0) {
                throw new Error('Student not found in coordinator scope');
            }

            const partnerValidation = await databaseService.executeQuery<{ PartnerID: number }>(
                `
                SELECT PartnerID
                FROM Partners
                WHERE PartnerID = @PartnerID
                `,
                { PartnerID: partnerID }
            );

            if (partnerValidation.length === 0) {
                throw new Error('Partner not found');
            }

            const categoryResult = await databaseService.executeQuery<{ CategoryID: number }>(
                `
                SELECT TOP 1 CategoryID
                FROM SupportRequestCategories
                WHERE CategoryName = @RequestType
                `,
                { RequestType: normalizedRequestType }
            );

            if (categoryResult.length === 0) {
                throw new Error(`Support category not found for request type: ${requestType}`);
            }

            const categoryID = categoryResult[0]!.CategoryID;
            const requestTitle = `${normalizedRequestType} support request`;

            const query = `
                INSERT INTO SupportRequests (
                    StudentID, 
                    CategoryID,
                    Title,
                    Priority, 
                    Status, 
                    Description, 
                    AssignedPartnerID,
                    CreatedAt,
                    UpdatedAt
                )
                OUTPUT 
                    INSERTED.RequestID,
                    INSERTED.StudentID,
                    INSERTED.AssignedPartnerID,
                    INSERTED.CategoryID,
                    INSERTED.Priority,
                    INSERTED.Status,
                    INSERTED.CreatedAt
                VALUES (
                    @StudentID,
                    @CategoryID,
                    @Title,
                    @Priority,
                    'Open',
                    @Description,
                    @AssignedPartnerID,
                    GETDATE(),
                    GETDATE()
                )
            `;
            
            const params = {
                StudentID: studentID,
                CategoryID: categoryID,
                Title: requestTitle,
                AssignedPartnerID: partnerID,
                Priority: priority,
                Description: description
            };
            
            const results = await databaseService.executeQuery(query, params);
            return results[0];
        } catch (error) {
            console.error('Error assigning partner to student:', error);
            throw new Error('Failed to assign partner to student');
        }
    }
}

export const coordinatorsRepository = new CoordinatorsRepository();

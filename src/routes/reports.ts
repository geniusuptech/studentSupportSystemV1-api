import { Hono } from 'hono';
import { dashboardController } from '../controllers/dashboardController';
import databaseService from '../config/database';

const router = new Hono();

// Root endpoint
router.get('/', (c) => c.json({
  message: 'Reports API',
  endpoints: ['/summary', '/students/export', '/risk-trends', '/support-requests', '/partners', '/activity']
}));

// GET /api/reports/summary - Comprehensive summary report
router.get('/summary', async (c) => {
    try {
        const totalStudentsQuery = `SELECT COUNT(*) as total FROM Students WHERE IsActive = 1`;
        const riskDistQuery = `SELECT RiskLevel, COUNT(*) as count FROM Students WHERE IsActive = 1 GROUP BY RiskLevel`;
        const avgGpaQuery = `SELECT AVG(GPA) as avgGPA FROM Students WHERE IsActive = 1`;
        const requestsQuery = `
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN Status = 'Open' THEN 1 ELSE 0 END) as open,
                SUM(CASE WHEN Status = 'In Progress' THEN 1 ELSE 0 END) as inProgress,
                SUM(CASE WHEN Status = 'Resolved' THEN 1 ELSE 0 END) as resolved,
                SUM(CASE WHEN Status = 'Closed' THEN 1 ELSE 0 END) as closed
            FROM SupportRequests
        `;
        const partnersQuery = `
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN IsAvailable = 1 THEN 1 ELSE 0 END) as available,
                AVG(Rating) as avgRating
            FROM Partners
        `;
        const universityQuery = `
            SELECT u.UniversityName, COUNT(s.StudentID) as studentCount, 
                   AVG(s.GPA) as avgGPA,
                   SUM(CASE WHEN s.RiskLevel = 'Critical' THEN 1 ELSE 0 END) as criticalCount
            FROM Universities u
            LEFT JOIN Students s ON u.UniversityID = s.UniversityID AND s.IsActive = 1
            GROUP BY u.UniversityID, u.UniversityName
        `;

        const [totalStudents, riskDist, avgGpa, requests, partners, universities] = await Promise.all([
            databaseService.executeQuery(totalStudentsQuery),
            databaseService.executeQuery(riskDistQuery),
            databaseService.executeQuery(avgGpaQuery),
            databaseService.executeQuery(requestsQuery),
            databaseService.executeQuery(partnersQuery),
            databaseService.executeQuery(universityQuery)
        ]);

        const riskMap: any = { Safe: 0, 'At Risk': 0, Critical: 0 };
        riskDist.forEach((r: any) => { riskMap[r.RiskLevel] = r.count; });

        return c.json({
            success: true,
            data: {
                generatedAt: new Date().toISOString(),
                students: {
                    total: totalStudents[0]?.total || 0,
                    averageGPA: Math.round((avgGpa[0]?.avgGPA || 0) * 100) / 100,
                    riskDistribution: riskMap
                },
                supportRequests: requests[0] || { total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0 },
                partners: {
                    total: partners[0]?.total || 0,
                    available: partners[0]?.available || 0,
                    averageRating: Math.round((partners[0]?.avgRating || 0) * 100) / 100
                },
                universities
            }
        });
    } catch (error: any) {
        console.error('Error generating summary report:', error);
        return c.json({ success: false, error: 'Internal Server Error' }, 500);
    }
});

// GET /api/reports/risk-trends - Risk level trends over time
router.get('/risk-trends', async (c) => {
    try {
        const query = `
            SELECT 
                DATE(CreatedAt) as date,
                RiskLevel,
                COUNT(*) as count
            FROM Students 
            WHERE IsActive = 1
            GROUP BY DATE(CreatedAt), RiskLevel
            ORDER BY date DESC
            LIMIT 90
        `;
        const data = await databaseService.executeQuery(query);
        return c.json({ success: true, data });
    } catch (error: any) {
        console.error('Error fetching risk trends:', error);
        return c.json({ success: true, data: [] });
    }
});

// GET /api/reports/support-requests - Support request analytics
router.get('/support-requests', async (c) => {
    try {
        const statusQuery = `
            SELECT Status, COUNT(*) as count 
            FROM SupportRequests 
            GROUP BY Status
        `;
        const priorityQuery = `
            SELECT Priority, COUNT(*) as count 
            FROM SupportRequests 
            GROUP BY Priority
        `;
        const categoryQuery = `
            SELECT sc.CategoryName, COUNT(*) as count
            FROM SupportRequests sr
            LEFT JOIN SupportRequestCategories sc ON sr.CategoryID = sc.CategoryID
            GROUP BY sr.CategoryID
        `;
        const monthlyQuery = `
            SELECT 
                strftime('%Y-%m', CreatedAt) as month,
                COUNT(*) as total,
                SUM(CASE WHEN Status = 'Resolved' THEN 1 ELSE 0 END) as resolved
            FROM SupportRequests
            GROUP BY strftime('%Y-%m', CreatedAt)
            ORDER BY month DESC
            LIMIT 12
        `;

        const [statuses, priorities, categories, monthly] = await Promise.all([
            databaseService.executeQuery(statusQuery),
            databaseService.executeQuery(priorityQuery),
            databaseService.executeQuery(categoryQuery),
            databaseService.executeQuery(monthlyQuery)
        ]);

        return c.json({
            success: true,
            data: {
                byStatus: statuses,
                byPriority: priorities,
                byCategory: categories,
                monthly
            }
        });
    } catch (error: any) {
        console.error('Error fetching support request report:', error);
        return c.json({ success: false, error: 'Internal Server Error' }, 500);
    }
});

// GET /api/reports/partners - Partner performance report
router.get('/partners', async (c) => {
    try {
        const query = `
            SELECT p.PartnerID, p.PartnerName, p.PartnerType, p.Rating, p.CurrentWorkload, p.MaxCapacity,
                   COUNT(sr.RequestID) as totalRequests,
                   SUM(CASE WHEN sr.Status = 'Resolved' THEN 1 ELSE 0 END) as resolvedRequests,
                   SUM(CASE WHEN sr.Status IN ('Open', 'In Progress') THEN 1 ELSE 0 END) as activeRequests
            FROM Partners p
            LEFT JOIN SupportRequests sr ON p.PartnerID = sr.AssignedPartnerID
            GROUP BY p.PartnerID, p.PartnerName, p.PartnerType, p.Rating, p.CurrentWorkload, p.MaxCapacity
            ORDER BY p.Rating DESC
        `;
        const data = await databaseService.executeQuery(query);
        return c.json({ success: true, count: data.length, data });
    } catch (error: any) {
        console.error('Error fetching partner report:', error);
        return c.json({ success: false, error: 'Internal Server Error' }, 500);
    }
});

// GET /api/reports/activity - Recent activity report
router.get('/activity', async (c) => {
    try {
        const query = `
            SELECT * FROM ActivityLogs 
            ORDER BY CreatedAt DESC 
            LIMIT 100
        `;
        const data = await databaseService.executeQuery(query);
        return c.json({ success: true, count: data.length, data });
    } catch (error: any) {
        console.error('Error fetching activity report:', error);
        return c.json({ success: true, count: 0, data: [] });
    }
});

// GET /api/reports/students/export
router.get('/students/export', (c) => dashboardController.exportStudents(c));

export default router;

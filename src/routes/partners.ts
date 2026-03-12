import { Hono } from 'hono';
import { expressToHono } from '../utils/hono-express-adapter';
import databaseService from '../config/database';

const router = new Hono();

/**
 * @swagger
 * components:
 *   schemas:
 *     Partner:
 *       type: object
 *       properties:
 *         PartnerID:
 *           type: integer
 *         PartnerName:
 *           type: string
 *         PartnerType:
 *           type: string
 *         Specialization:
 *           type: string
 *         ContactEmail:
 *           type: string
 *         IsAvailable:
 *           type: boolean
 *         MaxCapacity:
 *           type: integer
 *         CurrentWorkload:
 *           type: integer
 */

/**
 * @swagger
 * /partners:
 *   get:
 *     summary: Get all partners
 *     tags: [Partners]
 *     responses:
 *       200:
 *         description: List of partners
 */
router.get('/', expressToHono(async (req: any, res: any) => {
    const { type, available, minRating, location } = req.query;
    let query = `
      SELECT
        p.PartnerID, p.PartnerName, p.PartnerType, p.Specialization,
        p.ContactEmail, p.ContactPhone, p.IsAvailable, p.MaxCapacity,
        p.CurrentWorkload, p.Rating, p.YearsOfExperience, p.HourlyRate,
        p.Location, p.CreatedAt, p.UpdatedAt,
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
    if (type) { query += ' AND p.PartnerType = @partnerType'; params.partnerType = type; }
    if (available === 'true') { query += ' AND p.IsAvailable = 1'; }
    else if (available === 'false') { query += ' AND p.IsAvailable = 0'; }
    if (minRating) {
      const rating = parseFloat(minRating as string);
      if (!isNaN(rating)) { query += ' AND p.Rating >= @minRating'; params.minRating = rating; }
    }
    if (location) { query += ' AND p.Location LIKE @location'; params.location = `%${location}%`; }
    query += ' ORDER BY p.Rating DESC, p.PartnerName ASC';
    const partners = await databaseService.executeQuery(query, params);
    res.json({ success: true, count: partners.length, filters: { type, available, minRating, location }, data: partners });
}));

/**
 * @swagger
 * /partners/available:
 *   get:
 *     summary: Get available partners
 *     tags: [Partners]
 */
router.get('/available', expressToHono(async (req: any, res: any) => {
    const { type, specialization } = req.query;
    let query = `
      SELECT
        p.PartnerID, p.PartnerName, p.PartnerType, p.Specialization,
        p.ContactEmail, p.ContactPhone, p.MaxCapacity, p.CurrentWorkload,
        p.Rating, p.YearsOfExperience, p.HourlyRate, p.Location,
        (p.MaxCapacity - p.CurrentWorkload) as AvailableCapacity,
        CAST((CAST(p.CurrentWorkload as FLOAT) / p.MaxCapacity * 100) as DECIMAL(5,2)) as UtilizationRate
      FROM Partners p
      WHERE p.IsAvailable = 1
        AND p.CurrentWorkload < p.MaxCapacity
    `;
    const params: any = {};
    if (type) { query += ' AND p.PartnerType = @partnerType'; params.partnerType = type; }
    if (specialization) { query += ' AND p.Specialization LIKE @specialization'; params.specialization = `%${specialization}%`; }
    query += ' ORDER BY (p.MaxCapacity - p.CurrentWorkload) DESC, p.Rating DESC';
    const availablePartners = await databaseService.executeQuery(query, params);
    res.json({ success: true, count: availablePartners.length, filters: { type, specialization }, data: availablePartners });
}));

/**
 * @swagger
 * /partners/workload:
 *   get:
 *     summary: Get partner workload analysis
 *     tags: [Partners]
 */
router.get('/workload', expressToHono(async (req: any, res: any) => {
    const query = `
      SELECT
        p.PartnerID, p.PartnerName, p.PartnerType, p.CurrentWorkload, p.MaxCapacity,
        CAST((CAST(p.CurrentWorkload as FLOAT) / p.MaxCapacity * 100) as DECIMAL(5,2)) as UtilizationRate,
        p.IsAvailable,
        (SELECT COUNT(*) FROM SupportRequests sr WHERE sr.AssignedPartnerID = p.PartnerID AND sr.Status IN ('Open', 'In Progress')) as ActiveRequests,
        (SELECT COUNT(*) FROM SupportRequests sr WHERE sr.AssignedPartnerID = p.PartnerID AND sr.Status = 'Resolved') as ResolvedRequests
      FROM Partners p
      ORDER BY UtilizationRate DESC, p.PartnerName ASC
    `;
    const workloadData = await databaseService.executeQuery(query);
    res.json({
      success: true,
      count: workloadData.length,
      data: workloadData,
      summary: {
        totalPartners: workloadData.length,
        availablePartners: workloadData.filter((p:any) => p.IsAvailable).length,
        overCapacity: workloadData.filter((p:any) => p.CurrentWorkload >= p.MaxCapacity).length,
        averageUtilization: workloadData.length > 0 ? Math.round(workloadData.reduce((sum:number, p:any) => sum + (p.UtilizationRate || 0), 0) / workloadData.length * 100) / 100 : 0
      }
    });
}));

/**
 * @swagger
 * /partners/statistics:
 *   get:
 *     summary: Get partner statistics
 *     tags: [Partners]
 */
router.get('/statistics', expressToHono(async (req: any, res: any) => {
    const statsQuery = `
      SELECT
        COUNT(*) as TotalPartners,
        SUM(CASE WHEN IsAvailable = 1 THEN 1 ELSE 0 END) as AvailablePartners,
        AVG(CAST(Rating as FLOAT)) as AverageRating,
        AVG(CAST(YearsOfExperience as FLOAT)) as AverageExperience,
        SUM(MaxCapacity) as TotalCapacity,
        SUM(CurrentWorkload) as TotalCurrentWorkload
      FROM Partners
    `;
    const typeStatsQuery = `SELECT PartnerType, COUNT(*) as Count FROM Partners GROUP BY PartnerType ORDER BY Count DESC`;
    const [stats, typeStats] = await Promise.all([
      databaseService.executeQuery(statsQuery),
      databaseService.executeQuery(typeStatsQuery)
    ]);
    const data = stats[0];
    const statistics = {
      totalPartners: data.TotalPartners || 0,
      availablePartners: data.AvailablePartners || 0,
      byType: typeStats.reduce((acc:any, item:any) => { acc[item.PartnerType] = item.Count; return acc; }, {}),
      averageRating: Math.round((data.AverageRating || 0) * 100) / 100,
      averageExperience: Math.round((data.AverageExperience || 0) * 100) / 100,
      totalCapacity: data.TotalCapacity || 0,
      currentWorkload: data.TotalCurrentWorkload || 0,
      utilizationRate: data.TotalCapacity > 0 ? Math.round((data.TotalCurrentWorkload / data.TotalCapacity) * 100 * 100) / 100 : 0
    };
    res.json({ success: true, data: statistics, generatedAt: new Date().toISOString() });
}));

/**
 * @swagger
 * /partners/{id}:
 *   get:
 *     summary: Get partner by ID
 *     tags: [Partners]
 */
router.get('/:id', expressToHono(async (req: any, res: any) => {
    const { id } = req.params;
    const query = `
      SELECT
        p.*,
        (SELECT COUNT(*) FROM SupportRequests sr WHERE sr.AssignedPartnerID = p.PartnerID AND sr.Status IN ('Open', 'In Progress')) as ActiveRequests,
        (SELECT COUNT(*) FROM SupportRequests sr WHERE sr.AssignedPartnerID = p.PartnerID AND sr.Status = 'Resolved') as ResolvedRequests,
        (SELECT COUNT(*) FROM SupportRequests sr WHERE sr.AssignedPartnerID = p.PartnerID) as TotalRequests
      FROM Partners p
      WHERE p.PartnerID = @partnerId
    `;
    const partner = await databaseService.executeQuery(query, { partnerId: id });
    if (partner.length === 0) {
      return res.status(404).json({ error: 'Partner not found', message: `Partner with ID ${id} not found` });
    }
    const recentRequestsQuery = `
      SELECT TOP 5
        sr.RequestID, sr.Title, sr.Priority, sr.Status, sr.CreatedAt, s.StudentName
      FROM SupportRequests sr
      LEFT JOIN Students s ON sr.StudentID = s.StudentID
      WHERE sr.AssignedPartnerID = @partnerId
      ORDER BY sr.CreatedAt DESC
    `;
    const recentRequests = await databaseService.executeQuery(recentRequestsQuery, { partnerId: id });
    res.json({ success: true, data: { ...partner[0], recentRequests } });
}));

/**
 * @swagger
 * /partners/types:
 *   get:
 *     summary: Get partner types
 *     tags: [Partners]
 */
router.get('/types', expressToHono(async (req: any, res: any) => {
    const query = `
      SELECT PartnerType, COUNT(*) as Count, AVG(CAST(Rating as FLOAT)) as AverageRating, SUM(CASE WHEN IsAvailable = 1 THEN 1 ELSE 0 END) as AvailableCount
      FROM Partners GROUP BY PartnerType ORDER BY Count DESC
    `;
    const partnerTypes = await databaseService.executeQuery(query);
    res.json({ success: true, count: partnerTypes.length, data: partnerTypes });
}));

export default router;
import { Router, Request, Response, NextFunction } from 'express';
import { param, query, validationResult } from 'express-validator';
import databaseService from '../config/database';

const router = Router();

// Types
interface Partner {
  PartnerID: number;
  PartnerName: string;
  PartnerType: string;
  Specialization: string;
  ContactEmail: string;
  ContactPhone?: string;
  IsAvailable: boolean;
  MaxCapacity: number;
  CurrentWorkload: number;
  Rating: number;
  YearsOfExperience: number;
  HourlyRate?: number;
  Location?: string;
  CreatedAt: string;
  UpdatedAt: string;
}

interface PartnerWorkload {
  PartnerID: number;
  PartnerName: string;
  PartnerType: string;
  CurrentWorkload: number;
  MaxCapacity: number;
  UtilizationRate: number;
  ActiveRequests: number;
  IsAvailable: boolean;
}

interface PartnerStatistics {
  totalPartners: number;
  availablePartners: number;
  byType: { [key: string]: number };
  averageRating: number;
  averageExperience: number;
  totalCapacity: number;
  currentWorkload: number;
  utilizationRate: number;
}

// Validation middleware
const validatePartnerId = [
  param('id').isInt({ min: 1 }).withMessage('Partner ID must be a positive integer')
];

const validatePartnerType = [
  query('type').optional().isString().withMessage('Partner type must be a string')
];

// Validation error handler
const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  return next();
};

// GET /api/partners - Get all partners
router.get('/', validatePartnerType, handleValidationErrors, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, available, minRating, location } = req.query;

    console.log('Fetching partners with filters:', { type, available, minRating, location });

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

    if (type) {
      query += ' AND p.PartnerType = @partnerType';
      params.partnerType = type;
    }

    if (available === 'true') {
      query += ' AND p.IsAvailable = 1';
    } else if (available === 'false') {
      query += ' AND p.IsAvailable = 0';
    }

    if (minRating) {
      const rating = parseFloat(minRating as string);
      if (!isNaN(rating)) {
        query += ' AND p.Rating >= @minRating';
        params.minRating = rating;
      }
    }

    if (location) {
      query += ' AND p.Location LIKE @location';
      params.location = `%${location}%`;
    }

    query += ' ORDER BY p.Rating DESC, p.PartnerName ASC';

    const partners = await databaseService.executeQuery<Partner & { ActiveRequestCount: number }>(query, params);

    console.log(`Retrieved ${partners.length} partners`);

    res.json({
      success: true,
      count: partners.length,
      filters: { type, available, minRating, location },
      data: partners
    });

  } catch (error) {
    console.error('Error fetching partners:', error);
    next(error);
  }
});

// GET /api/partners/available - Get available partners only
router.get('/available', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, specialization } = req.query;

    console.log('Fetching available partners with filters:', { type, specialization });

    let query = `
      SELECT
        p.PartnerID,
        p.PartnerName,
        p.PartnerType,
        p.Specialization,
        p.ContactEmail,
        p.ContactPhone,
        p.MaxCapacity,
        p.CurrentWorkload,
        p.Rating,
        p.YearsOfExperience,
        p.HourlyRate,
        p.Location,
        (p.MaxCapacity - p.CurrentWorkload) as AvailableCapacity,
        CAST((CAST(p.CurrentWorkload as FLOAT) / p.MaxCapacity * 100) as DECIMAL(5,2)) as UtilizationRate
      FROM Partners p
      WHERE p.IsAvailable = 1
        AND p.CurrentWorkload < p.MaxCapacity
    `;

    const params: any = {};

    if (type) {
      query += ' AND p.PartnerType = @partnerType';
      params.partnerType = type;
    }

    if (specialization) {
      query += ' AND p.Specialization LIKE @specialization';
      params.specialization = `%${specialization}%`;
    }

    query += ' ORDER BY (p.MaxCapacity - p.CurrentWorkload) DESC, p.Rating DESC';

    const availablePartners = await databaseService.executeQuery(query, params);

    console.log(`Retrieved ${availablePartners.length} available partners`);

    res.json({
      success: true,
      count: availablePartners.length,
      filters: { type, specialization },
      data: availablePartners
    });

  } catch (error) {
    console.error('Error fetching available partners:', error);
    next(error);
  }
});

// GET /api/partners/workload - Get partner workload analysis
router.get('/workload', async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Fetching partner workload analysis...');

    const query = `
      SELECT
        p.PartnerID,
        p.PartnerName,
        p.PartnerType,
        p.CurrentWorkload,
        p.MaxCapacity,
        CAST((CAST(p.CurrentWorkload as FLOAT) / p.MaxCapacity * 100) as DECIMAL(5,2)) as UtilizationRate,
        p.IsAvailable,
        (
          SELECT COUNT(*)
          FROM SupportRequests sr
          WHERE sr.AssignedPartnerID = p.PartnerID
            AND sr.Status IN ('Open', 'In Progress')
        ) as ActiveRequests,
        (
          SELECT COUNT(*)
          FROM SupportRequests sr
          WHERE sr.AssignedPartnerID = p.PartnerID
            AND sr.Status = 'Resolved'
        ) as ResolvedRequests
      FROM Partners p
      ORDER BY UtilizationRate DESC, p.PartnerName ASC
    `;

    const workloadData = await databaseService.executeQuery<PartnerWorkload & { ResolvedRequests: number }>(query);

    console.log('Partner workload analysis completed');

    res.json({
      success: true,
      count: workloadData.length,
      data: workloadData,
      summary: {
        totalPartners: workloadData.length,
        availablePartners: workloadData.filter(p => p.IsAvailable).length,
        overCapacity: workloadData.filter(p => p.CurrentWorkload >= p.MaxCapacity).length,
        averageUtilization: Math.round(
          workloadData.reduce((sum, p) => sum + p.UtilizationRate, 0) / workloadData.length * 100
        ) / 100
      }
    });

  } catch (error) {
    console.error('Error fetching partner workload:', error);
    next(error);
  }
});

// GET /api/partners/statistics - Get partner statistics
router.get('/statistics', async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Fetching partner statistics...');

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

    const typeStatsQuery = `
      SELECT PartnerType, COUNT(*) as Count
      FROM Partners
      GROUP BY PartnerType
      ORDER BY Count DESC
    `;

    const [stats, typeStats] = await Promise.all([
      databaseService.executeQuery(statsQuery),
      databaseService.executeQuery(typeStatsQuery)
    ]);

    const data = stats[0];

    const statistics: PartnerStatistics = {
      totalPartners: data.TotalPartners || 0,
      availablePartners: data.AvailablePartners || 0,
      byType: typeStats.reduce((acc, item) => {
        acc[item.PartnerType] = item.Count;
        return acc;
      }, {}),
      averageRating: Math.round((data.AverageRating || 0) * 100) / 100,
      averageExperience: Math.round((data.AverageExperience || 0) * 100) / 100,
      totalCapacity: data.TotalCapacity || 0,
      currentWorkload: data.TotalCurrentWorkload || 0,
      utilizationRate: data.TotalCapacity > 0 ?
        Math.round((data.TotalCurrentWorkload / data.TotalCapacity) * 100 * 100) / 100 : 0
    };

    console.log('Partner statistics calculated successfully');

    res.json({
      success: true,
      data: statistics,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching partner statistics:', error);
    next(error);
  }
});

// GET /api/partners/:id - Get single partner by ID
router.get('/:id', validatePartnerId, handleValidationErrors, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    console.log(`Fetching partner with ID: ${id}`);

    const query = `
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
        ) as ActiveRequests,
        (
          SELECT COUNT(*)
          FROM SupportRequests sr
          WHERE sr.AssignedPartnerID = p.PartnerID
            AND sr.Status = 'Resolved'
        ) as ResolvedRequests,
        (
          SELECT COUNT(*)
          FROM SupportRequests sr
          WHERE sr.AssignedPartnerID = p.PartnerID
        ) as TotalRequests
      FROM Partners p
      WHERE p.PartnerID = @partnerId
    `;

    const partner = await databaseService.executeQuery(query, { partnerId: id });

    if (partner.length === 0) {
      res.status(404).json({
        error: 'Partner not found',
        message: `Partner with ID ${id} not found`
      });
      return;
    }

    // Get recent support requests for this partner
    const recentRequestsQuery = `
      SELECT TOP 5
        sr.RequestID,
        sr.Title,
        sr.Priority,
        sr.Status,
        sr.CreatedAt,
        s.StudentName
      FROM SupportRequests sr
      LEFT JOIN Students s ON sr.StudentID = s.StudentID
      WHERE sr.AssignedPartnerID = @partnerId
      ORDER BY sr.CreatedAt DESC
    `;

    const recentRequests = await databaseService.executeQuery(recentRequestsQuery, { partnerId: id });

    const partnerData = {
      ...partner[0],
      recentRequests
    };

    console.log(`Retrieved partner: ${partner[0].PartnerName}`);

    res.json({
      success: true,
      data: partnerData
    });
    return;

  } catch (error) {
    console.error('Error fetching partner by ID:', error);
    next(error);
    return;
  }
});

// GET /api/partners/types - Get available partner types
router.get('/types', async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Fetching partner types...');

    const query = `
      SELECT
        PartnerType,
        COUNT(*) as Count,
        AVG(CAST(Rating as FLOAT)) as AverageRating,
        SUM(CASE WHEN IsAvailable = 1 THEN 1 ELSE 0 END) as AvailableCount
      FROM Partners
      GROUP BY PartnerType
      ORDER BY Count DESC
    `;

    const partnerTypes = await databaseService.executeQuery(query);

    console.log(`Retrieved ${partnerTypes.length} partner types`);

    res.json({
      success: true,
      count: partnerTypes.length,
      data: partnerTypes
    });

  } catch (error) {
    console.error('Error fetching partner types:', error);
    next(error);
  }
});

export default router;
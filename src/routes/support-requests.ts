import { Router, Request, Response, NextFunction } from 'express';
import { body, param, validationResult, query } from 'express-validator';
import databaseService from '../config/database';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Types
interface SupportRequest {
  RequestID: number;
  StudentID: number;
  StudentName: string;
  StudentNumber: string;
  CategoryID: number;
  CategoryName: string;
  Title: string;
  Description: string;
  Priority: 'Low' | 'Medium' | 'High' | 'Critical';
  Status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  AssignedPartnerID?: number;
  PartnerName?: string;
  PartnerType?: string;
  CreatedAt: string;
  UpdatedAt: string;
  ResolvedAt?: string;
  Notes?: string;
}

interface CreateSupportRequestBody {
  studentId: number;
  categoryId: number;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  notes?: string;
}

interface AssignPartnerBody {
  partnerId: number;
  notes?: string;
}

// Validation middleware
const validateCreateSupportRequest = [
  body('studentId').isInt({ min: 1 }).withMessage('Student ID must be a positive integer'),
  body('categoryId').isInt({ min: 1 }).withMessage('Category ID must be a positive integer'),
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  body('description').trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
  body('priority').isIn(['Low', 'Medium', 'High', 'Critical']).withMessage('Invalid priority level'),
  body('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes must not exceed 1000 characters')
];

const validateAssignPartner = [
  param('id').isInt({ min: 1 }).withMessage('Request ID must be a positive integer'),
  body('partnerId').isInt({ min: 1 }).withMessage('Partner ID must be a positive integer'),
  body('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes must not exceed 1000 characters')
];

const validateRequestId = [
  param('id').isInt({ min: 1 }).withMessage('Request ID must be a positive integer')
];

const validateStatus = [
  param('id').isInt({ min: 1 }).withMessage('Request ID must be a positive integer'),
  body('status').isIn(['Open', 'In Progress', 'Resolved', 'Closed']).withMessage('Invalid status'),
  body('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes must not exceed 1000 characters')
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

// GET /api/support-requests - Get all support requests
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, priority, studentId, partnerId, categoryId } = req.query;

    console.log('Fetching support requests with filters:', { status, priority, studentId, partnerId, categoryId });

    let query = `
      SELECT
        sr.RequestID,
        sr.StudentID,
        s.StudentName,
        s.StudentNumber,
        sr.CategoryID,
        src.CategoryName,
        sr.Title,
        sr.Description,
        sr.Priority,
        sr.Status,
        sr.AssignedPartnerID,
        p.PartnerName,
        p.PartnerType,
        sr.CreatedAt,
        sr.UpdatedAt,
        sr.ResolvedAt,
        sr.Notes
      FROM SupportRequests sr
      LEFT JOIN Students s ON sr.StudentID = s.StudentID
      LEFT JOIN SupportRequestCategories src ON sr.CategoryID = src.CategoryID
      LEFT JOIN Partners p ON sr.AssignedPartnerID = p.PartnerID
      WHERE 1=1
    `;

    const params: any = {};

    if (status) {
      query += ' AND sr.Status = @status';
      params.status = status;
    }

    if (priority) {
      query += ' AND sr.Priority = @priority';
      params.priority = priority;
    }

    if (studentId) {
      query += ' AND sr.StudentID = @studentId';
      params.studentId = studentId;
    }

    if (partnerId) {
      query += ' AND sr.AssignedPartnerID = @partnerId';
      params.partnerId = partnerId;
    }

    if (categoryId) {
      query += ' AND sr.CategoryID = @categoryId';
      params.categoryId = categoryId;
    }

    query += ' ORDER BY sr.CreatedAt DESC';

    const supportRequests = await databaseService.executeQuery<SupportRequest>(query, params);

    console.log(`Retrieved ${supportRequests.length} support requests`);

    res.json({
      success: true,
      count: supportRequests.length,
      filters: { status, priority, studentId, partnerId, categoryId },
      data: supportRequests
    });

  } catch (error) {
    console.error('Error fetching support requests:', error);
    next(error);
  }
});

// POST /api/support-requests - Create new support request
router.post('/', validateCreateSupportRequest, handleValidationErrors, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { studentId, categoryId, title, description, priority, notes }: CreateSupportRequestBody = req.body;

    console.log(`Creating new support request for student ${studentId}`);

    // Verify student exists
    const studentCheck = await databaseService.executeQuery(
      'SELECT StudentID, StudentName FROM Students WHERE StudentID = @studentId AND IsActive = 1',
      { studentId }
    );

    if (studentCheck.length === 0) {
      return res.status(404).json({
        error: 'Student not found',
        message: `Student with ID ${studentId} not found or inactive`
      });
    }

    // Verify category exists
    const categoryCheck = await databaseService.executeQuery(
      'SELECT CategoryID, CategoryName FROM SupportRequestCategories WHERE CategoryID = @categoryId',
      { categoryId }
    );

    if (categoryCheck.length === 0) {
      return res.status(404).json({
        error: 'Category not found',
        message: `Support request category with ID ${categoryId} not found`
      });
    }

    // Insert new support request
    const insertQuery = `
      INSERT INTO SupportRequests (
        StudentID, CategoryID, Title, Description, Priority, Status, Notes, CreatedAt, UpdatedAt
      ) VALUES (
        @studentId, @categoryId, @title, @description, @priority, 'Open', @notes, GETDATE(), GETDATE()
      );
      SELECT SCOPE_IDENTITY() AS RequestID;
    `;

    const insertResult = await databaseService.executeQuery(insertQuery, {
      studentId,
      categoryId,
      title,
      description,
      priority,
      notes: notes || null
    });

    const newRequestId = insertResult[0]?.RequestID;

    if (!newRequestId) {
      throw new Error('Failed to create support request');
    }

    // Fetch the created request with full details
    const createdRequestQuery = `
      SELECT
        sr.RequestID,
        sr.StudentID,
        s.StudentName,
        s.StudentNumber,
        sr.CategoryID,
        src.CategoryName,
        sr.Title,
        sr.Description,
        sr.Priority,
        sr.Status,
        sr.AssignedPartnerID,
        sr.CreatedAt,
        sr.UpdatedAt,
        sr.Notes
      FROM SupportRequests sr
      LEFT JOIN Students s ON sr.StudentID = s.StudentID
      LEFT JOIN SupportRequestCategories src ON sr.CategoryID = src.CategoryID
      WHERE sr.RequestID = @requestId
    `;

    const createdRequest = await databaseService.executeQuery(createdRequestQuery, { requestId: newRequestId });

    console.log(`Successfully created support request ${newRequestId} for student ${studentCheck[0].StudentName}`);

    res.status(201).json({
      success: true,
      message: 'Support request created successfully',
      data: createdRequest[0]
    });

  } catch (error) {
    console.error('Error creating support request:', error);
    return next(error);
  }
});

// PUT /api/support-requests/:id/assign - Assign partner to support request
router.put('/:id/assign', validateAssignPartner, handleValidationErrors, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { partnerId, notes }: AssignPartnerBody = req.body;

    console.log(`Assigning partner ${partnerId} to support request ${id}`);

    // Verify support request exists and is not resolved/closed
    const requestCheck = await databaseService.executeQuery(
      `SELECT RequestID, StudentID, Title, Status, AssignedPartnerID
       FROM SupportRequests
       WHERE RequestID = @requestId`,
      { requestId: id }
    );

    if (requestCheck.length === 0) {
      res.status(404).json({
        error: 'Support request not found',
        message: `Support request with ID ${id} not found`
      });
      return;
    }

    const request = requestCheck[0];

    if (request.Status === 'Resolved' || request.Status === 'Closed') {
      res.status(400).json({
        error: 'Cannot assign partner',
        message: `Cannot assign partner to ${request.Status.toLowerCase()} support request`
      });
      return;
    }

    // Verify partner exists and is available
    const partnerCheck = await databaseService.executeQuery(
      'SELECT PartnerID, PartnerName, PartnerType, IsAvailable FROM Partners WHERE PartnerID = @partnerId',
      { partnerId }
    );

    if (partnerCheck.length === 0) {
      res.status(404).json({
        error: 'Partner not found',
        message: `Partner with ID ${partnerId} not found`
      });
      return;
    }

    const partner = partnerCheck[0];

    if (!partner.IsAvailable) {
      res.status(400).json({
        error: 'Partner not available',
        message: `Partner ${partner.PartnerName} is currently not available for assignment`
      });
      return;
    }

    // Update support request with partner assignment
    const updateQuery = `
      UPDATE SupportRequests
      SET AssignedPartnerID = @partnerId,
          Status = CASE WHEN Status = 'Open' THEN 'In Progress' ELSE Status END,
          Notes = COALESCE(@notes, Notes),
          UpdatedAt = GETDATE()
      WHERE RequestID = @requestId
    `;

    await databaseService.executeQuery(updateQuery, {
      requestId: id,
      partnerId,
      notes: notes || null
    });

    // Fetch updated request details
    const updatedRequestQuery = `
      SELECT
        sr.RequestID,
        sr.StudentID,
        s.StudentName,
        s.StudentNumber,
        sr.CategoryID,
        src.CategoryName,
        sr.Title,
        sr.Description,
        sr.Priority,
        sr.Status,
        sr.AssignedPartnerID,
        p.PartnerName,
        p.PartnerType,
        sr.CreatedAt,
        sr.UpdatedAt,
        sr.ResolvedAt,
        sr.Notes
      FROM SupportRequests sr
      LEFT JOIN Students s ON sr.StudentID = s.StudentID
      LEFT JOIN SupportRequestCategories src ON sr.CategoryID = src.CategoryID
      LEFT JOIN Partners p ON sr.AssignedPartnerID = p.PartnerID
      WHERE sr.RequestID = @requestId
    `;

    const updatedRequest = await databaseService.executeQuery(updatedRequestQuery, { requestId: id });

    console.log(`Successfully assigned partner ${partner.PartnerName} to support request ${id}`);

    res.json({
      success: true,
      message: `Partner ${partner.PartnerName} assigned successfully`,
      data: {
        request: updatedRequest[0],
        previousPartner: request.AssignedPartnerID ? 'Previously assigned' : 'No previous assignment',
        assignedPartner: {
          id: partner.PartnerID,
          name: partner.PartnerName,
          type: partner.PartnerType
        }
      }
    });
    return;

  } catch (error) {
    console.error('Error assigning partner to support request:', error);
    next(error);
    return;
  }
});

// PUT /api/support-requests/:id/status - Update support request status
router.put('/:id/status', validateStatus, handleValidationErrors, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    console.log(`Updating status of support request ${id} to ${status}`);

    // Verify support request exists
    const requestCheck = await databaseService.executeQuery(
      'SELECT RequestID, Status FROM SupportRequests WHERE RequestID = @requestId',
      { requestId: id }
    );

    if (requestCheck.length === 0) {
      res.status(404).json({
        error: 'Support request not found',
        message: `Support request with ID ${id} not found`
      });
      return;
    }

    const currentStatus = requestCheck[0].Status;

    if (currentStatus === status) {
      res.status(400).json({
        error: 'No change required',
        message: `Support request is already in ${status} status`
      });
      return;
    }

    // Build update query based on status
    let updateQuery = `
      UPDATE SupportRequests
      SET Status = @status,
          UpdatedAt = GETDATE()
    `;

    const params: any = { requestId: id, status };

    if (status === 'Resolved' || status === 'Closed') {
      updateQuery += ', ResolvedAt = GETDATE()';
    } else if (currentStatus === 'Resolved' || currentStatus === 'Closed') {
      updateQuery += ', ResolvedAt = NULL';
    }

    if (notes) {
      updateQuery += ', Notes = @notes';
      params.notes = notes;
    }

    updateQuery += ' WHERE RequestID = @requestId';

    await databaseService.executeQuery(updateQuery, params);

    // Fetch updated request
    const updatedRequestQuery = `
      SELECT
        sr.RequestID,
        sr.StudentID,
        s.StudentName,
        sr.Title,
        sr.Priority,
        sr.Status,
        sr.AssignedPartnerID,
        p.PartnerName,
        sr.UpdatedAt,
        sr.ResolvedAt,
        sr.Notes
      FROM SupportRequests sr
      LEFT JOIN Students s ON sr.StudentID = s.StudentID
      LEFT JOIN Partners p ON sr.AssignedPartnerID = p.PartnerID
      WHERE sr.RequestID = @requestId
    `;

    const updatedRequest = await databaseService.executeQuery(updatedRequestQuery, { requestId: id });

    console.log(`Successfully updated support request ${id} status from ${currentStatus} to ${status}`);

    res.json({
      success: true,
      message: `Support request status updated from ${currentStatus} to ${status}`,
      data: {
        request: updatedRequest[0],
        previousStatus: currentStatus,
        newStatus: status,
        updatedAt: new Date().toISOString()
      }
    });
    return;

  } catch (error) {
    console.error('Error updating support request status:', error);
    next(error);
    return;
  }
});

// GET /api/support-requests/:id - Get single support request
router.get('/:id', validateRequestId, handleValidationErrors, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    console.log(`Fetching support request with ID: ${id}`);

    const query = `
      SELECT
        sr.RequestID,
        sr.StudentID,
        s.StudentName,
        s.StudentNumber,
        sr.CategoryID,
        src.CategoryName,
        sr.Title,
        sr.Description,
        sr.Priority,
        sr.Status,
        sr.AssignedPartnerID,
        p.PartnerName,
        p.PartnerType,
        sr.CreatedAt,
        sr.UpdatedAt,
        sr.ResolvedAt,
        sr.Notes
      FROM SupportRequests sr
      LEFT JOIN Students s ON sr.StudentID = s.StudentID
      LEFT JOIN SupportRequestCategories src ON sr.CategoryID = src.CategoryID
      LEFT JOIN Partners p ON sr.AssignedPartnerID = p.PartnerID
      WHERE sr.RequestID = @requestId
    `;

    const supportRequest = await databaseService.executeQuery<SupportRequest>(query, { requestId: id });

    if (supportRequest.length === 0) {
      return res.status(404).json({
        error: 'Support request not found',
        message: `Support request with ID ${id} not found`
      });
    }

    if (supportRequest[0]) {
      console.log(`Retrieved support request: ${supportRequest[0].Title}`);
      return res.json({
        success: true,
        data: supportRequest[0]
      });
    } else {
      console.log('Support request not found or empty result.');
      return res.status(404).json({
        error: 'Support request not found',
        message: `Support request with ID ${id} not found`
      });
    }

  } catch (error) {
    console.error('Error fetching support request by ID:', error);
    return next(error);
  }
});

// GET /api/support-requests/statistics - Get support request statistics
router.get('/statistics', async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Fetching support request statistics...');

    const statsQuery = `
      SELECT
        COUNT(*) as TotalRequests,
        SUM(CASE WHEN Status = 'Open' THEN 1 ELSE 0 END) as OpenRequests,
        SUM(CASE WHEN Status = 'In Progress' THEN 1 ELSE 0 END) as InProgressRequests,
        SUM(CASE WHEN Status = 'Resolved' THEN 1 ELSE 0 END) as ResolvedRequests,
        SUM(CASE WHEN Status = 'Closed' THEN 1 ELSE 0 END) as ClosedRequests,
        SUM(CASE WHEN Priority = 'Critical' THEN 1 ELSE 0 END) as CriticalRequests,
        SUM(CASE WHEN Priority = 'High' THEN 1 ELSE 0 END) as HighPriorityRequests,
        SUM(CASE WHEN AssignedPartnerID IS NOT NULL THEN 1 ELSE 0 END) as AssignedRequests
      FROM SupportRequests
    `;

    const categoryStatsQuery = `
      SELECT src.CategoryName, COUNT(sr.RequestID) as RequestCount
      FROM SupportRequestCategories src
      LEFT JOIN SupportRequests sr ON src.CategoryID = sr.CategoryID
      GROUP BY src.CategoryName
      ORDER BY RequestCount DESC
    `;

    const [stats, categoryStats] = await Promise.all([
      databaseService.executeQuery(statsQuery),
      databaseService.executeQuery(categoryStatsQuery)
    ]);

    const statistics = {
      total: stats[0].TotalRequests || 0,
      byStatus: {
        open: stats[0].OpenRequests || 0,
        inProgress: stats[0].InProgressRequests || 0,
        resolved: stats[0].ResolvedRequests || 0,
        closed: stats[0].ClosedRequests || 0
      },
      byPriority: {
        critical: stats[0].CriticalRequests || 0,
        high: stats[0].HighPriorityRequests || 0
      },
      assigned: stats[0].AssignedRequests || 0,
      unassigned: (stats[0].TotalRequests || 0) - (stats[0].AssignedRequests || 0),
      byCategory: categoryStats.reduce((acc: any, item: any) => {
        acc[item.CategoryName] = item.RequestCount;
        return acc;
      }, {})
    };

    res.json({
      success: true,
      data: statistics,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching support request statistics:', error);
    next(error);
  }
});

export default router;
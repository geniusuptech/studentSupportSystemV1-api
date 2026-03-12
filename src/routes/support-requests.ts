import { Hono } from 'hono';
import { expressToHono } from '../utils/hono-express-adapter';
import databaseService from '../config/database';

const router = new Hono();

/**
 * @swagger
 * /support-requests:
 *   get:
 *     summary: Get all support requests
 *     tags: [Support Requests]
 */
router.get('/', expressToHono(async (req: any, res: any) => {
  const { status, priority, studentId, partnerId, categoryId } = req.query;
  let query = `
    SELECT
      sr.RequestID, sr.StudentID, s.StudentName, s.StudentNumber,
      sr.CategoryID, src.CategoryName, sr.Title, sr.Description,
      sr.Priority, sr.Status, sr.AssignedPartnerID, p.PartnerName,
      p.PartnerType, sr.CreatedAt, sr.UpdatedAt, sr.ResolvedAt, sr.Notes
    FROM SupportRequests sr
    LEFT JOIN Students s ON sr.StudentID = s.StudentID
    LEFT JOIN SupportRequestCategories src ON sr.CategoryID = src.CategoryID
    LEFT JOIN Partners p ON sr.AssignedPartnerID = p.PartnerID
    WHERE 1=1
  `;
  const params: any = {};
  if (status) { query += ' AND sr.Status = @status'; params.status = status; }
  if (priority) { query += ' AND sr.Priority = @priority'; params.priority = priority; }
  if (studentId) { query += ' AND sr.StudentID = @studentId'; params.studentId = studentId; }
  if (partnerId) { query += ' AND sr.AssignedPartnerID = @partnerId'; params.partnerId = partnerId; }
  if (categoryId) { query += ' AND sr.CategoryID = @categoryId'; params.categoryId = categoryId; }
  query += ' ORDER BY sr.CreatedAt DESC';

  const supportRequests = await databaseService.executeQuery(query, params);
  res.json({ success: true, count: supportRequests.length, filters: { status, priority, studentId, partnerId, categoryId }, data: supportRequests });
}));

/**
 * @swagger
 * /support-requests:
 *   post:
 *     summary: Create support request
 *     tags: [Support Requests]
 */
router.post('/', expressToHono(async (req: any, res: any) => {
  const { studentId, categoryId, title, description, priority, notes } = req.body;

  // Restore verification logic
  const studentCheck = await databaseService.executeQuery('SELECT StudentID FROM Students WHERE StudentID = @studentId AND IsActive = 1', { studentId });
  if (studentCheck.length === 0) {
    return res.status(404).json({ error: 'Student not found', message: `Student with ID ${studentId} not found or inactive` });
  }

  const categoryCheck = await databaseService.executeQuery('SELECT CategoryID FROM SupportRequestCategories WHERE CategoryID = @categoryId', { categoryId });
  if (categoryCheck.length === 0) {
    return res.status(404).json({ error: 'Category not found', message: `Support request category with ID ${categoryId} not found` });
  }

  const insertQuery = `
    INSERT INTO SupportRequests (StudentID, CategoryID, Title, Description, Priority, Status, Notes, CreatedAt, UpdatedAt)
    VALUES (@studentId, @categoryId, @title, @description, @priority, 'Open', @notes, GETDATE(), GETDATE());
    SELECT SCOPE_IDENTITY() AS RequestID;
  `;
  const insertResult = await databaseService.executeQuery(insertQuery, { studentId, categoryId, title, description, priority, notes: notes || null });
  const newRequestId = insertResult[0]?.RequestID;

  const createdRequest = await databaseService.executeQuery('SELECT * FROM SupportRequests WHERE RequestID = @requestId', { requestId: newRequestId });
  res.status(201).json({ success: true, message: 'Support request created successfully', data: createdRequest[0] });
}));

/**
 * @swagger
 * /support-requests/{id}/assign:
 *   put:
 *     summary: Assign partner
 *     tags: [Support Requests]
 */
router.put('/:id/assign', expressToHono(async (req: any, res: any) => {
  const { id } = req.params;
  const { partnerId, notes } = req.body;

  const requestCheck = await databaseService.executeQuery('SELECT RequestID, Status FROM SupportRequests WHERE RequestID = @requestId', { requestId: id });
  if (requestCheck.length === 0) return res.status(404).json({ error: 'Not found' });
  if (requestCheck[0].Status === 'Resolved' || requestCheck[0].Status === 'Closed') {
    return res.status(400).json({ error: 'Cannot assign', message: `Cannot assign partner to ${requestCheck[0].Status.toLowerCase()} request` });
  }

  const partnerCheck = await databaseService.executeQuery('SELECT PartnerID, PartnerName, IsAvailable FROM Partners WHERE PartnerID = @partnerId', { partnerId });
  if (partnerCheck.length === 0) return res.status(404).json({ error: 'Partner not found' });
  if (!partnerCheck[0].IsAvailable) return res.status(400).json({ error: 'Partner not available' });

  const updateQuery = `
    UPDATE SupportRequests
    SET AssignedPartnerID = @partnerId,
        Status = CASE WHEN Status = 'Open' THEN 'In Progress' ELSE Status END,
        Notes = COALESCE(@notes, Notes),
        UpdatedAt = GETDATE()
    WHERE RequestID = @requestId
  `;
  await databaseService.executeQuery(updateQuery, { requestId: id, partnerId, notes: notes || null });
  res.json({ success: true, message: `Partner ${partnerCheck[0].PartnerName} assigned successfully` });
}));

/**
 * @swagger
 * /support-requests/statistics:
 *   get:
 *     summary: Get statistics
 *     tags: [Support Requests]
 */
router.get('/statistics', expressToHono(async (req: any, res: any) => {
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
  const categoryStatsQuery = `SELECT src.CategoryName, COUNT(sr.RequestID) as RequestCount FROM SupportRequestCategories src LEFT JOIN SupportRequests sr ON src.CategoryID = sr.CategoryID GROUP BY src.CategoryName ORDER BY RequestCount DESC`;
  const [stats, categoryStats] = await Promise.all([
    databaseService.executeQuery(statsQuery),
    databaseService.executeQuery(categoryStatsQuery)
  ]);
  const statistics = {
    total: stats[0].TotalRequests || 0,
    byStatus: { open: stats[0].OpenRequests || 0, inProgress: stats[0].InProgressRequests || 0, resolved: stats[0].ResolvedRequests || 0, closed: stats[0].ClosedRequests || 0 },
    byPriority: { critical: stats[0].CriticalRequests || 0, high: stats[0].HighPriorityRequests || 0 },
    assigned: stats[0].AssignedRequests || 0,
    unassigned: (stats[0].TotalRequests || 0) - (stats[0].AssignedRequests || 0),
    byCategory: categoryStats.reduce((acc: any, item: any) => { acc[item.CategoryName] = item.RequestCount; return acc; }, {})
  };
  res.json({ success: true, data: statistics, generatedAt: new Date().toISOString() });
}));

/**
 * @swagger
 * /support-requests/{id}:
 *   get:
 *     summary: Get single request
 *     tags: [Support Requests]
 */
router.get('/:id', expressToHono(async (req: any, res: any) => {
  const { id } = req.params;
  const query = `
      SELECT sr.*, s.StudentName, s.StudentNumber, src.CategoryName, p.PartnerName, p.PartnerType
      FROM SupportRequests sr
      LEFT JOIN Students s ON sr.StudentID = s.StudentID
      LEFT JOIN SupportRequestCategories src ON sr.CategoryID = src.CategoryID
      LEFT JOIN Partners p ON sr.AssignedPartnerID = p.PartnerID
      WHERE sr.RequestID = @requestId
    `;
  const results = await databaseService.executeQuery(query, { requestId: id });
  if (results.length === 0) return res.status(404).json({ error: 'Not Found' });
  res.json({ success: true, data: results[0] });
}));

export default router;
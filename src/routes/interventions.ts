import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { dashboardController } from '../controllers/dashboardController';
import { Request, Response, NextFunction } from 'express';

const router = Router();

// Validation middleware
const validateIntervention = [
  body('studentId')
    .isInt({ min: 1 })
    .withMessage('studentId must be a positive integer'),
  body('interventionType')
    .isString()
    .notEmpty()
    .withMessage('interventionType is required'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Critical'])
    .withMessage('Invalid priority. Must be Low, Medium, High, or Critical'),
  body('description')
    .optional()
    .isString()
    .withMessage('description must be a string'),
  body('assignedTo')
    .optional()
    .isString()
    .withMessage('assignedTo must be a string'),
  body('notes')
    .optional()
    .isString()
    .withMessage('notes must be a string')
];

// Validation error handler
const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  return next();
};

/**
 * @swagger
 * /interventions:
 *   post:
 *     summary: Create a new intervention
 *     description: Create a new intervention for a student
 *     tags: [Interventions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *               - interventionType
 *             properties:
 *               studentId:
 *                 type: integer
 *                 example: 1
 *               interventionType:
 *                 type: string
 *                 enum: [Academic Support, Counseling, Peer Mentorship, Financial Aid, Health Services, Career Guidance, Other]
 *                 example: Counseling
 *               description:
 *                 type: string
 *                 example: Weekly counseling sessions
 *               priority:
 *                 type: string
 *                 enum: [Low, Medium, High, Critical]
 *                 example: High
 *               assignedTo:
 *                 type: string
 *                 example: Dr. Sarah Williams
 *               notes:
 *                 type: string
 *                 example: Student requested support
 *     responses:
 *       201:
 *         description: Intervention created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Intervention created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     InterventionID:
 *                       type: integer
 *                       example: 1
 *                     StudentID:
 *                       type: integer
 *                       example: 1
 *                     InterventionType:
 *                       type: string
 *                       example: Counseling
 *                     Status:
 *                       type: string
 *                       example: Active
 *       400:
 *         description: Validation error
 */
router.post('/', validateIntervention, handleValidationErrors, dashboardController.createIntervention);

/**
 * @swagger
 * /interventions/active:
 *   get:
 *     summary: Get all active interventions
 *     description: Returns a list of all active interventions sorted by priority
 *     tags: [Interventions]
 *     responses:
 *       200:
 *         description: List of active interventions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 2
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       InterventionID:
 *                         type: integer
 *                         example: 1
 *                       StudentID:
 *                         type: integer
 *                         example: 1
 *                       StudentName:
 *                         type: string
 *                         example: Lerato Khumalo
 *                       InterventionType:
 *                         type: string
 *                         example: Counseling
 *                       Status:
 *                         type: string
 *                         example: Active
 *                       Priority:
 *                         type: string
 *                         example: Critical
 *                       AssignedTo:
 *                         type: string
 *                         example: Dr. James Mokoena
 */
router.get('/active', dashboardController.getActiveInterventions);

export default router;

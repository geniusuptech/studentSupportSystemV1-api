import { Router, Request, Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';
import { studentsController } from '../controllers/studentsController';

const router = Router();

/**
 * @swagger
 * /students:
 *   get:
 *     summary: Get all students
 *     description: Retrieve a list of all active students with their basic information and active request count
 *     tags: [Students]
 *     responses:
 *       200:
 *         description: Successfully retrieved students
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
 *                   description: Number of students returned
 *                   example: 150
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Student'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /students/{id}:
 *   get:
 *     summary: Get student by ID
 *     description: Retrieve detailed information for a specific student, structured for profile page display
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique student identifier
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 21056789
 *     responses:
 *       200:
 *         description: Successfully retrieved student information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Student'
 *                     - $ref: '#/components/schemas/StudentProfile'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /students/risk/{level}:
 *   get:
 *     summary: Get students by risk level
 *     description: Retrieve all students with a specific risk assessment level
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: level
 *         required: true
 *         description: Risk level to filter by
 *         schema:
 *           type: string
 *           enum: [Safe, At Risk, Critical]
 *           example: At Risk
 *     responses:
 *       200:
 *         description: Successfully retrieved students by risk level
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
 *                   example: 25
 *                 riskLevel:
 *                   type: string
 *                   example: At Risk
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Student'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /students/statistics:
 *   get:
 *     summary: Get student statistics
 *     description: Retrieve comprehensive statistics about students including risk levels, GPA averages, and distributions
 *     tags: [Students]
 *     responses:
 *       200:
 *         description: Successfully retrieved student statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/StudentStatistics'
 *                 generatedAt:
 *                   type: string
 *                   format: date-time
 *                   description: Timestamp when statistics were generated
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /students/{id}/risk:
 *   put:
 *     summary: Update student risk level
 *     description: Update the risk assessment level for a specific student
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique student identifier
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 21056789
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateRiskLevelRequest'
 *     responses:
 *       200:
 *         description: Successfully updated student risk level
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
 *                   example: Student risk level updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     student:
 *                       $ref: '#/components/schemas/Student'
 *                     previousRiskLevel:
 *                       type: string
 *                       example: At Risk
 *                     newRiskLevel:
 *                       type: string
 *                       example: Critical
 *                     reason:
 *                       type: string
 *                       example: Academic performance declined significantly
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - validation error or no change required
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ValidationError'
 *                 - type: object
 *                   properties:
 *                     error:
 *                       type: string
 *                       example: No change required
 *                     message:
 *                       type: string
 *                       example: Student is already at Critical risk level
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

// Validation middleware
const validateStudentId = [
  param('id').isInt({ min: 1 }).withMessage('Student ID must be a positive integer')
];

const validateRiskLevel = [
  param('level').isIn(['Safe', 'At Risk', 'Critical']).withMessage('Invalid risk level')
];

const validateUpdateRisk = [
  param('id').isInt({ min: 1 }).withMessage('Student ID must be a positive integer'),
  body('riskLevel').isIn(['Safe', 'At Risk', 'Critical']).withMessage('Invalid risk level'),
  body('reason').optional().isString().withMessage('Reason must be a string')
];

const validateCreateAssessment = [
  param('id').isInt({ min: 1 }).withMessage('Student ID must be a positive integer'),
  body().custom((value) => {
    const date = value?.Date ?? value?.date;
    const subject = value?.Subject ?? value?.subject;
    const assessment = value?.Assessment ?? value?.assessment;
    const grade = value?.Grade ?? value?.grade;
    const status = value?.Status ?? value?.status;

    const missingFields: string[] = [];
    if (date === undefined || date === null || String(date).trim() === '') missingFields.push('Date');
    if (subject === undefined || subject === null || String(subject).trim() === '') missingFields.push('Subject');
    if (assessment === undefined || assessment === null || String(assessment).trim() === '') missingFields.push('Assessment');
    if (grade === undefined || grade === null || String(grade).trim() === '') missingFields.push('Grade');
    if (status === undefined || status === null || String(status).trim() === '') missingFields.push('Status');

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    return true;
  }),
  body('Date').optional().isISO8601().withMessage('Date must be a valid ISO date (YYYY-MM-DD)'),
  body('date').optional().isISO8601().withMessage('date must be a valid ISO date (YYYY-MM-DD)'),
  body('Grade').optional().isFloat({ min: 0, max: 100 }).withMessage('Grade must be between 0 and 100'),
  body('grade').optional().isFloat({ min: 0, max: 100 }).withMessage('grade must be between 0 and 100')
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

// GET /api/students - Get all students
router.get('/', studentsController.getAllStudents);

// GET /api/students/risk/:level - Get students by risk level
router.get('/risk/:level', validateRiskLevel, handleValidationErrors, studentsController.getStudentsByRiskLevel);

// GET /api/students/statistics - Get student statistics
router.get('/statistics', studentsController.getStudentStatistics);

// PUT /api/students/:id/risk - Update student risk level
router.put('/:id/risk', validateUpdateRisk, handleValidationErrors, studentsController.updateStudentRiskLevel);

// POST /api/students/:id/assessments - Create a student assessment record
router.post('/:id/assessments', validateCreateAssessment, handleValidationErrors, studentsController.createStudentAssessment);

// GET /api/students/:id - Get single student by ID
router.get('/:id', validateStudentId, handleValidationErrors, studentsController.getStudentById);

export default router;

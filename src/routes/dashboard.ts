import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { dashboardController } from '../controllers/dashboardController';
import { Request, Response, NextFunction } from 'express';

const router = Router();

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
 * /dashboard/summary:
 *   get:
 *     summary: Get dashboard summary statistics
 *     description: Returns stat card data including total students, critical students, average GPA, and active interventions
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Dashboard summary data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalStudents:
 *                       type: integer
 *                       example: 35
 *                     criticalStudents:
 *                       type: integer
 *                       example: 12
 *                     averageGPA:
 *                       type: number
 *                       example: 2.85
 *                     activeInterventions:
 *                       type: integer
 *                       example: 2
 */
router.get('/summary', dashboardController.getSummary);

/**
 * @swagger
 * /dashboard/risk-distribution:
 *   get:
 *     summary: Get risk distribution breakdown
 *     description: Returns the distribution of students by risk level with counts and percentages
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Risk distribution data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalStudents:
 *                       type: integer
 *                       example: 35
 *                     categories:
 *                       type: object
 *                       properties:
 *                         safe:
 *                           type: object
 *                           properties:
 *                             count:
 *                               type: integer
 *                               example: 5
 *                             percentage:
 *                               type: integer
 *                               example: 14
 *                             label:
 *                               type: string
 *                               example: Safe
 *                             description:
 *                               type: string
 *                               example: Healthy Progress
 *                         atRisk:
 *                           type: object
 *                           properties:
 *                             count:
 *                               type: integer
 *                               example: 10
 *                             percentage:
 *                               type: integer
 *                               example: 29
 *                             label:
 *                               type: string
 *                               example: At Risk
 *                             description:
 *                               type: string
 *                               example: Under Observation
 *                         critical:
 *                           type: object
 *                           properties:
 *                             count:
 *                               type: integer
 *                               example: 20
 *                             percentage:
 *                               type: integer
 *                               example: 57
 *                             label:
 *                               type: string
 *                               example: Critical
 *                             description:
 *                               type: string
 *                               example: Immediate Action
 */
router.get('/risk-distribution', dashboardController.getRiskDistribution);

export default router;

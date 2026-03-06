import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController';

const router = Router();

/**
 * @swagger
 * /reports/students/export:
 *   get:
 *     summary: Export students report
 *     description: Export all students data in JSON or CSV format
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv]
 *           default: json
 *         description: Export format (json or csv)
 *     responses:
 *       200:
 *         description: Students export data
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
 *                   example: 35
 *                 exportedAt:
 *                   type: string
 *                   format: date-time
 *                   example: 2026-03-06T10:30:00.000Z
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       StudentID:
 *                         type: integer
 *                       StudentName:
 *                         type: string
 *                       StudentNumber:
 *                         type: string
 *                       UniversityName:
 *                         type: string
 *                       ProgramName:
 *                         type: string
 *                       YearOfStudy:
 *                         type: integer
 *                       GPA:
 *                         type: number
 *                       RiskLevel:
 *                         type: string
 *                       ContactEmail:
 *                         type: string
 *                       ActiveInterventions:
 *                         type: integer
 *           text/csv:
 *             schema:
 *               type: string
 *               example: "Student ID,Student Name,..."
 */
router.get('/students/export', dashboardController.exportStudents);

export default router;

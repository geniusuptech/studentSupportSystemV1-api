import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController';

const router = Router();

/**
 * @swagger
 * /programs:
 *   get:
 *     summary: Get all programs
 *     description: Returns a list of all academic programs with student counts
 *     tags: [Programs]
 *     responses:
 *       200:
 *         description: List of programs
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
 *                   example: 8
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       ProgramID:
 *                         type: integer
 *                         example: 1
 *                       ProgramName:
 *                         type: string
 *                         example: BSc Computer Science
 *                       StudentCount:
 *                         type: integer
 *                         example: 10
 */
router.get('/', dashboardController.getPrograms);

export default router;

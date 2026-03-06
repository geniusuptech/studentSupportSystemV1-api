import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController';

const router = Router();

/**
 * @swagger
 * /universities:
 *   get:
 *     summary: Get all universities
 *     description: Returns a list of all universities with student counts
 *     tags: [Universities]
 *     responses:
 *       200:
 *         description: List of universities
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
 *                   example: 6
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       UniversityID:
 *                         type: integer
 *                         example: 1
 *                       UniversityName:
 *                         type: string
 *                         example: University of Cape Town
 *                       StudentCount:
 *                         type: integer
 *                         example: 5
 */
router.get('/', dashboardController.getUniversities);

export default router;

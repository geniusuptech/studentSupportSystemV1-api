import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController';

const router = Router();

/**
 * @swagger
 * /risk-levels:
 *   get:
 *     summary: Get all risk levels
 *     description: Returns a list of all risk level definitions with labels, descriptions, and colors
 *     tags: [Risk Levels]
 *     responses:
 *       200:
 *         description: List of risk levels
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
 *                   example: 3
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       value:
 *                         type: string
 *                         example: Critical
 *                       label:
 *                         type: string
 *                         example: Critical
 *                       description:
 *                         type: string
 *                         example: Student requires immediate intervention and support
 *                       color:
 *                         type: string
 *                         example: "#EF4444"
 */
router.get('/', dashboardController.getRiskLevels);

export default router;

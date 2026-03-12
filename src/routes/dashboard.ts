import { Hono } from 'hono';
import { dashboardController } from '../controllers/dashboardController';
import { expressToHono } from '../utils/hono-express-adapter';

const router = new Hono();

/**
 * @swagger
 * /dashboard/summary:
 *   get:
 *     summary: Get dashboard summary statistics
 *     tags: [Dashboard]
 */
router.get('/summary', expressToHono(dashboardController.getSummary));

/**
 * @swagger
 * /dashboard/risk-distribution:
 *   get:
 *     summary: Get risk distribution
 *     tags: [Dashboard]
 */
router.get('/risk-distribution', expressToHono(dashboardController.getRiskDistribution));

export default router;

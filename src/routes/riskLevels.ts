import { Hono } from 'hono';
import { dashboardController } from '../controllers/dashboardController';

const router = new Hono();

// GET /api/risk-levels - Get all risk levels
router.get('/', (c) => dashboardController.getRiskLevels(c));

// GET /api/risk-levels/student/:studentId - Get risk level by student ID
router.get('/student/:studentId', (c) => dashboardController.getRiskLevelByStudentId(c));

export default router;

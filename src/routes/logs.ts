import { Hono } from 'hono';
import { dashboardController } from '../controllers/dashboardController';

const router = new Hono();

// GET /api/logs
router.get('/', (c) => dashboardController.getLogs(c));

// PUT /api/logs/:id/status
router.put('/:id/status', (c) => dashboardController.updateLogStatus(c));

export default router;

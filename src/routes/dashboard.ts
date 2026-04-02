import { Hono } from 'hono';
import { dashboardController } from '../controllers/dashboardController';

const router = new Hono();

// Root endpoint
router.get('/', (c) => c.json({ 
  message: 'Dashboard API',
  endpoints: ['/summary', '/risk-distribution']
}));

router.get('/summary', (c) => dashboardController.getSummary(c));
router.get('/risk-distribution', (c) => dashboardController.getRiskDistribution(c));

export default router;

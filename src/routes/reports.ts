import { Hono } from 'hono';
import { dashboardController } from '../controllers/dashboardController';

const router = new Hono();

// Root endpoint
router.get('/', (c) => c.json({
  message: 'Reports API',
  endpoints: ['/students/export']
}));

router.get('/students/export', (c) => dashboardController.exportStudents(c));
export default router;

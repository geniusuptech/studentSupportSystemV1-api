import { Hono } from 'hono';
import { dashboardController } from '../controllers/dashboardController';

const router = new Hono();
router.get('/students/export', (c) => dashboardController.exportStudents(c));
export default router;

import { Hono } from 'hono';
import { dashboardController } from '../controllers/dashboardController';
import { expressToHono } from '../utils/hono-express-adapter';

const router = new Hono();
router.get('/students/export', expressToHono(dashboardController.exportStudents));
export default router;

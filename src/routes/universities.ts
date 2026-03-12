import { Hono } from 'hono';
import { dashboardController } from '../controllers/dashboardController';
import { expressToHono } from '../utils/hono-express-adapter';

const router = new Hono();
router.get('/', expressToHono(dashboardController.getUniversities));
export default router;

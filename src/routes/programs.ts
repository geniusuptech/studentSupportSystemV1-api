import { Hono } from 'hono';
import { dashboardController } from '../controllers/dashboardController';

const router = new Hono();
router.get('/', (c) => dashboardController.getPrograms(c));
export default router;

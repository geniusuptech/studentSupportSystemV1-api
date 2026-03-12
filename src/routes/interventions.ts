import { Hono } from 'hono';
import { dashboardController } from '../controllers/dashboardController';
import { expressToHono } from '../utils/hono-express-adapter';

const router = new Hono();

router.post('/', expressToHono(dashboardController.createIntervention));
router.get('/active', expressToHono(dashboardController.getActiveInterventions));

export default router;

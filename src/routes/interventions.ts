import { Hono } from 'hono';
import { dashboardController } from '../controllers/dashboardController';

const router = new Hono();

router.post('/', (c) => dashboardController.createIntervention(c));
router.get('/active', (c) => dashboardController.getActiveInterventions(c));

export default router;

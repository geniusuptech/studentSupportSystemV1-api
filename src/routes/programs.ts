import { Hono } from 'hono';
import { dashboardController } from '../controllers/dashboardController';

const router = new Hono();

// GET /api/programs - Get all programs
router.get('/', (c) => dashboardController.getPrograms(c));

// GET /api/programs/student/:studentId - Get program by student ID
router.get('/student/:studentId', (c) => dashboardController.getProgramsByStudentId(c));

export default router;

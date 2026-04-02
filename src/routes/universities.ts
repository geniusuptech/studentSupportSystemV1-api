import { Hono } from 'hono';
import { dashboardController } from '../controllers/dashboardController';

const router = new Hono();

// GET /api/universities - Get all universities
router.get('/', (c) => dashboardController.getUniversities(c));

// GET /api/universities/student/:studentId - Get university by student ID
router.get('/student/:studentId', (c) => dashboardController.getUniversitiesByStudentId(c));

export default router;

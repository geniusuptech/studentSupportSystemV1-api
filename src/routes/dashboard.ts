import { Hono } from 'hono';
import { dashboardController } from '../controllers/dashboardController';

const router = new Hono();

// Root endpoint
router.get('/', (c) => c.json({ 
  message: 'Dashboard API',
  endpoints: ['/summary', '/risk-distribution', '/students', '/student-management', '/search', '/export']
}));

router.get('/summary', (c) => dashboardController.getSummary(c));
router.get('/risk-distribution', (c) => dashboardController.getRiskDistribution(c));
router.get('/students', (c) => dashboardController.getStudentsForDashboard(c));

// Student Management endpoints
router.get('/student-management', (c) => dashboardController.getStudentManagementStats(c));
router.get('/search', (c) => dashboardController.searchStudents(c));
router.get('/export', (c) => dashboardController.exportStudents(c));

export default router;

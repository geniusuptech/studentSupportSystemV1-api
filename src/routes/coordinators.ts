import { Hono } from 'hono';
import { coordinatorsController } from '../controllers/coordinatorsController';
import { authenticateToken } from '../middleware/auth';

const router = new Hono();

// Root endpoint
router.get('/', (c) => coordinatorsController.getAllCoordinators(c));

// Profile endpoints (must be before :id routes to avoid route conflict)
router.get('/profile', authenticateToken, (c) => coordinatorsController.getProfile(c));
router.put('/profile', authenticateToken, (c) => coordinatorsController.updateProfile(c));

// GET /api/coordinators/:id
router.get('/:id', (c) => coordinatorsController.getCoordinatorById(c));

// PUT /api/coordinators/:id
router.put('/:id', (c) => coordinatorsController.updateCoordinator(c));

// GET /api/coordinators/:id/dashboard
router.get('/:id/dashboard', (c) => coordinatorsController.getCoordinatorDashboard(c));

export default router;

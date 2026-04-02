import { Hono } from 'hono';
import { authController } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = new Hono();

// Root endpoint
router.get('/', (c) => c.json({
  message: 'Authentication API',
  endpoints: ['/login', '/register', '/update-password', '/users', '/users/:id', '/logout', '/me', '/user-details'],
  note: 'Most endpoints require valid credentials'
}));

// POST /api/auth/login - Unified login for all user types (student, coordinator, partner)
router.post('/login', (c) => authController.login(c));

// POST /api/auth/register
router.post('/register', (c) => authController.register(c));

// POST /api/auth/update-password - Update existing user password
router.post('/update-password', (c) => authController.updatePassword(c));

// GET /api/auth/users - Get all users (for admin/setup)
router.get('/users', (c) => authController.getAllUsers(c));

// GET /api/auth/users/:id - Get user by ID
router.get('/users/:id', (c) => authController.getUserById(c));

// GET /api/auth/me
router.get('/me', authenticateToken, (c) => authController.getCurrentUser(c));

// GET /api/auth/user-details - Main endpoint for frontend routing based on userType
router.get('/user-details', authenticateToken, (c) => authController.getUserDetails(c));

// POST /api/auth/change-password
router.post('/change-password', authenticateToken, (c) => authController.changePassword(c));

router.post('/logout', (c) => authController.logout(c));
router.get('/validate-token', (c) => authController.validateToken(c));

// POST /api/auth/deactivate
router.post('/deactivate', authenticateToken, (c) => authController.deactivateAccount(c));

export default router;

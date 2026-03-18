import { Hono } from 'hono';
import { authController } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = new Hono();

// POST /api/auth/login
router.post('/login', (c) => authController.login(c));

// POST /api/auth/register
router.post('/register', (c) => authController.register(c));

// GET /api/auth/me
router.get('/me', authenticateToken, (c) => authController.getCurrentUser(c));
router.get('/profile', authenticateToken, (c) => authController.getCurrentUser(c));

// POST /api/auth/change-password
router.post('/change-password', authenticateToken, (c) => authController.changePassword(c));

router.post('/logout', (c) => authController.logout(c));
router.get('/validate-token', (c) => authController.validateToken(c));

// POST /api/auth/deactivate
router.post('/deactivate', authenticateToken, (c) => authController.deactivateAccount(c));

export default router;
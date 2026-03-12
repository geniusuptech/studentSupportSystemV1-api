import { Hono } from 'hono';
import { AuthController } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { expressToHono } from '../utils/hono-express-adapter';

const router = new Hono();
const authController = new AuthController();

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email: { type: string, format: email }
 *         password: { type: string, format: password }
 *     LoginResponse:
 *       type: object
 *       properties:
 *         success: { type: boolean }
 *         token: { type: string }
 *         user: { type: object }
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 */
router.post('/login', expressToHono(AuthController.validateLogin), expressToHono(authController.login));

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: User registration
 *     tags: [Authentication]
 */
router.post('/register', expressToHono(AuthController.validateRegister), expressToHono(authController.register));

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user
 *     tags: [Authentication]
 */
router.get('/me', expressToHono(authenticateToken), expressToHono(authController.getCurrentUser));

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Change password
 *     tags: [Authentication]
 */
router.post('/change-password', expressToHono(authenticateToken), expressToHono(AuthController.validatePasswordChange), expressToHono(authController.changePassword));

router.post('/logout', expressToHono(authController.logout));
router.get('/validate-token', expressToHono(authController.validateToken));

/**
 * @swagger
 * /auth/deactivate:
 *   post:
 *     summary: Deactivate account
 *     tags: [Authentication]
 */
router.post('/deactivate', expressToHono(authenticateToken), expressToHono(authController.deactivateAccount));

export default router;
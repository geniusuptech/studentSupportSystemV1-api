import { Hono } from 'hono';
import { studentAuthController } from '../controllers/studentAuthController';

const router = new Hono();

router.post('/login', (c) => studentAuthController.login(c));
router.get('/verify', (c) => studentAuthController.verifyToken(c));
router.get('/me', (c) => studentAuthController.getCurrentStudent(c));

export default router;

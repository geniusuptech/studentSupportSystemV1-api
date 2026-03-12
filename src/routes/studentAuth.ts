import { Hono } from 'hono';
import { studentAuthController } from '../controllers/studentAuthController';
import { expressToHono } from '../utils/hono-express-adapter';

const router = new Hono();

router.post('/login', expressToHono(studentAuthController.login));
router.get('/verify', expressToHono(studentAuthController.verifyToken));
router.get('/me', expressToHono(studentAuthController.getCurrentStudent));

export default router;

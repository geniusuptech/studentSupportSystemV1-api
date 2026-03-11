import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { studentAuthController } from '../controllers/studentAuthController';
import { Request, Response, NextFunction } from 'express';

const router = Router();

// Validation middleware
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
];

// Validation error handler
const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  return next();
};

/**
 * @swagger
 * /students/auth/login:
 *   post:
 *     summary: Student login
 *     description: Authenticate a student using email and password
 *     tags: [Student Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: lerato.khumalo@uct.ac.za
 *               password:
 *                 type: string
 *                 format: password
 *                 example: GUPSLEK001
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: JWT token for authentication
 *                     student:
 *                       type: object
 *                       properties:
 *                         studentId:
 *                           type: integer
 *                           example: 1
 *                         studentName:
 *                           type: string
 *                           example: Lerato Khumalo
 *                         studentNumber:
 *                           type: string
 *                           example: STUD21056789
 *                         email:
 *                           type: string
 *                           example: lerato.khumalo@uct.ac.za
 *                         universityName:
 *                           type: string
 *                           example: University of Cape Town
 *                         programName:
 *                           type: string
 *                           example: BSc Computer Science
 *                         riskLevel:
 *                           type: string
 *                           example: At Risk
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication failed
 *       500:
 *         description: Server error
 */
router.post('/login', validateLogin, handleValidationErrors, studentAuthController.login);

/**
 * @swagger
 * /students/auth/verify:
 *   get:
 *     summary: Verify JWT token
 *     description: Verify if the provided JWT token is valid
 *     tags: [Student Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 *       401:
 *         description: Invalid or expired token
 */
router.get('/verify', studentAuthController.verifyToken);

/**
 * @swagger
 * /students/auth/me:
 *   get:
 *     summary: Get current student
 *     description: Get the currently authenticated student's information
 *     tags: [Student Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current student information
 *       401:
 *         description: Not authenticated
 */
router.get('/me', studentAuthController.getCurrentStudent);

export default router;

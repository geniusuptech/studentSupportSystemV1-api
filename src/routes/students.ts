import { Hono } from 'hono';
import { studentsController } from '../controllers/studentsController';
import { expressToHono } from '../utils/hono-express-adapter';

const router = new Hono();

/**
 * @swagger
 * tags:
 *   name: Students
 *   description: Student management and statistics
 */

/**
 * @swagger
 * /students:
 *   get:
 *     summary: Get all students
 *     description: Retrieve a list of all students with optional filtering
 *     tags: [Students]
 *     responses:
 *       200:
 *         description: A list of students
 */
router.get('/', expressToHono(studentsController.getAllStudents));

/**
 * @swagger
 * /students/risk/{level}:
 *   get:
 *     summary: Get students by risk level
 *     tags: [Students]
 */
router.get('/risk/:level', expressToHono(studentsController.getStudentsByRiskLevel));

/**
 * @swagger
 * /students/statistics:
 *   get:
 *     summary: Get student statistics
 *     tags: [Students]
 */
router.get('/statistics', expressToHono(studentsController.getStudentStatistics));

/**
 * @swagger
 * /students/{id}/risk:
 *   put:
 *     summary: Update student risk level
 *     tags: [Students]
 */
router.put('/:id/risk', expressToHono(studentsController.updateStudentRiskLevel));

/**
 * @swagger
 * /students/{id}:
 *   get:
 *     summary: Get student by ID
 *     tags: [Students]
 */
router.get('/:id', expressToHono(studentsController.getStudentById));

export default router;
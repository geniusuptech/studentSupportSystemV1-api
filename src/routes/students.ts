import { Hono } from 'hono';
import { studentsController } from '../controllers/studentsController';

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
// GET /api/students
router.get('/', (c) => studentsController.getAllStudents(c));

/**
 * @swagger
 * /students/risk/{level}:
 *   get:
 *     summary: Get students by risk level
 *     tags: [Students]
 */
// GET /api/students/risk/:level
router.get('/risk/:level', (c) => studentsController.getStudentsByRiskLevel(c));

/**
 * @swagger
 * /students/statistics:
 *   get:
 *     summary: Get student statistics
 *     tags: [Students]
 */
// GET /api/students/statistics
router.get('/statistics', (c) => studentsController.getStudentStatistics(c));

/**
 * @swagger
 * /students/{id}/risk:
 *   put:
 *     summary: Update student risk level
 *     tags: [Students]
 */
// PUT /api/students/:id/risk
router.put('/:id/risk', (c) => studentsController.updateStudentRiskLevel(c));

/**
 * @swagger
 * /students/{id}:
 *   get:
 *     summary: Get student by ID
 *     tags: [Students]
 */
// GET /api/students/:id
router.get('/:id', (c) => studentsController.getStudentById(c));

// GET /api/students/:id/courses
router.get('/:id/courses', (c) => studentsController.getStudentCourses(c));

// GET /api/students/:id/metrics
router.get('/:id/metrics', (c) => studentsController.getStudentMetrics(c));

// GET /api/students/:id/assignments
router.get('/:id/assignments', (c) => studentsController.getStudentAssignments(c));

export default router;
import { Router } from 'express';
import { CoordinatorsController } from '../controllers/coordinatorsController';
import { authenticateToken, requireCoordinatorAccess } from '../middleware/auth';

const router = Router();
const coordinatorsController = new CoordinatorsController();

/**
 * @swagger
 * components:
 *   schemas:
 *     CoordinatorDashboard:
 *       type: object
 *       properties:
 *         totalStudents:
 *           type: number
 *           example: 130
 *         atRiskStudents:
 *           type: number
 *           example: 39
 *         averageGPA:
 *           type: number
 *           format: float
 *           example: 3.2
 *         activeInterventions:
 *           type: number
 *           example: 6
 *         riskDistribution:
 *           type: object
 *           properties:
 *             safe:
 *               type: number
 *               example: 85
 *             atRisk:
 *               type: number
 *               example: 35
 *             critical:
 *               type: number
 *               example: 10
 *         recentActivity:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               ActivityType:
 *                 type: string
 *                 example: "Login"
 *               ActivityDescription:
 *                 type: string
 *                 example: "Student logged into portal"
 *               ActivityDate:
 *                 type: string
 *                 format: date-time
 *               StudentName:
 *                 type: string
 *                 example: "John Doe"
 *     
 *     CoordinatorProfile:
 *       type: object
 *       properties:
 *         CoordinatorID:
 *           type: number
 *           example: 1
 *         CoordinatorName:
 *           type: string
 *           example: "Dr. Sarah Mitchell"
 *         ContactEmail:
 *           type: string
 *           format: email
 *           example: "sarah.mitchell@uct.ac.za"
 *         ContactPhone:
 *           type: string
 *           example: "+27 21 650 4321"
 *         Department:
 *           type: string
 *           example: "Student Services"
 *         UniversityName:
 *           type: string
 *           example: "University of Cape Town"
 *         UniversityCode:
 *           type: string
 *           example: "UCT"
 *     
 *     CoordinatorStudent:
 *       type: object
 *       properties:
 *         StudentID:
 *           type: number
 *           example: 123
 *         StudentName:
 *           type: string
 *           example: "Lerato Khumalo"
 *         StudentNumber:
 *           type: string
 *           example: "KHUMLE001"
 *         YearOfStudy:
 *           type: number
 *           example: 1
 *         GPA:
 *           type: number
 *           format: float
 *           example: 3.25
 *         RiskLevel:
 *           type: string
 *           enum: [Safe, At Risk, Critical]
 *           example: "At Risk"
 *         LastActivityDate:
 *           type: string
 *           format: date-time
 *           example: "2026-03-07T14:30:00Z"
 *         ProgramName:
 *           type: string
 *           example: "BSc Computer Science"
 *         ActiveRequestCount:
 *           type: number
 *           example: 2
 *     
 *     PartnerAssignment:
 *       type: object
 *       required:
 *         - partnerId
 *         - requestType
 *       properties:
 *         partnerId:
 *           type: number
 *           example: 5
 *         requestType:
 *           type: string
 *           example: "Academic Support"
 *         priority:
 *           type: string
 *           enum: [Low, Medium, High, Critical]
 *           example: "Medium"
 *         description:
 *           type: string
 *           example: "Student needs help with calculus course"
 */

/**
 * @swagger
 * tags:
 *   name: Coordinators
 *   description: Coordinator authentication and management endpoints
 */

/**
 * @swagger
 * /coordinators/dashboard:
 *   get:
 *     summary: Get coordinator dashboard data
 *     description: Retrieve comprehensive dashboard statistics for the coordinator's university
 *     tags: [Coordinators]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
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
 *                   example: "Dashboard data retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/CoordinatorDashboard'
 *       401:
 *         description: Unauthorized - authentication required
 *       403:
 *         description: Forbidden - coordinator access required
 *       500:
 *         description: Internal server error
 */
router.get('/dashboard', authenticateToken, requireCoordinatorAccess, coordinatorsController.getDashboard);

/**
 * @swagger
 * /coordinators/profile:
 *   get:
 *     summary: Get coordinator profile
 *     description: Retrieve the current coordinator's profile information
 *     tags: [Coordinators]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
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
 *                   example: "Profile retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/CoordinatorProfile'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Profile not found
 *   put:
 *     summary: Update coordinator profile
 *     description: Update the current coordinator's profile information
 *     tags: [Coordinators]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               coordinatorName:
 *                 type: string
 *                 example: "Dr. Sarah Mitchell"
 *               contactEmail:
 *                 type: string
 *                 format: email
 *                 example: "sarah.mitchell@uct.ac.za"
 *               contactPhone:
 *                 type: string
 *                 example: "+27 21 650 4321"
 *               department:
 *                 type: string
 *                 example: "Student Services"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', authenticateToken, requireCoordinatorAccess, coordinatorsController.getProfile);
router.put('/profile', authenticateToken, requireCoordinatorAccess, CoordinatorsController.validateCoordinatorUpdate, coordinatorsController.updateProfile);

/**
 * @swagger
 * /coordinators/students:
 *   get:
 *     summary: Get students under coordinator's management
 *     description: Retrieve all students from the coordinator's university with optional filtering
 *     tags: [Coordinators]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: riskLevel
 *         schema:
 *           type: string
 *           enum: [Safe, At Risk, Critical]
 *         description: Filter by risk level
 *       - in: query
 *         name: yearOfStudy
 *         schema:
 *           type: number
 *         description: Filter by year of study
 *       - in: query
 *         name: programId
 *         schema:
 *           type: number
 *         description: Filter by program ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by student name or number
 *     responses:
 *       200:
 *         description: Students retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: number
 *                   example: 130
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CoordinatorStudent'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - coordinator access required
 */
router.get('/students', authenticateToken, requireCoordinatorAccess, coordinatorsController.getAllStudents);

/**
 * @swagger
 * /coordinators/statistics:
 *   get:
 *     summary: Get coordinator statistics
 *     description: Retrieve detailed statistics and trends for the coordinator's university
 *     tags: [Coordinators]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: [7days, 30days, 90days, 1year]
 *           default: 30days
 *         description: Time period for statistics
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
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
 *                   example: "Statistics retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     timeframe:
 *                       type: string
 *                       example: "30days"
 *                     studentStats:
 *                       type: object
 *                       properties:
 *                         totalEnrolled:
 *                           type: number
 *                           example: 130
 *                         newEnrollments:
 *                           type: number
 *                           example: 15
 *                     academicStats:
 *                       type: object
 *                       properties:
 *                         averageGPA:
 *                           type: number
 *                           example: 3.2
 *                     supportStats:
 *                       type: object
 *                       properties:
 *                         totalRequests:
 *                           type: number
 *                           example: 45
 *                         resolvedRequests:
 *                           type: number
 *                           example: 39
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/statistics', authenticateToken, requireCoordinatorAccess, coordinatorsController.getStatistics);

/**
 * @swagger
 * /coordinators/support-requests:
 *   get:
 *     summary: Get support requests for coordinator's students
 *     description: Retrieve all support requests from students in the coordinator's university
 *     tags: [Coordinators]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Open, In Progress, Resolved, Closed]
 *         description: Filter by request status
 *       - in: query
 *         name: requestType
 *         schema:
 *           type: string
 *         description: Filter by request type
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [Low, Medium, High, Critical]
 *         description: Filter by request priority
 *       - in: query
 *         name: studentId
 *         schema:
 *           type: number
 *         description: Filter by specific student ID
 *     responses:
 *       200:
 *         description: Support requests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: number
 *                   example: 25
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       RequestID:
 *                         type: number
 *                       RequestType:
 *                         type: string
 *                       Priority:
 *                         type: string
 *                       Status:
 *                         type: string
 *                       StudentName:
 *                         type: string
 *                       PartnerName:
 *                         type: string
 *                       CreatedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/support-requests', authenticateToken, requireCoordinatorAccess, coordinatorsController.getSupportRequests);

/**
 * @swagger
 * /coordinators/students/{studentId}/assign-partner:
 *   post:
 *     summary: Assign a partner to a student
 *     description: Create a new support request and assign a partner to help a specific student
 *     tags: [Coordinators]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: number
 *         description: Student ID to assign partner to
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PartnerAssignment'
 *     responses:
 *       201:
 *         description: Partner assigned successfully
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
 *                   example: "Partner assigned to student successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     RequestID:
 *                       type: number
 *                       example: 12
 *                     StudentID:
 *                       type: number
 *                       example: 123
 *                     AssignedPartnerID:
 *                       type: number
 *                       example: 5
 *                     Status:
 *                       type: string
 *                       example: "Open"
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/students/:studentId/assign-partner', authenticateToken, requireCoordinatorAccess, coordinatorsController.assignPartnerToStudent);

export default router;

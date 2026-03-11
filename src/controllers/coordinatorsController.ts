import { Request, Response, NextFunction } from 'express';
import { validationResult, body } from 'express-validator';
import { coordinatorService } from '../services/coordinatorsServices';
import { AuthenticatedRequest } from '../middleware/auth';

export class CoordinatorsController {
    
    // Validation rules for coordinator updates
    static validateCoordinatorUpdate = [
        body('coordinatorName')
            .optional()
            .isLength({ min: 2 })
            .withMessage('Coordinator name must be at least 2 characters long')
            .matches(/^[a-zA-Z\s.]+$/)
            .withMessage('Coordinator name must contain only letters, spaces, and periods'),
        body('contactEmail')
            .optional()
            .isEmail()
            .normalizeEmail()
            .withMessage('Please provide a valid email address'),
        body('contactPhone')
            .optional()
            .matches(/^[\+]?[0-9\-\s\(\)]+$/)
            .withMessage('Please provide a valid phone number'),
        body('department')
            .optional()
            .isLength({ min: 2 })
            .withMessage('Department name must be at least 2 characters long'),
    ];

    // GET /api/coordinators/dashboard
    getDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                    message: 'Authentication required'
                });
                return;
            }

            if (!req.user.coordinatorID && req.user.userType !== 'Admin') {
                res.status(403).json({
                    success: false,
                    error: 'Forbidden',
                    message: 'Coordinator access required'
                });
                return;
            }

            const coordinatorID = req.user.coordinatorID;
            
            if (!coordinatorID) {
                res.status(400).json({
                    success: false,
                    error: 'Bad Request',
                    message: 'Coordinator ID is required'
                });
                return;
            }

            const dashboard = await coordinatorService.getDashboardData(coordinatorID);

            res.json({
                success: true,
                message: 'Dashboard data retrieved successfully',
                data: dashboard
            });

        } catch (error) {
            console.error('Error fetching coordinator dashboard:', error);
            next(error);
        }
    };

    // GET /api/coordinators/profile
    getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                    message: 'Authentication required'
                });
                return;
            }

            if (!req.user.coordinatorID && req.user.userType !== 'Admin') {
                res.status(403).json({
                    success: false,
                    error: 'Forbidden',
                    message: 'Coordinator access required'
                });
                return;
            }

            let coordinatorID = req.user.coordinatorID;
            
            if (!coordinatorID) {
                res.status(400).json({
                    success: false,
                    error: 'Bad Request',
                    message: 'Coordinator ID is required'
                });
                return;
            }

            const profile = await coordinatorService.getCoordinatorProfile(coordinatorID);

            if (!profile) {
                res.status(404).json({
                    success: false,
                    error: 'Not Found',
                    message: 'Coordinator profile not found'
                });
                return;
            }

            res.json({
                success: true,
                message: 'Profile retrieved successfully',
                data: profile
            });

        } catch (error) {
            console.error('Error fetching coordinator profile:', error);
            next(error);
        }
    };

    // PUT /api/coordinators/profile
    updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                    message: 'Authentication required'
                });
                return;
            }

            if (!req.user.coordinatorID && req.user.userType !== 'Admin') {
                res.status(403).json({
                    success: false,
                    error: 'Forbidden',
                    message: 'Coordinator access required'
                });
                return;
            }

            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    error: 'Validation Error',
                    message: 'Please check your input data',
                    errors: errors.array()
                });
                return;
            }

            let coordinatorID = req.user.coordinatorID;
            
            if (!coordinatorID) {
                res.status(400).json({
                    success: false,
                    error: 'Bad Request',
                    message: 'Coordinator ID is required'
                });
                return;
            }
            const updateData = req.body;

            const updatedProfile = await coordinatorService.updateCoordinatorProfile(coordinatorID, updateData);

            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: updatedProfile
            });

        } catch (error) {
            console.error('Error updating coordinator profile:', error);
            next(error);
        }
    };

    // GET /api/coordinators/students
    getAllStudents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                    message: 'Authentication required'
                });
                return;
            }

            if (!req.user.coordinatorID && req.user.userType !== 'Admin') {
                res.status(403).json({
                    success: false,
                    error: 'Forbidden',
                    message: 'Coordinator access required'
                });
                return;
            }

            const coordinatorID = req.user.coordinatorID;
            
            if (!coordinatorID) {
                res.status(400).json({
                    success: false,
                    error: 'Bad Request',
                    message: 'Coordinator ID is required'
                });
                return;
            }

            const filters = req.query;
            
            const students = await coordinatorService.getStudents(coordinatorID, filters);

            res.json({
                success: true,
                count: students.length,
                data: students
            });

        } catch (error) {
            console.error('Error fetching coordinator students:', error);
            next(error);
        }
    };

    // GET /api/coordinators/statistics
    getStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                    message: 'Authentication required'
                });
                return;
            }

            if (!req.user.coordinatorID && req.user.userType !== 'Admin') {
                res.status(403).json({
                    success: false,
                    error: 'Forbidden',
                    message: 'Coordinator access required'
                });
                return;
            }

            const coordinatorID = req.user.coordinatorID;
            
            if (!coordinatorID) {
                res.status(400).json({
                    success: false,
                    error: 'Bad Request',
                    message: 'Coordinator ID is required'
                });
                return;
            }

            const timeframe = req.query.timeframe as string || '30days';

            const statistics = await coordinatorService.getStatistics(coordinatorID, timeframe);

            res.json({
                success: true,
                message: 'Statistics retrieved successfully',
                data: statistics
            });

        } catch (error) {
            console.error('Error fetching coordinator statistics:', error);
            next(error);
        }
    };

    // GET /api/coordinators/support-requests
    getSupportRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                    message: 'Authentication required'
                });
                return;
            }

            if (!req.user.coordinatorID && req.user.userType !== 'Admin') {
                res.status(403).json({
                    success: false,
                    error: 'Forbidden',
                    message: 'Coordinator access required'
                });
                return;
            }

            const coordinatorID = req.user.coordinatorID;
            
            if (!coordinatorID) {
                res.status(400).json({
                    success: false,
                    error: 'Bad Request',
                    message: 'Coordinator ID is required'
                });
                return;
            }

            const filters = req.query;
            
            const supportRequests = await coordinatorService.getSupportRequests(coordinatorID, filters);

            res.json({
                success: true,
                count: supportRequests.length,
                data: supportRequests
            });

        } catch (error) {
            console.error('Error fetching coordinator support requests:', error);
            next(error);
        }
    };

    // POST /api/coordinators/students/:studentId/assign-partner
    assignPartnerToStudent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                    message: 'Authentication required'
                });
                return;
            }

            if (!req.user.coordinatorID && req.user.userType !== 'Admin') {
                res.status(403).json({
                    success: false,
                    error: 'Forbidden',
                    message: 'Coordinator access required'
                });
                return;
            }

            const { studentId } = req.params;
            const { partnerId, requestType, priority, description } = req.body;
            const coordinatorID = req.user.coordinatorID;

            if (!coordinatorID) {
                res.status(400).json({
                    success: false,
                    error: 'Bad Request',
                    message: 'Coordinator ID is required'
                });
                return;
            }

            if (!studentId || isNaN(parseInt(studentId))) {
                res.status(400).json({
                    success: false,
                    error: 'Validation Error',
                    message: 'Valid student ID is required'
                });
                return;
            }

            if (!partnerId || !requestType) {
                res.status(400).json({
                    success: false,
                    error: 'Validation Error',
                    message: 'Partner ID and request type are required'
                });
                return;
            }

            const assignment = await coordinatorService.assignPartnerToStudent(
                coordinatorID,
                parseInt(studentId),
                partnerId,
                requestType,
                priority,
                description
            );

            res.status(201).json({
                success: true,
                message: 'Partner assigned to student successfully',
                data: assignment
            });

        } catch (error) {
            console.error('Error assigning partner to student:', error);
            next(error);
        }
    };
}

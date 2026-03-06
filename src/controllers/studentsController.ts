import { Request, Response, NextFunction } from 'express';
import { StudentsService } from '../services/studentsServices';

export class StudentsController {
    private studentsService: StudentsService;

    constructor() {
        this.studentsService = new StudentsService();
    }

    // Get all students
    // GET /api/students/getAllStudents
    getAllStudents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            console.log('Fetching all students...');
            
            const filters = req.query; // You can expand this to handle specific filters
            const students = await this.studentsService.getAllStudents(filters);

            console.log(`Retrieved ${students.length} students`);

            res.json({
                success: true,
                count: students.length,
                data: students
            });

        } catch (error) {
            console.error('Error fetching students:', error);
            next(error);
        }
    };

    // Get student by ID - This matches the profile page data structure
    getStudentById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const studentId = parseInt(id || '', 10);

            if (isNaN(studentId) || studentId <= 0) {
                res.status(400).json({
                    error: 'Invalid student ID',
                    message: 'Student ID must be a positive integer'
                });
                return;
            }

            console.log(`Fetching student with ID: ${studentId}`);

            const student = await this.studentsService.getStudentById(studentId);

            if (!student) {
                res.status(404).json({
                    error: 'Student not found',
                    message: `Student with ID ${studentId} not found or inactive`
                });
                return;
            }

            console.log(`Retrieved student: ${student.StudentName}`);

            // Structure the response 
            res.json({
                success: true,
                data: {
                    ...student,
                    // Add any additional fields needed for the profile page
                    StudentInfo: {
                        StudentID: student.StudentID,
                        StudentName: student.StudentName,
                        StudentNumber: student.StudentNumber,
                        RiskLevel: student.RiskLevel,
                        GPA: student.GPA,
                        YearOfStudy: student.YearOfStudy,
                        ContactEmail: student.ContactEmail,
                        ContactPhone: student.ContactPhone,
                        EmergencyContact: student.EmergencyContact,
                        EmergencyPhone: student.EmergencyPhone,
                        DateEnrolled: student.DateEnrolled,
                        LastLoginDate: student.LastLoginDate
                    },
                    UniversityInfo: {
                        UniversityID: student.UniversityID,
                        UniversityName: student.UniversityName
                    },
                    ProgramInfo: {
                        ProgramID: student.ProgramID,
                        ProgramName: student.ProgramName
                    }
                }
            });

        } catch (error) {
            if (error instanceof Error && error.message === 'Student not found') {
                res.status(404).json({
                    error: 'Student not found',
                    message: `Student with ID ${req.params.id} not found or inactive`
                });
                return;
            }
            
            console.error('Error fetching student by ID:', error);
            next(error);
        }
    };

    // Get students by risk level
    getStudentsByRiskLevel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { level } = req.params;
            
            // Validate risk level
            const validRiskLevels = ['Safe', 'At Risk', 'Critical'];
            if (typeof level !== 'string' || !validRiskLevels.includes(level)) {
                res.status(400).json({
                    error: 'Invalid risk level',
                    message: 'Risk level must be one of: Safe, At Risk, Critical'
                });
                return;
            }

            console.log(`Fetching students with risk level: ${level}`);

            const students = await this.studentsService.getStudentsByRiskLevel(level as 'Safe' | 'At Risk' | 'Critical');

            console.log(`Retrieved ${students.length} students with risk level: ${level}`);

            res.json({
                success: true,
                count: students.length,
                riskLevel: level,
                data: students
            });

        } catch (error) {
            console.error('Error fetching students by risk level:', error);
            next(error);
        }
    };

    // Get student statistics
    getStudentStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            console.log('Fetching student statistics...');

            const statistics = await this.studentsService.getStudentStatistics();

            console.log('Student statistics calculated successfully');

            res.json({
                success: true,
                data: statistics,
                generatedAt: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error fetching student statistics:', error);
            next(error);
        }
    };

    // Update student risk level
    updateStudentRiskLevel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const { riskLevel, reason } = req.body;
            const studentId = parseInt(id || '', 10);

            if (isNaN(studentId) || studentId <= 0) {
                res.status(400).json({
                    error: 'Invalid student ID',
                    message: 'Student ID must be a positive integer'
                });
                return;
            }

            console.log(`Updating risk level for student ${studentId} to ${riskLevel}`);

            const result = await this.studentsService.updateStudentRiskLevel(studentId, riskLevel, reason);

            console.log(`Successfully updated student ${studentId} risk level`);

            res.json({
                success: true,
                message: 'Student risk level updated successfully',
                data: result
            });

        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Student not found') {
                    res.status(404).json({
                        error: 'Student not found',
                        message: `Student with ID ${req.params.id} not found or inactive`
                    });
                    return;
                } else if (error.message.includes('No change required')) {
                    res.status(400).json({
                        error: 'No change required',
                        message: error.message
                    });
                    return;
                }
            }
            
            console.error('Error updating student risk level:', error);
            next(error);
        }
    };
}

export const studentsController = new StudentsController();



import { Context } from 'hono';
import { studentsService } from '../services/studentsServices';

export class StudentsController {
    // Get all students
    getAllStudents = async (c: Context) => {
        try {
            const filters = c.req.query();
            const students = await studentsService.getAllStudents(filters);

            return c.json({
                success: true,
                count: students.length,
                data: students
            });
        } catch (error: any) {
            console.error('Error fetching students:', error);
            return c.json({ success: false, error: 'Internal Server Error', message: error.message }, 500);
        }
    };

    // Get student by ID
    getStudentById = async (c: Context) => {
        try {
            const id = c.req.param('id');
            if (!id) return c.json({ error: 'Invalid student ID' }, 400);

            const student = await studentsService.getStudentById(id);
            return c.json({ success: true, data: student });
        } catch (error: any) {
            if (error.message === 'Student not found') {
                return c.json({
                    error: 'Student not found',
                    message: `Student with ID ${c.req.param('id')} not found or inactive`
                }, 404);
            }
            return c.json({ success: false, error: 'Internal Server Error' }, 500);
        }
    };

    // Get students by risk level
    getStudentsByRiskLevel = async (c: Context) => {
        try {
            const level = c.req.param('level');
            const validRiskLevels = ['Safe', 'At Risk', 'Critical'];
            if (!level || !validRiskLevels.includes(level)) {
                return c.json({
                    error: 'Invalid risk level',
                    message: 'Risk level must be one of: Safe, At Risk, Critical'
                }, 400);
            }

            const students = await studentsService.getStudentsByRiskLevel(level as 'Safe' | 'At Risk' | 'Critical');

            return c.json({
                success: true,
                count: students.length,
                riskLevel: level,
                data: students
            });
        } catch (error: any) {
            return c.json({ success: false, error: 'Internal Server Error' }, 500);
        }
    };

    // Get student statistics
    getStudentStatistics = async (c: Context) => {
        try {
            const statistics = await studentsService.getStudentStatistics();
            return c.json({
                success: true,
                data: statistics,
                generatedAt: new Date().toISOString()
            });
        } catch (error: any) {
            return c.json({ success: false, error: 'Internal Server Error' }, 500);
        }
    };

    // Update student risk level
    updateStudentRiskLevel = async (c: Context) => {
        try {
            const id = c.req.param('id');
            const body = await c.req.json();
            const { riskLevel, reason } = body;

            if (!id) return c.json({ error: 'Invalid student ID' }, 400);

            const result = await studentsService.updateStudentRiskLevel(id, riskLevel, reason);

            return c.json({
                success: true,
                message: 'Student risk level updated successfully',
                data: result
            });
        } catch (error: any) {
            if (error.message === 'Student not found') {
                return c.json({
                    error: 'Student not found',
                    message: `Student with ID ${c.req.param('id')} not found or inactive`
                }, 404);
            } else if (error.message.includes('No change required')) {
                return c.json({ error: 'No change required', message: error.message }, 400);
            }
            return c.json({ success: false, error: 'Internal Server Error' }, 500);
        }
    };



    // GET /api/students/:id/assignments
    getStudentAssignments = async (c: Context) => {
        try {
            const id = c.req.param('id');
            const query = `
                SELECT a.*, sc.CourseName, sc.CourseCode
                FROM StudentAssignments a
                LEFT JOIN StudentCourses sc ON a.CourseID = sc.CourseID
                WHERE a.StudentID = @id
                ORDER BY a.DueDate DESC
            `;
            const { default: databaseService } = await import('../config/database');
            const data = await databaseService.executeQuery(query, { id });
            return c.json({ success: true, data });
        } catch (error: any) {
            return c.json({ success: true, data: [] });
        }
    };

    // GET /api/students/:id/courses
    getStudentCoursesData = async (c: Context) => {
        try {
            const id = c.req.param('id');
            const { default: databaseService } = await import('../config/database');
            const query = `SELECT * FROM StudentCourses WHERE StudentID = @id ORDER BY Year DESC, Semester DESC`;
            const data = await databaseService.executeQuery(query, { id });
            return c.json({ success: true, data });
        } catch (error: any) {
            return c.json({ success: true, data: [] });
        }
    };

    // GET /api/students/:id/metrics
    getStudentMetricsData = async (c: Context) => {
        try {
            const id = c.req.param('id');
            const { default: databaseService } = await import('../config/database');
            
            // Try to get from StudentMetrics table first
            const metricsQuery = `SELECT * FROM StudentMetrics WHERE StudentID = @id ORDER BY RecordedAt DESC LIMIT 1`;
            const metrics = await databaseService.executeQuery(metricsQuery, { id });
            
            if (metrics.length > 0) {
                return c.json({ success: true, data: metrics[0] });
            }
            
            // Fallback: calculate from actual data
            const supportQuery = `SELECT COUNT(*) as count FROM SupportRequests WHERE StudentID = @id`;
            const supportData = await databaseService.executeQuery(supportQuery, { id });
            const coursesQuery = `SELECT AVG(GradePoints) as avgGrade FROM StudentCourses WHERE StudentID = @id AND Status = 'Completed'`;
            const coursesData = await databaseService.executeQuery(coursesQuery, { id });
            
            return c.json({ 
                success: true, 
                data: {
                    attendanceRate: 0,
                    assignmentCompletion: 0,
                    averageGrade: coursesData[0]?.avgGrade || 0,
                    wellnessScore: 0,
                    supportRequestsCount: supportData[0]?.count || 0
                } 
            });
        } catch (error: any) {
            return c.json({ 
                success: true, 
                data: { attendanceRate: 0, assignmentCompletion: 0, averageGrade: 0, wellnessScore: 0, supportRequestsCount: 0 } 
            });
        }
    };

    // POST /api/students - Create a new student
    createStudent = async (c: Context) => {
        try {
            const body = await c.req.json();
            if (!body.name && !body.firstName) {
                return c.json({ success: false, error: 'Student name is required' }, 400);
            }
            if (!body.email && !body.contactEmail) {
                return c.json({ success: false, error: 'Email is required' }, 400);
            }
            if (!body.universityId) {
                return c.json({ success: false, error: 'University ID is required' }, 400);
            }
            if (!body.programId) {
                return c.json({ success: false, error: 'Program ID is required' }, 400);
            }
            if (!body.studentNumber && !body.studentId) {
                return c.json({ success: false, error: 'Student number is required' }, 400);
            }

            const student = await studentsService.createStudent(body);
            return c.json({ success: true, message: 'Student created successfully', data: student }, 201);
        } catch (error: any) {
            console.error('Error creating student:', error);
            return c.json({ success: false, error: error.message || 'Internal Server Error' }, 500);
        }
    };

    // PUT /api/students/:id - Update student
    updateStudent = async (c: Context) => {
        try {
            const id = c.req.param('id');
            if (!id) return c.json({ error: 'Invalid student ID' }, 400);

            const body = await c.req.json();
            const student = await studentsService.updateStudent(id, body);
            return c.json({ success: true, message: 'Student updated successfully', data: student });
        } catch (error: any) {
            if (error.message === 'Student not found') {
                return c.json({ error: 'Student not found' }, 404);
            }
            console.error('Error updating student:', error);
            return c.json({ success: false, error: 'Internal Server Error' }, 500);
        }
    };

    // DELETE /api/students/:id - Delete (soft delete) student
    deleteStudent = async (c: Context) => {
        try {
            const id = c.req.param('id');
            if (!id) return c.json({ error: 'Invalid student ID' }, 400);

            await studentsService.deleteStudent(id);
            return c.json({ success: true, message: 'Student deactivated successfully' });
        } catch (error: any) {
            if (error.message === 'Student not found') {
                return c.json({ error: 'Student not found' }, 404);
            }
            console.error('Error deleting student:', error);
            return c.json({ success: false, error: 'Internal Server Error' }, 500);
        }
    };
}

export const studentsController = new StudentsController();

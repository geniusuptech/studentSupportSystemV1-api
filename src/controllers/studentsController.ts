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
}

export const studentsController = new StudentsController();

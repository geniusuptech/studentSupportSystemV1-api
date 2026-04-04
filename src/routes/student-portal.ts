import { Hono } from 'hono';
import { authenticateToken } from '../middleware/auth';
import { studentPortalRepository } from '../repository/studentPortalRepository';
import { AuthTokenPayload } from '../models/User';

const router = new Hono();

// Helper: extract studentID from JWT token
function getStudentId(c: any): string | null {
    const user = c.get('user') as AuthTokenPayload;
    if (!user) return null;
    return (user.studentID || user.userID || '').toString();
}

// Root endpoint
router.get('/', (c) => c.json({
    message: 'Student Portal API',
    endpoints: [
        '/dashboard', '/profile', '/courses', '/courses/summary',
        '/assignments', '/assignments/summary', '/grades',
        '/support-requests', '/support-requests/categories',
        '/wellness', '/wellness/checkin',
        '/schedule', '/settings', '/notifications'
    ],
    note: 'All endpoints require student authentication'
}));

// ==================== DASHBOARD ====================

// GET /api/student-portal/dashboard
router.get('/dashboard', authenticateToken, async (c) => {
    try {
        const studentId = getStudentId(c);
        if (!studentId) return c.json({ success: false, error: 'Student ID not found in token' }, 400);
        
        const dashboard = await studentPortalRepository.getStudentDashboard(studentId);
        return c.json({ success: true, data: dashboard });
    } catch (error: any) {
        console.error('Error fetching student dashboard:', error);
        if (error.message === 'Student not found') {
            return c.json({ success: false, error: 'Student not found' }, 404);
        }
        return c.json({ success: false, error: 'Internal Server Error' }, 500);
    }
});

// ==================== PROFILE ====================

// GET /api/student-portal/profile
router.get('/profile', authenticateToken, async (c) => {
    try {
        const studentId = getStudentId(c);
        if (!studentId) return c.json({ success: false, error: 'Student ID not found in token' }, 400);
        
        const profile = await studentPortalRepository.getStudentProfile(studentId);
        return c.json({ success: true, data: profile });
    } catch (error: any) {
        console.error('Error fetching student profile:', error);
        if (error.message === 'Student not found') {
            return c.json({ success: false, error: 'Student not found' }, 404);
        }
        return c.json({ success: false, error: 'Internal Server Error' }, 500);
    }
});

// PUT /api/student-portal/profile
router.put('/profile', authenticateToken, async (c) => {
    try {
        const studentId = getStudentId(c);
        if (!studentId) return c.json({ success: false, error: 'Student ID not found in token' }, 400);
        
        const body = await c.req.json();
        const profile = await studentPortalRepository.updateStudentProfile(studentId, body);
        return c.json({ success: true, message: 'Profile updated successfully', data: profile });
    } catch (error: any) {
        console.error('Error updating student profile:', error);
        return c.json({ success: false, error: 'Internal Server Error' }, 500);
    }
});

// ==================== COURSES ====================

// GET /api/student-portal/courses
router.get('/courses', authenticateToken, async (c) => {
    try {
        const studentId = getStudentId(c);
        if (!studentId) return c.json({ success: false, error: 'Student ID not found in token' }, 400);
        
        const filters = c.req.query();
        const courses = await studentPortalRepository.getStudentCourses(studentId, filters);
        return c.json({ success: true, count: courses.length, data: courses });
    } catch (error: any) {
        console.error('Error fetching student courses:', error);
        return c.json({ success: true, count: 0, data: [] });
    }
});

// GET /api/student-portal/courses/summary
router.get('/courses/summary', authenticateToken, async (c) => {
    try {
        const studentId = getStudentId(c);
        if (!studentId) return c.json({ success: false, error: 'Student ID not found in token' }, 400);
        
        const summary = await studentPortalRepository.getCourseSummary(studentId);
        return c.json({ success: true, data: summary });
    } catch (error: any) {
        console.error('Error fetching course summary:', error);
        return c.json({ success: false, error: 'Internal Server Error' }, 500);
    }
});

// ==================== ASSIGNMENTS ====================

// GET /api/student-portal/assignments
router.get('/assignments', authenticateToken, async (c) => {
    try {
        const studentId = getStudentId(c);
        if (!studentId) return c.json({ success: false, error: 'Student ID not found in token' }, 400);
        
        const filters = c.req.query();
        const assignments = await studentPortalRepository.getStudentAssignments(studentId, filters);
        return c.json({ success: true, count: assignments.length, data: assignments });
    } catch (error: any) {
        console.error('Error fetching student assignments:', error);
        return c.json({ success: true, count: 0, data: [] });
    }
});

// GET /api/student-portal/assignments/summary
router.get('/assignments/summary', authenticateToken, async (c) => {
    try {
        const studentId = getStudentId(c);
        if (!studentId) return c.json({ success: false, error: 'Student ID not found in token' }, 400);
        
        const summary = await studentPortalRepository.getAssignmentSummary(studentId);
        return c.json({ success: true, data: summary });
    } catch (error: any) {
        console.error('Error fetching assignment summary:', error);
        return c.json({ success: false, error: 'Internal Server Error' }, 500);
    }
});

// ==================== GRADES ====================

// GET /api/student-portal/grades
router.get('/grades', authenticateToken, async (c) => {
    try {
        const studentId = getStudentId(c);
        if (!studentId) return c.json({ success: false, error: 'Student ID not found in token' }, 400);
        
        const grades = await studentPortalRepository.getStudentGrades(studentId);
        return c.json({ success: true, data: grades });
    } catch (error: any) {
        console.error('Error fetching student grades:', error);
        return c.json({ success: false, error: 'Internal Server Error' }, 500);
    }
});

// ==================== SUPPORT REQUESTS ====================

// GET /api/student-portal/support-requests
router.get('/support-requests', authenticateToken, async (c) => {
    try {
        const studentId = getStudentId(c);
        if (!studentId) return c.json({ success: false, error: 'Student ID not found in token' }, 400);
        
        const filters = c.req.query();
        const requests = await studentPortalRepository.getStudentSupportRequests(studentId, filters);
        return c.json({ success: true, count: requests.length, data: requests });
    } catch (error: any) {
        console.error('Error fetching student support requests:', error);
        return c.json({ success: true, count: 0, data: [] });
    }
});

// POST /api/student-portal/support-requests
router.post('/support-requests', authenticateToken, async (c) => {
    try {
        const studentId = getStudentId(c);
        if (!studentId) return c.json({ success: false, error: 'Student ID not found in token' }, 400);
        
        const body = await c.req.json();
        if (!body.title || !body.description) {
            return c.json({ success: false, message: 'Title and description are required' }, 400);
        }
        
        const request = await studentPortalRepository.createStudentSupportRequest(studentId, body);
        return c.json({ success: true, message: 'Support request created successfully', data: request }, 201);
    } catch (error: any) {
        console.error('Error creating support request:', error);
        return c.json({ success: false, error: 'Internal Server Error' }, 500);
    }
});

// GET /api/student-portal/support-requests/categories
router.get('/support-requests/categories', async (c) => {
    try {
        const categories = await studentPortalRepository.getSupportCategories();
        return c.json({ success: true, data: categories });
    } catch (error: any) {
        console.error('Error fetching support categories:', error);
        return c.json({ success: true, data: [] });
    }
});

// ==================== WELLNESS ====================

// GET /api/student-portal/wellness
router.get('/wellness', authenticateToken, async (c) => {
    try {
        const studentId = getStudentId(c);
        if (!studentId) return c.json({ success: false, error: 'Student ID not found in token' }, 400);
        
        const wellness = await studentPortalRepository.getStudentWellness(studentId);
        return c.json({ success: true, data: wellness });
    } catch (error: any) {
        console.error('Error fetching student wellness:', error);
        return c.json({ success: false, error: 'Internal Server Error' }, 500);
    }
});

// POST /api/student-portal/wellness/checkin
router.post('/wellness/checkin', authenticateToken, async (c) => {
    try {
        const studentId = getStudentId(c);
        if (!studentId) return c.json({ success: false, error: 'Student ID not found in token' }, 400);
        
        const body = await c.req.json();
        const checkin = await studentPortalRepository.createWellnessCheckin(studentId, body);
        return c.json({ success: true, message: 'Wellness check-in recorded', data: checkin }, 201);
    } catch (error: any) {
        console.error('Error creating wellness checkin:', error);
        return c.json({ success: false, error: 'Internal Server Error' }, 500);
    }
});

// ==================== SCHEDULE ====================

// GET /api/student-portal/schedule
router.get('/schedule', authenticateToken, async (c) => {
    try {
        const studentId = getStudentId(c);
        if (!studentId) return c.json({ success: false, error: 'Student ID not found in token' }, 400);
        
        const filters = c.req.query();
        const schedule = await studentPortalRepository.getStudentSchedule(studentId, filters);
        return c.json({ success: true, count: schedule.length, data: schedule });
    } catch (error: any) {
        console.error('Error fetching student schedule:', error);
        return c.json({ success: true, count: 0, data: [] });
    }
});

// POST /api/student-portal/schedule
router.post('/schedule', authenticateToken, async (c) => {
    try {
        const studentId = getStudentId(c);
        if (!studentId) return c.json({ success: false, error: 'Student ID not found in token' }, 400);
        
        const body = await c.req.json();
        if (!body.title || !body.dayOfWeek || !body.startTime || !body.endTime) {
            return c.json({ success: false, message: 'title, dayOfWeek, startTime, and endTime are required' }, 400);
        }
        
        const item = await studentPortalRepository.addScheduleItem(studentId, body);
        return c.json({ success: true, message: 'Schedule item added', data: item }, 201);
    } catch (error: any) {
        console.error('Error adding schedule item:', error);
        return c.json({ success: false, error: 'Internal Server Error' }, 500);
    }
});

// DELETE /api/student-portal/schedule/:id
router.delete('/schedule/:id', authenticateToken, async (c) => {
    try {
        const studentId = getStudentId(c);
        if (!studentId) return c.json({ success: false, error: 'Student ID not found in token' }, 400);
        
        const scheduleId = c.req.param('id');
        if (!scheduleId) return c.json({ success: false, message: 'Schedule ID is required' }, 400);
        
        await studentPortalRepository.deleteScheduleItem(scheduleId, studentId);
        return c.json({ success: true, message: 'Schedule item removed' });
    } catch (error: any) {
        console.error('Error deleting schedule item:', error);
        return c.json({ success: false, error: 'Internal Server Error' }, 500);
    }
});

// ==================== SETTINGS ====================

// GET /api/student-portal/settings
router.get('/settings', authenticateToken, async (c) => {
    try {
        const studentId = getStudentId(c);
        if (!studentId) return c.json({ success: false, error: 'Student ID not found in token' }, 400);
        
        const settings = await studentPortalRepository.getStudentSettings(studentId);
        return c.json({ success: true, data: settings });
    } catch (error: any) {
        console.error('Error fetching student settings:', error);
        return c.json({ success: false, error: 'Internal Server Error' }, 500);
    }
});

// PUT /api/student-portal/settings
router.put('/settings', authenticateToken, async (c) => {
    try {
        const studentId = getStudentId(c);
        if (!studentId) return c.json({ success: false, error: 'Student ID not found in token' }, 400);
        
        const body = await c.req.json();
        const settings = await studentPortalRepository.updateStudentSettings(studentId, body);
        return c.json({ success: true, message: 'Settings updated successfully', data: settings });
    } catch (error: any) {
        console.error('Error updating student settings:', error);
        return c.json({ success: false, error: 'Internal Server Error' }, 500);
    }
});

export default router;

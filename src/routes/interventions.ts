import { Hono } from 'hono';
import { interventionsRepository } from '../repository/interventionsRepository';

const router = new Hono();

// POST /api/interventions - Create a new intervention
router.post('/', async (c) => {
    try {
        const body = await c.req.json();
        if (!body.studentID && !body.studentId) {
            return c.json({ success: false, error: 'Validation Error', message: 'studentID is required' }, 400);
        }
        if (!body.type) {
            return c.json({ success: false, error: 'Validation Error', message: 'type is required' }, 400);
        }
        // Normalize field names (camelCase or PascalCase)
        const normalizedBody = {
            studentId: body.studentID || body.studentId,
            coordinatorId: body.coordinatorID || body.cordiantorID || body.coordinatorId,
            type: body.type,
            interventionType: body.interventionType,
            riskLevel: body.riskLevel,
            priority: body.priority,
            followUpDate: body.followUpDate,
            notes: body.notes,
            status: body.status
        };
        const intervention = await interventionsRepository.createIntervention(normalizedBody);
        return c.json({ success: true, message: 'Intervention created successfully', data: intervention }, 201);
    } catch (error: any) {
        console.error('Error creating intervention:', error);
        return c.json({ success: false, error: 'Internal Server Error' }, 500);
    }
});

// GET /api/interventions - Get all interventions
router.get('/', async (c) => {
    try {
        const filters = c.req.query();
        const interventions = await interventionsRepository.getAllInterventions(filters);
        return c.json({ success: true, count: interventions.length, data: interventions });
    } catch (error: any) {
        console.error('Error fetching interventions:', error);
        return c.json({ success: true, count: 0, data: [] });
    }
});

// GET /api/interventions/active
router.get('/active', async (c) => {
    try {
        const filters = c.req.query();
        const interventions = await interventionsRepository.getActiveInterventions(filters);
        return c.json({ success: true, count: interventions.length, data: interventions });
    } catch (error: any) {
        console.error('Error fetching active interventions:', error);
        return c.json({ success: true, count: 0, data: [] });
    }
});

// GET /api/interventions/statistics
router.get('/statistics', async (c) => {
    try {
        const stats = await interventionsRepository.getInterventionStats();
        return c.json({ success: true, data: stats });
    } catch (error: any) {
        console.error('Error fetching intervention statistics:', error);
        return c.json({ success: false, error: 'Internal Server Error' }, 500);
    }
});

// GET /api/interventions/:id
router.get('/:id', async (c) => {
    try {
        const id = c.req.param('id');
        const intervention = await interventionsRepository.getInterventionById(id);
        if (!intervention) return c.json({ success: false, error: 'Not Found' }, 404);
        return c.json({ success: true, data: intervention });
    } catch (error: any) {
        console.error('Error fetching intervention:', error);
        return c.json({ success: false, error: 'Internal Server Error' }, 500);
    }
});

// PUT /api/interventions/:id - Update intervention
router.put('/:id', async (c) => {
    try {
        const id = c.req.param('id');
        const body = await c.req.json();
        const intervention = await interventionsRepository.updateIntervention(id, body);
        if (!intervention) return c.json({ success: false, error: 'Not Found' }, 404);
        return c.json({ success: true, message: 'Intervention updated successfully', data: intervention });
    } catch (error: any) {
        console.error('Error updating intervention:', error);
        return c.json({ success: false, error: 'Internal Server Error' }, 500);
    }
});

export default router;

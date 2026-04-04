import { Hono } from 'hono';
import { activityLogsRepository } from '../repository/activityLogsRepository';

const router = new Hono();

// GET /api/logs
router.get('/', async (c) => {
    try {
        const filters = c.req.query();
        const logs = await activityLogsRepository.getLogs(filters);
        return c.json({ success: true, count: logs.length, data: logs });
    } catch (error: any) {
        console.error('Error fetching logs:', error);
        return c.json({ success: true, count: 0, data: [] });
    }
});

// GET /api/logs/entity/:type/:id - Get logs for a specific entity
router.get('/entity/:type/:id', async (c) => {
    try {
        const entityType = c.req.param('type');
        const entityId = c.req.param('id');
        const logs = await activityLogsRepository.getLogsByEntity(entityType, entityId);
        return c.json({ success: true, count: logs.length, data: logs });
    } catch (error: any) {
        console.error('Error fetching entity logs:', error);
        return c.json({ success: true, count: 0, data: [] });
    }
});

// POST /api/logs - Create a new activity log
router.post('/', async (c) => {
    try {
        const body = await c.req.json();
        if (!body.action) {
            return c.json({ success: false, message: 'Action is required' }, 400);
        }
        const log = await activityLogsRepository.createLog({
            userType: body.userType || 'system',
            userId: body.userId || 0,
            action: body.action,
            entityType: body.entityType,
            entityId: body.entityId,
            details: body.details
        });
        return c.json({ success: true, data: log }, 201);
    } catch (error: any) {
        console.error('Error creating log:', error);
        return c.json({ success: false, message: 'Failed to create log' }, 500);
    }
});

// PUT /api/logs/:id/status
router.put('/:id/status', async (c) => {
    try {
        const id = c.req.param('id');
        const body = await c.req.json();
        await activityLogsRepository.updateLogStatus(id, body.details || body.status);
        return c.json({ success: true, message: 'Log status updated successfully' });
    } catch (error: any) {
        console.error('Error updating log:', error);
        return c.json({ success: false, message: 'Failed to update log' }, 500);
    }
});

export default router;

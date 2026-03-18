import { Hono } from 'hono';
import { supportRequestsRepository } from '../repository/supportRequestsRepository';

const router = new Hono();

// GET /api/support-requests
router.get('/', async (c) => {
    try {
        const query = c.req.query();
        const supportRequests = await supportRequestsRepository.getAllRequests(query);
        return c.json({ success: true, count: supportRequests.length, data: supportRequests });
    } catch (error: any) {
        console.error('Error fetching support requests:', error);
        return c.json({ success: false, message: 'Failed to fetch support requests' }, 500);
    }
});

// POST /api/support-requests
router.post('/', async (c) => {
    try {
        const body = await c.req.json();
        const newRequest = await supportRequestsRepository.createRequest(body);
        return c.json({ success: true, message: 'Support request created successfully', data: newRequest }, 201);
    } catch (error: any) {
        console.error('Error creating support request:', error);
        return c.json({ success: false, message: 'Failed to create support request' }, 500);
    }
});

// PUT /api/support-requests/:id/assign
router.put('/:id/assign', async (c) => {
    try {
        const id = c.req.param('id');
        const { partnerId } = await c.req.json();
        await supportRequestsRepository.assignPartner(id, partnerId);
        return c.json({ success: true, message: 'Partner assigned successfully' });
    } catch (error: any) {
        console.error('Error assigning partner:', error);
        return c.json({ success: false, message: 'Failed to assign partner' }, 500);
    }
});

// GET /api/support-requests/statistics
router.get('/statistics', async (c) => {
    try {
        const statistics = await supportRequestsRepository.getStatistics();
        return c.json({ success: true, data: statistics });
    } catch (error: any) {
        console.error('Error fetching statistics:', error);
        return c.json({ success: false, message: 'Failed to fetch statistics' }, 500);
    }
});

// GET /api/support-requests/:id
router.get('/:id', async (c) => {
    try {
        const id = c.req.param('id');
        const result = await supportRequestsRepository.getRequestById(id);
        if (!result) return c.json({ error: 'Not Found' }, 404);
        return c.json({ success: true, data: result });
    } catch (error: any) {
        console.error('Error fetching support request:', error);
        return c.json({ success: false, message: 'Failed to fetch support request' }, 500);
    }
});

export default router;
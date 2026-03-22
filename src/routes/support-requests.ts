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
        let body: any;
        const contentType = c.req.header('content-type') || '';
        
        if (contentType.includes('multipart/form-data') || contentType.includes('form-data')) {
            const formData = await c.req.parseBody();
            if (formData.data) {
                try {
                    body = JSON.parse(formData.data as string);
                } catch (e) {
                    body = formData;
                }
            } else {
                body = formData;
            }
        } else {
            body = await c.req.json();
        }
        
        const newRequest = await supportRequestsRepository.createRequest(body);
        return c.json({ success: true, message: 'Support request created successfully', data: newRequest }, 201);
    } catch (error: any) {
        console.error('Error creating support request:', error);
        return c.json({ success: false, message: 'Failed to create support request', error: error.message }, 500);
    }
});

// PATCH /api/support-requests/:id
router.patch('/:id', async (c) => {
    try {
        const id = c.req.param('id');
        const body = await c.req.json();
        
        // Detailed update mapping if needed, but for now support status/priority
        if (body.status) {
            await supportRequestsRepository.updateStatus(id, body.status);
        }
        // In a real app we'd have a generic update method in repository
        
        return c.json({ success: true, message: 'Request updated successfully' });
    } catch (error: any) {
        console.error('Error updating support request:', error);
        return c.json({ success: false, message: 'Failed to update support request' }, 500);
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

// PUT /api/support-requests/:id/status
router.put('/:id/status', async (c) => {
    try {
        const id = c.req.param('id');
        const { status } = await c.req.json();
        await supportRequestsRepository.updateStatus(id, status);
        return c.json({ success: true, message: 'Status updated successfully' });
    } catch (error: any) {
        console.error('Error updating status:', error);
        return c.json({ success: false, message: 'Failed to update status' }, 500);
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
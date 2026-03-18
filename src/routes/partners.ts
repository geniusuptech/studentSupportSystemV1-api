import { Hono } from 'hono';
import { partnersRepository } from '../repository/partnersRepository';

const router = new Hono();

// GET /api/partners
router.get('/', async (c) => {
    try {
        const query = c.req.query();
        const partners = await partnersRepository.getAllPartners(query);
        return c.json({ success: true, count: partners.length, data: partners });
    } catch (error: any) {
        console.error('Error fetching partners:', error);
        return c.json({ success: false, message: 'Failed to fetch partners' }, 500);
    }
});

// GET /api/partners/available
router.get('/available', async (c) => {
    try {
        const query = c.req.query();
        const availablePartners = await partnersRepository.getAvailablePartners(query);
        return c.json({ success: true, count: availablePartners.length, data: availablePartners });
    } catch (error: any) {
        console.error('Error fetching available partners:', error);
        return c.json({ success: false, message: 'Failed to fetch available partners' }, 500);
    }
});

// GET /api/partners/workload
router.get('/workload', async (c) => {
    try {
        const { data, summary } = await partnersRepository.getWorkloadAnalysis();
        return c.json({ success: true, data, summary });
    } catch (error: any) {
        console.error('Error fetching workload analysis:', error);
        return c.json({ success: false, message: 'Failed to fetch workload analysis' }, 500);
    }
});

// GET /api/partners/statistics
router.get('/statistics', async (c) => {
    try {
        const statistics = await partnersRepository.getStatistics();
        return c.json({ success: true, data: statistics });
    } catch (error: any) {
        console.error('Error fetching partner statistics:', error);
        return c.json({ success: false, message: 'Failed to fetch partner statistics' }, 500);
    }
});

// GET /api/partners/:id
router.get('/:id', async (c) => {
    try {
        const id = c.req.param('id');
        const result = await partnersRepository.getPartnerDetails(id);
        if (!result) return c.json({ error: 'Partner not found' }, 404);
        return c.json({ success: true, data: result });
    } catch (error: any) {
        console.error('Error fetching partner details:', error);
        return c.json({ success: false, message: 'Failed to fetch partner details' }, 500);
    }
});

export default router;
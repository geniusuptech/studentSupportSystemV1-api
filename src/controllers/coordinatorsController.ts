import { Context } from 'hono';
import { coordinatorsRepository } from '../repository/coordinatorsRepository';

export class CoordinatorsController {
    // GET /api/coordinators - Get all coordinators
    getAllCoordinators = async (c: Context) => {
        try {
            const filters = c.req.query();
            const coordinators = await coordinatorsRepository.getAllCoordinators(filters);
            return c.json({ success: true, count: coordinators.length, data: coordinators });
        } catch (error: any) {
            console.error('Error fetching coordinators:', error);
            return c.json({ success: false, error: 'Internal Server Error' }, 500);
        }
    };

    // GET /api/coordinators/:id - Get coordinator by ID
    getCoordinatorById = async (c: Context) => {
        try {
            const id = c.req.param('id');
            if (!id) return c.json({ success: false, error: 'Coordinator ID is required' }, 400);
            const coordinator = await coordinatorsRepository.getCoordinatorById(id);
            if (!coordinator) {
                return c.json({ success: false, error: 'Coordinator not found' }, 404);
            }
            return c.json({ success: true, data: coordinator });
        } catch (error: any) {
            console.error('Error fetching coordinator:', error);
            return c.json({ success: false, error: 'Internal Server Error' }, 500);
        }
    };

    // PUT /api/coordinators/:id - Update coordinator profile
    updateCoordinator = async (c: Context) => {
        try {
            const id = c.req.param('id');
            if (!id) return c.json({ success: false, error: 'Coordinator ID is required' }, 400);
            const body = await c.req.json();
            const coordinator = await coordinatorsRepository.updateCoordinator(id, body);
            if (!coordinator) {
                return c.json({ success: false, error: 'Coordinator not found' }, 404);
            }
            return c.json({ success: true, message: 'Coordinator updated successfully', data: coordinator });
        } catch (error: any) {
            console.error('Error updating coordinator:', error);
            return c.json({ success: false, error: 'Internal Server Error' }, 500);
        }
    };

    // GET /api/coordinators/:id/dashboard - Get coordinator dashboard stats
    getCoordinatorDashboard = async (c: Context) => {
        try {
            const id = c.req.param('id');
            if (!id) return c.json({ success: false, error: 'Coordinator ID is required' }, 400);
            const stats = await coordinatorsRepository.getCoordinatorDashboardStats(id);
            return c.json({ success: true, data: stats });
        } catch (error: any) {
            console.error('Error fetching coordinator dashboard:', error);
            return c.json({ success: false, error: 'Internal Server Error' }, 500);
        }
    };

    // GET /api/coordinators/profile - Get own profile (from token)
    getProfile = async (c: Context) => {
        try {
            const user = c.get('user') as any;
            if (!user || !user.coordinatorID) {
                return c.json({ success: false, error: 'Coordinator ID not found in token' }, 400);
            }
            const coordinator = await coordinatorsRepository.getCoordinatorById(user.coordinatorID);
            if (!coordinator) {
                return c.json({ success: false, error: 'Coordinator not found' }, 404);
            }
            return c.json({ success: true, data: coordinator });
        } catch (error: any) {
            console.error('Error fetching coordinator profile:', error);
            return c.json({ success: false, error: 'Internal Server Error' }, 500);
        }
    };

    // PUT /api/coordinators/profile - Update own profile (from token)
    updateProfile = async (c: Context) => {
        try {
            const user = c.get('user') as any;
            if (!user || !user.coordinatorID) {
                return c.json({ success: false, error: 'Coordinator ID not found in token' }, 400);
            }
            const body = await c.req.json();
            const coordinator = await coordinatorsRepository.updateCoordinator(user.coordinatorID, body);
            if (!coordinator) {
                return c.json({ success: false, error: 'Coordinator not found' }, 404);
            }
            return c.json({ success: true, message: 'Profile updated successfully', data: coordinator });
        } catch (error: any) {
            console.error('Error updating coordinator profile:', error);
            return c.json({ success: false, error: 'Internal Server Error' }, 500);
        }
    };
}

export const coordinatorsController = new CoordinatorsController();

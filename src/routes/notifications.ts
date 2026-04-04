import { Hono } from 'hono';
import { authenticateToken } from '../middleware/auth';
import { notificationsRepository } from '../repository/notificationsRepository';
import { AuthTokenPayload } from '../models/User';

const router = new Hono();

// Helper to get user info from token
function getUserInfo(user: AuthTokenPayload) {
    const type = user.userType.toLowerCase();
    let userId = user.userID;
    if (type === 'student') userId = user.studentID || user.userID;
    else if (type === 'coordinator') userId = user.coordinatorID || user.userID;
    else if (type === 'partner') userId = user.partnerID || user.userID;
    return { userId, type };
}

// Root endpoint
router.get('/', authenticateToken, async (c) => {
    try {
        const user = c.get('user' as any) as AuthTokenPayload;
        const { userId, type } = getUserInfo(user);
        const filters = c.req.query();
        const notifications = await notificationsRepository.getNotifications(userId, type, filters);
        return c.json({ success: true, count: notifications.length, data: notifications });
    } catch (error: any) {
        console.error('Error fetching notifications:', error);
        return c.json({ success: true, count: 0, data: [] });
    }
});

// GET /api/notifications/unread-count
router.get('/unread-count', authenticateToken, async (c) => {
    try {
        const user = c.get('user' as any) as AuthTokenPayload;
        const { userId, type } = getUserInfo(user);
        const count = await notificationsRepository.getUnreadCount(userId, type);
        return c.json({ success: true, count });
    } catch (error: any) {
        console.error('Error fetching unread count:', error);
        return c.json({ success: true, count: 0 });
    }
});

// POST /api/notifications - Create a notification (for system use)
router.post('/', async (c) => {
    try {
        const body = await c.req.json();
        if (!body.title || !body.message || !body.userId || !body.userType) {
            return c.json({ success: false, message: 'title, message, userId, and userType are required' }, 400);
        }
        const notification = await notificationsRepository.createNotification(body);
        return c.json({ success: true, data: notification }, 201);
    } catch (error: any) {
        console.error('Error creating notification:', error);
        return c.json({ success: false, message: 'Failed to create notification' }, 500);
    }
});

// POST /api/notifications/:id/read - Mark notification as read
router.post('/:id/read', authenticateToken, async (c) => {
    try {
        const id = c.req.param('id');
        if (!id) return c.json({ success: false, message: 'Notification ID is required' }, 400);
        await notificationsRepository.markAsRead(id);
        return c.json({ success: true, message: 'Notification marked as read' });
    } catch (error: any) {
        console.error('Error marking notification as read:', error);
        return c.json({ success: false, message: 'Failed to mark as read' }, 500);
    }
});

// POST /api/notifications/mark-all-read - Mark all notifications as read
router.post('/mark-all-read', authenticateToken, async (c) => {
    try {
        const user = c.get('user' as any) as AuthTokenPayload;
        const { userId, type } = getUserInfo(user);
        await notificationsRepository.markAllAsRead(userId, type);
        return c.json({ success: true, message: 'All notifications marked as read' });
    } catch (error: any) {
        console.error('Error marking all as read:', error);
        return c.json({ success: false, message: 'Failed to mark all as read' }, 500);
    }
});

// DELETE /api/notifications/:id - Delete a notification
router.delete('/:id', authenticateToken, async (c) => {
    try {
        const id = c.req.param('id');
        if (!id) return c.json({ success: false, message: 'Notification ID is required' }, 400);
        await notificationsRepository.deleteNotification(id);
        return c.json({ success: true, message: 'Notification deleted' });
    } catch (error: any) {
        console.error('Error deleting notification:', error);
        return c.json({ success: false, message: 'Failed to delete notification' }, 500);
    }
});

export default router;

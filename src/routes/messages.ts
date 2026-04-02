import { Hono } from 'hono';
import { authenticateToken } from '../middleware/auth';
import { messagesRepository } from '../repository/messagesRepository';
import { AuthTokenPayload } from '../models/User';

const messages = new Hono();

// Root endpoint
messages.get('/', (c) => c.json({
  message: 'Messages API',
  endpoints: ['/conversations', '/thread/:id', '/send', '/unread-count'],
  note: 'Most endpoints require authentication'
}));

// Helper to get the correct profile ID and type from the user token
function getUserProfileInfo(user: AuthTokenPayload) {
    const type = user.userType.toLowerCase();
    let profileId = user.userID; // Default fallback

    if (type === 'student') profileId = user.studentID || user.userID;
    else if (type === 'coordinator') profileId = user.coordinatorID || user.userID;
    else if (type === 'partner') profileId = user.partnerID || user.userID;

    return { profileId, type };
}

// GET /api/messages/conversations
messages.get('/conversations', authenticateToken, async (c) => {
    const user = c.get('user' as any) as AuthTokenPayload;
    const { profileId, type } = getUserProfileInfo(user);
    
    const conversations = await messagesRepository.getConversations(profileId, type);
    return c.json({ success: true, data: conversations });
});

// GET /api/messages/thread/:id (and alias threads/:id)
messages.get('/thread/:id', authenticateToken, async (c) => {
    const user = c.get('user' as any) as AuthTokenPayload;
    const { profileId, type } = getUserProfileInfo(user);
    
    const otherId = c.req.param('id') || '';
    const otherType = c.req.query('type') || 'coordinator'; 
    
    const thread = await messagesRepository.getThread(profileId, type, otherId, otherType);
    return c.json({ success: true, data: thread });
});

// Alias for plural 'threads'
messages.get('/threads/:id', authenticateToken, async (c) => {
    const user = c.get('user' as any) as AuthTokenPayload;
    const { profileId, type } = getUserProfileInfo(user);
    const otherId = c.req.param('id') || '';
    const otherType = c.req.query('type') || 'coordinator';
    const thread = await messagesRepository.getThread(profileId, type, otherId, otherType);
    return c.json({ success: true, data: thread });
});

// POST /api/messages/send
messages.post('/send', authenticateToken, async (c) => {
    const user = c.get('user' as any) as AuthTokenPayload;
    const { profileId, type } = getUserProfileInfo(user);
    
    const body = await c.req.json();
    const { recipientId, recipientType, text } = body;
    
    if (!recipientId || !text) {
        return c.json({ success: false, message: 'Recipient ID and text are required' }, 400);
    }
    
    const targetType = recipientType || (type === 'student' ? 'coordinator' : 'student');
    
    const message = await messagesRepository.sendMessage(profileId, type, recipientId, targetType, text);
    return c.json({ success: true, data: message });
});

// GET /api/messages/unread-count
messages.get('/unread-count', authenticateToken, async (c) => {
    const user = c.get('user' as any) as AuthTokenPayload;
    const { profileId, type } = getUserProfileInfo(user);
    
    const count = await messagesRepository.getUnreadCount(profileId, type);
    return c.json({ success: true, count });
});

// POST /api/messages/mark-read/:id (and alias :id/read)
messages.post('/mark-read/:id', authenticateToken, async (c) => {
    const user = c.get('user' as any) as AuthTokenPayload;
    const { profileId, type } = getUserProfileInfo(user);
    const otherId = c.req.param('id') || '';
    const otherType = c.req.query('type') || 'student';
    await messagesRepository.markAsRead(profileId, type, otherId, otherType);
    return c.json({ success: true });
});

// Alias for :id/read
messages.post('/:id/read', authenticateToken, async (c) => {
    const user = c.get('user' as any) as AuthTokenPayload;
    const { profileId, type } = getUserProfileInfo(user);
    const otherId = c.req.param('id') || '';
    const otherType = c.req.query('type') || 'student';
    await messagesRepository.markAsRead(profileId, type, otherId, otherType);
    return c.json({ success: true });
});

export default messages;

import { Hono } from 'hono';
import { authenticateToken } from '../middleware/auth';
import { messagesRepository } from '../repository/messagesRepository';
import { AuthTokenPayload } from '../models/User';

const messages = new Hono();

// GET /api/messages/conversations
messages.get('/conversations', authenticateToken, async (c) => {
    const user = c.get('user' as any) as AuthTokenPayload;
    const conversations = await messagesRepository.getConversations(user.userID);
    return c.json({ success: true, data: conversations });
});

// GET /api/messages/thread/:id
messages.get('/thread/:id', authenticateToken, async (c) => {
    const user = c.get('user' as any) as AuthTokenPayload;
    const otherId = c.req.param('id') || '';
    const thread = await messagesRepository.getThread(user.userID, otherId);
    return c.json({ success: true, data: thread });
});

// POST /api/messages/send
messages.post('/send', authenticateToken, async (c) => {
    const user = c.get('user' as any) as AuthTokenPayload;
    const body = await c.req.json();
    const { recipientId, text } = body;
    
    if (!recipientId || !text) {
        return c.json({ success: false, message: 'Recipient ID and text are required' }, 400);
    }
    
    const message = await messagesRepository.sendMessage(user.userID, recipientId, text);
    return c.json({ success: true, data: message });
});

// GET /api/messages/unread-count
messages.get('/unread-count', authenticateToken, async (c) => {
    const user = c.get('user' as any) as AuthTokenPayload;
    const count = await messagesRepository.getUnreadCount(user.userID);
    return c.json({ success: true, count });
});

// POST /api/messages/mark-read/:senderId
messages.post('/mark-read/:senderId', authenticateToken, async (c) => {
    const user = c.get('user' as any) as AuthTokenPayload;
    const senderId = c.req.param('senderId') || '';
    await messagesRepository.markAsRead(senderId, user.userID);
    return c.json({ success: true });
});

export default messages;

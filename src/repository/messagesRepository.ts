import databaseService from '../config/database';

export interface Message {
    id: string | number;
    sender: string; // Alias for senderType for frontend compatibility
    senderType: 'student' | 'coordinator' | 'partner' | string;
    senderId: string | number;
    recipientType: 'student' | 'coordinator' | 'partner' | string;
    recipientId: string | number;
    text: string; // Alias for content for frontend compatibility
    content: string;
    time: string; // Formatted time for frontend display
    isRead: boolean;
    attachmentUrl?: string;
    fileName?: string;
    fileType?: string;
    fileSize?: number;
    createdAt: string;
}

export class MessagesRepository {
    async getConversations(userId: string | number, userType: string): Promise<any[]> {
        const query = `
            SELECT DISTINCT 
                CASE 
                    WHEN SenderID = @userId AND SenderType = @userType THEN RecipientID 
                    ELSE SenderID 
                END as otherUserId,
                CASE 
                    WHEN SenderID = @userId AND SenderType = @userType THEN RecipientType 
                    ELSE SenderType 
                END as otherUserType
            FROM Messages
            WHERE (SenderID = @userId AND SenderType = @userType)
               OR (RecipientID = @userId AND RecipientType = @userType)
        `;
        return await databaseService.executeQuery(query, { userId, userType });
    }

    async getThread(
        userId: string | number, 
        userType: string, 
        otherId: string | number, 
        otherType: string
    ): Promise<Message[]> {
        const query = `
            SELECT * FROM Messages 
            WHERE ((SenderID = @userId AND SenderType = @userType) AND (RecipientID = @otherId AND RecipientType = @otherType))
               OR ((SenderID = @otherId AND SenderType = @otherType) AND (RecipientID = @userId AND RecipientType = @userType))
            ORDER BY CreatedAt ASC
        `;
        const data = await databaseService.executeQuery(query, { userId, userType, otherId, otherType });
        return data.map(m => this.mapMessage(m));
    }

    async sendMessage(
        senderId: string | number, 
        senderType: string,
        receiverId: string | number, 
        receiverType: string,
        content: string
    ): Promise<any> {
        const query = `
            INSERT INTO Messages (SenderType, SenderID, RecipientType, RecipientID, Content, IsRead, CreatedAt)
            VALUES (@senderType, @senderId, @receiverType, @receiverId, @content, 0, CURRENT_TIMESTAMP)
            RETURNING *
        `;
        const results = await databaseService.executeQuery(query, { 
            senderType, 
            senderId, 
            receiverType, 
            receiverId, 
            content 
        });
        return this.mapMessage(results[0]);
    }

    async getUnreadCount(userId: string | number, userType: string): Promise<number> {
        const query = `
            SELECT COUNT(*) as count 
            FROM Messages 
            WHERE RecipientID = @userId AND RecipientType = @userType AND IsRead = 0
        `;
        const data = await databaseService.executeQuery(query, { userId, userType });
        return data[0]?.count || 0;
    }

    async markAsRead(userId: string | number, userType: string, otherId: string | number, otherType: string): Promise<void> {
        const query = `
            UPDATE Messages 
            SET IsRead = 1 
            WHERE RecipientID = @userId AND RecipientType = @userType 
              AND SenderID = @otherId AND SenderType = @otherType
              AND IsRead = 0
        `;
        await databaseService.executeQuery(query, { userId, userType, otherId, otherType });
    }

    private mapMessage(m: any): Message {
        if (!m) return null as any;
        
        let formattedTime = 'Recent';
        try {
            if (m.CreatedAt) {
                const date = new Date(m.CreatedAt);
                formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
        } catch (e) {
            // Fallback
        }

        return {
            id: m.MessageID,
            sender: m.SenderType || 'User', // Compatibility
            senderType: m.SenderType,
            senderId: m.SenderID,
            recipientType: m.RecipientType,
            recipientId: m.RecipientID,
            text: m.Content || '', // Compatibility
            content: m.Content || '',
            time: formattedTime, // Compatibility
            isRead: m.IsRead === 1,
            attachmentUrl: m.AttachmentURL,
            fileName: m.FileName,
            fileType: m.FileType,
            fileSize: m.FileSize,
            createdAt: m.CreatedAt
        };
    }
}

export const messagesRepository = new MessagesRepository();

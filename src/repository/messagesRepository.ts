import databaseService from '../config/database';

export interface Message {
    id: string | number;
    sender: string;
    text: string;
    time: string;
    studentId?: string | number;
    partnerId?: string | number;
    coordinatorId?: string | number;
    isRead: boolean;
    attachmentUrl?: string;
    fileName?: string;
    fileType?: string;
    fileSize?: number;
    createdAt: string;
}

export class MessagesRepository {
    async getConversations(userId: string | number): Promise<any[]> {
        // Simple query for D1
        const query = `
            SELECT DISTINCT 
                CASE WHEN Sender = 'student' THEN StudentID ELSE CoordinatorID END as id,
                'User' as name, 
                NULL as image, 
                'student' as type
            FROM Messages
            WHERE StudentID = @userId OR CoordinatorID = @userId
        `;
        return await databaseService.executeQuery(query, { userId });
    }

    async getMessagesBetweenUsers(userId: string | number, otherId: string | number): Promise<Message[]> {
        const query = `
            SELECT * FROM Messages 
            WHERE (StudentID = @userId AND (CoordinatorID = @otherId OR PartnerID = @otherId))
               OR ((StudentID = @otherId) AND (CoordinatorID = @userId OR PartnerID = @userId))
            ORDER BY CreatedAt ASC
        `;
        const data = await databaseService.executeQuery(query, { userId, otherId });
        return data.map(m => this.mapMessage(m));
    }

    async getThread(userId: string | number, otherId: string | number): Promise<Message[]> {
        return this.getMessagesBetweenUsers(userId, otherId);
    }

    async sendMessage(senderId: string | number, receiverId: string | number, text: string): Promise<any> {
        const query = `
            INSERT INTO Messages (Sender, MessageText, MessageTime, IsRead, StudentID, CoordinatorID, CreatedAt)
            VALUES ('User', @text, @time, 0, @senderId, @receiverId, CURRENT_TIMESTAMP)
        `;
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        await databaseService.executeQuery(query, { text, time, senderId, receiverId });
        return { success: true };
    }

    async getUnreadCount(userId: string | number): Promise<number> {
        const query = `SELECT COUNT(*) as count FROM Messages WHERE (StudentID = @userId OR CoordinatorID = @userId) AND IsRead = 0`;
        const data = await databaseService.executeQuery(query, { userId });
        return data[0]?.count || 0;
    }

    async markAsRead(senderId: string | number, receiverId: string | number): Promise<void> {
        const query = `UPDATE Messages SET IsRead = 1 WHERE Sender = @senderId AND (StudentID = @receiverId OR CoordinatorID = @receiverId)`;
        await databaseService.executeQuery(query, { senderId, receiverId });
    }

    private mapMessage(m: any): Message {
        return {
            id: m.MessageID,
            sender: m.Sender,
            text: m.MessageText,
            time: m.MessageTime,
            studentId: m.StudentID,
            partnerId: m.PartnerID,
            coordinatorId: m.CoordinatorID,
            isRead: !!m.IsRead,
            attachmentUrl: m.AttachmentURL,
            fileName: m.FileName,
            fileType: m.FileType,
            fileSize: m.FileSize,
            createdAt: m.CreatedAt
        };
    }
}

export const messagesRepository = new MessagesRepository();

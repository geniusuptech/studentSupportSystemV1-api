import databaseService from '../config/database';

export interface Notification {
    id: number;
    userType: string;
    userId: number;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    isRead: boolean;
    link?: string;
    createdAt: string;
}

export class NotificationsRepository {
    async getNotifications(userId: string | number, userType: string, filters: any = {}): Promise<Notification[]> {
        let query = `
            SELECT * FROM Notifications 
            WHERE UserID = @userId AND UserType = @userType
        `;
        const params: any = { userId, userType };

        if (filters.unreadOnly === 'true') {
            query += ` AND IsRead = 0`;
        }
        if (filters.type) {
            query += ` AND Type = @type`;
            params.type = filters.type;
        }

        query += ` ORDER BY CreatedAt DESC`;

        if (filters.limit) {
            query += ` LIMIT ${parseInt(filters.limit)}`;
        } else {
            query += ` LIMIT 50`;
        }

        const data = await databaseService.executeQuery(query, params);
        return data.map(n => this.mapNotification(n));
    }

    async getUnreadCount(userId: string | number, userType: string): Promise<number> {
        const query = `
            SELECT COUNT(*) as count FROM Notifications 
            WHERE UserID = @userId AND UserType = @userType AND IsRead = 0
        `;
        const data = await databaseService.executeQuery(query, { userId, userType });
        return data[0]?.count || 0;
    }

    async createNotification(data: {
        userType: string;
        userId: number | string;
        title: string;
        message: string;
        type?: string;
        link?: string;
    }): Promise<Notification> {
        const query = `
            INSERT INTO Notifications (UserType, UserID, Title, Message, Type, IsRead, Link, CreatedAt)
            VALUES (@userType, @userId, @title, @message, @type, 0, @link, CURRENT_TIMESTAMP)
            RETURNING *
        `;
        const params = {
            userType: data.userType,
            userId: data.userId,
            title: data.title,
            message: data.message,
            type: data.type || 'info',
            link: data.link || null
        };
        const result = await databaseService.executeQuery(query, params);
        return this.mapNotification(result[0]);
    }

    async markAsRead(notificationId: string | number): Promise<void> {
        const query = `UPDATE Notifications SET IsRead = 1 WHERE NotificationID = @id`;
        await databaseService.executeQuery(query, { id: notificationId });
    }

    async markAllAsRead(userId: string | number, userType: string): Promise<void> {
        const query = `UPDATE Notifications SET IsRead = 1 WHERE UserID = @userId AND UserType = @userType AND IsRead = 0`;
        await databaseService.executeQuery(query, { userId, userType });
    }

    async deleteNotification(notificationId: string | number): Promise<void> {
        const query = `DELETE FROM Notifications WHERE NotificationID = @id`;
        await databaseService.executeQuery(query, { id: notificationId });
    }

    private mapNotification(n: any): Notification {
        return {
            id: n.NotificationID,
            userType: n.UserType,
            userId: n.UserID,
            title: n.Title,
            message: n.Message,
            type: n.Type,
            isRead: n.IsRead === 1,
            link: n.Link,
            createdAt: n.CreatedAt
        };
    }
}

export const notificationsRepository = new NotificationsRepository();

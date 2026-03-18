import { Context } from 'hono';

export interface CloudflareEnv {
    DB: any; // D1 Database
}

export class DatabaseService {
    private db: any = null;

    setDB(db: any) {
        this.db = db;
    }

    isConfigured(): boolean {
        return !!this.db;
    }

    async query(sqlString: string, params: Record<string, any> = {}): Promise<any> {
        if (!this.db) throw new Error('D1 Database not bound.');
        
        let finalSql = sqlString;
        const bindValues: any[] = [];
        
        // Find all @named parameters and replace them with ? while collecting values
        const matches = [...sqlString.matchAll(/@(\w+)/g)];
        if (matches.length > 0) {
            // Sort matches by index to replace from left to right
            for (const match of matches) {
                const paramName = match[1];
                const paramValue = params[paramName];
                bindValues.push(paramValue);
            }
            finalSql = sqlString.replace(/@\w+/g, '?');
        }

        try {
            const stmt = this.db.prepare(finalSql);
            const result = await (bindValues.length > 0 ? stmt.bind(...bindValues).all() : stmt.all());
            return { recordset: result.results || [] };
        } catch (error: any) {
            console.error('D1 Query Error:', error.message, 'SQL:', finalSql);
            throw error;
        }
    }

    async executeQuery(queryString: string, params?: Record<string, any>): Promise<any[]> {
        const result = await this.query(queryString, params || {});
        return result.recordset;
    }
}

const databaseService = new DatabaseService();
export default databaseService;

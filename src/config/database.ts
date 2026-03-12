import { AsyncLocalStorage } from 'node:async_hooks';

// Singleton for AsyncLocalStorage to hold the D1Database instance per request
export const dbContext = new AsyncLocalStorage<D1Database>();

class DatabaseService {
  private static instance: DatabaseService;

  private constructor() { }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // Compatibility methods
  public async connect(): Promise<void> { return Promise.resolve(); }
  public async testConnection(): Promise<boolean> { return true; }
  public isConnected(): boolean { return true; }
  public async disconnect(): Promise<void> { return Promise.resolve(); }

  public async executeQuery<T = any>(query: string, params?: Record<string, any>): Promise<T[]> {
    const db = dbContext.getStore();
    if (!db) {
      throw new Error('Database context not found. Ensure D1 middleware is running.');
    }

    // Basic MS SQL to SQLite translation
    let processedQuery = query
      .replace(/GETDATE\(\)/gi, 'CURRENT_TIMESTAMP')
      .replace(/\bISNULL\b/gi, 'IFNULL')
      .replace(/\bSCOPE_IDENTITY\(\)/gi, 'last_insert_rowid()');

    // Handle SELECT TOP N -> SELECT ... LIMIT N
    const topRegex = /SELECT\s+TOP\s+(\d+)\s+/i;
    const topMatch = processedQuery.match(topRegex);
    if (topMatch) {
      const topCount = topMatch[1];
      processedQuery = processedQuery.replace(topRegex, 'SELECT ');
      processedQuery += ` LIMIT ${topCount}`;
    }

    const bindParams: any[] = [];
    if (params) {
      const sortedKeys = Object.keys(params).sort((a, b) => b.length - a.length);
      for (const key of sortedKeys) {
        const regex = new RegExp(`@${key}\\b`, 'g');
        if (regex.test(processedQuery)) {
          processedQuery = processedQuery.replace(regex, '?');
          bindParams.push(params[key]);
        }
      }
    }

    try {
      const statements = processedQuery.split(';').map(s => s.trim()).filter(s => s.length > 0);

      if (statements.length > 1) {
        let lastResults: any[] = [];
        for (const stmtText of statements) {
          const stmt = db.prepare(stmtText).bind(...bindParams);
          // If statement doesn't have ? but bindParams has items, D1 might complain. 
          // We'll trust D1's bind to ignore extra params or we'll filter.
          const res = await stmt.all<any>();
          if (res.results) lastResults = res.results;
        }
        return lastResults as T[];
      }

      const stmt = db.prepare(processedQuery).bind(...bindParams);
      const { results } = await stmt.all<T>();
      return results || [];
    } catch (err) {
      console.error('D1 Query execution failed:', err);
      console.error('Processed Query:', processedQuery);
      throw err;
    }
  }

  public async executeStoredProcedure<T = any>(procedureName: string, params?: Record<string, any>): Promise<T[]> {
    throw new Error(`Stored Procedure '${procedureName}' not supported on Cloudflare D1.`);
  }
}

export const databaseService = DatabaseService.getInstance();
export default databaseService;

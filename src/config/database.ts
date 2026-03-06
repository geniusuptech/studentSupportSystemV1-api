import * as msnodesqlv8 from 'msnodesqlv8';
import dotenv from 'dotenv';

dotenv.config();

const server = process.env.DB_SERVER || 'localhost\\SQLEXPRESS';
const database = process.env.DB_NAME || 'StudentWellness';

export const connectionString = `Driver={ODBC Driver 17 for SQL Server};Server=${server};Database=${database};Trusted_Connection=Yes;`;

// Types for msnodesqlv8
interface QueryResult<T> {
  recordset: T[];
}

class DatabaseService {
  private static instance: DatabaseService;
  private connection: MsNodeSqlV8.Connection | null = null;
  private connected: boolean = false;

  private constructor() {}

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.connected && this.connection) {
        console.log('Database already connected');
        resolve();
        return;
      }

      console.log('Connecting to database...');
      console.log('Connection string:', connectionString);
      
      msnodesqlv8.open(connectionString, (err: MsNodeSqlV8.Error | null, conn: MsNodeSqlV8.Connection) => {
        if (err) {
          console.error('Database connection failed:', err);
          this.connected = false;
          reject(err);
        } else {
          this.connection = conn;
          this.connected = true;
          console.log('Successfully connected to SQL Server database');
          
          // Test the connection
          this.testConnection()
            .then(() => resolve())
            .catch(reject);
        }
      });
    });
  }

  public async testConnection(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.connection) {
        reject(new Error('Database not connected'));
        return;
      }

      this.connection.query('SELECT 1 as test', (err, results) => {
        if (err) {
          console.error('Database test failed:', err);
          resolve(false);
        } else {
          console.log('Database test successful:', results ? results[0] : null);
          resolve(true);
        }
      });
    });
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public async disconnect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.connection) {
        this.connection.close((err) => {
          if (err) {
            console.error('Error closing database connection:', err);
            reject(err);
          } else {
            this.connection = null;
            this.connected = false;
            console.log('Database connection closed');
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  // Helper method to execute queries
  public async executeQuery<T = any>(query: string, params?: Record<string, any>): Promise<T[]> {
    return new Promise((resolve, reject) => {
      if (!this.connection) {
        reject(new Error('Database not connected. Call connect() first.'));
        return;
      }

      // Replace @param placeholders with actual values
      let processedQuery = query;
      if (params) {
        Object.keys(params).forEach(key => {
          const value = params[key];
          let sqlValue: string;
          
          if (value === null || value === undefined) {
            sqlValue = 'NULL';
          } else if (typeof value === 'string') {
            sqlValue = `'${value.replace(/'/g, "''")}'`;
          } else if (typeof value === 'number') {
            sqlValue = String(value);
          } else if (value instanceof Date) {
            sqlValue = `'${value.toISOString()}'`;
          } else {
            sqlValue = `'${String(value).replace(/'/g, "''")}'`;
          }
          
          processedQuery = processedQuery.replace(new RegExp(`@${key}\\b`, 'g'), sqlValue);
        });
      }

      this.connection.query(processedQuery, (err, results) => {
        if (err) {
          console.error('Query execution failed:', err);
          reject(err);
        } else {
          resolve((results || []) as T[]);
        }
      });
    });
  }

  // Helper method to execute stored procedures
  public async executeStoredProcedure<T = any>(procedureName: string, params?: Record<string, any>): Promise<T[]> {
    // Build EXEC statement
    let query = `EXEC ${procedureName}`;
    if (params) {
      const paramList = Object.entries(params).map(([key, value]) => {
        if (value === null || value === undefined) return `@${key} = NULL`;
        if (typeof value === 'string') return `@${key} = '${value.replace(/'/g, "''")}'`;
        if (typeof value === 'number') return `@${key} = ${value}`;
        return `@${key} = '${String(value).replace(/'/g, "''")}'`;
      });
      query += ' ' + paramList.join(', ');
    }

    return await this.executeQuery<T>(query);
  }
}

export const databaseService = DatabaseService.getInstance();
export default databaseService;

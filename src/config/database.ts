import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const config: sql.config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'StudentWellness',
  server: process.env.DB_SERVER || 'localhost',
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true' || process.env.NODE_ENV === 'production', // Use encryption in production or if explicitly requested
    trustServerCertificate: process.env.DB_TRUST_CERT !== 'false' && process.env.NODE_ENV !== 'production' // Trust cert in dev unless explicitly told not to
  }
};

export const connectionString = `Server=${config.server};Database=${config.database};User=${config.user};`;

class DatabaseService {
  private static instance: DatabaseService;
  private pool: sql.ConnectionPool | null = null;
  private connected: boolean = false;

  private constructor() { }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public async connect(): Promise<void> {
    if (this.connected && this.pool) {
      console.log('Database already connected');
      return;
    }

    try {
      console.log('Connecting to database via standard SQL login...');
      console.log('Server:', config.server);
      console.log('Database:', config.database);

      this.pool = await sql.connect(config);
      this.connected = true;
      console.log('Successfully connected to SQL Server database');

      // Test the connection
      await this.testConnection();
    } catch (err) {
      console.error('Database connection failed:', err);
      this.connected = false;
      throw err;
    }
  }

  public async testConnection(): Promise<boolean> {
    if (!this.pool || !this.connected) {
      throw new Error('Database not connected');
    }

    try {
      const result = await this.pool.request().query('SELECT 1 as test');
      console.log('Database test successful:', result.recordset[0]);
      return true;
    } catch (err) {
      console.error('Database test failed:', err);
      return false;
    }
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public async disconnect(): Promise<void> {
    if (this.pool) {
      try {
        await this.pool.close();
        this.pool = null;
        this.connected = false;
        console.log('Database connection closed');
      } catch (err) {
        console.error('Error closing database connection:', err);
        throw err;
      }
    }
  }

  // Helper method to execute queries
  public async executeQuery<T = any>(query: string, params?: Record<string, any>): Promise<T[]> {
    if (!this.pool || !this.connected) {
      throw new Error('Database not connected. Call connect() first.');
    }

    try {
      const request = this.pool.request();
      if (params) {
        Object.keys(params).forEach(key => {
          request.input(key, params[key]);
        });
      }
      const result = await request.query(query);
      return (result.recordset || []) as T[];
    } catch (err) {
      console.error('Query execution failed:', err);
      throw err;
    }
  }

  // Helper method to execute stored procedures
  public async executeStoredProcedure<T = any>(procedureName: string, params?: Record<string, any>): Promise<T[]> {
    if (!this.pool || !this.connected) {
      throw new Error('Database not connected. Call connect() first.');
    }

    try {
      const request = this.pool.request();
      if (params) {
        Object.keys(params).forEach(key => {
          request.input(key, params[key]);
        });
      }
      const result = await request.execute(procedureName);
      return (result.recordset || []) as T[];
    } catch (err) {
      console.error('Stored procedure execution failed:', err);
      throw err;
    }
  }
}

export const databaseService = DatabaseService.getInstance();
export default databaseService;

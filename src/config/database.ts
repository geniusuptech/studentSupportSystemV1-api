import dotenv from 'dotenv';

dotenv.config();

const server = process.env.DB_SERVER || 'localhost\\SQLEXPRESS';
const database = process.env.DB_NAME || 'StudentWellness';
const useWindowsAuth = !process.env.DB_USER || !process.env.DB_PASSWORD;

// Check if msnodesqlv8 is available (for Windows integrated auth)
let msnodesqlv8Available = false;
try {
  require.resolve('msnodesqlv8');
  msnodesqlv8Available = true;
} catch {
  msnodesqlv8Available = false;
}

// Dynamically import the correct mssql module
const sql = useWindowsAuth && msnodesqlv8Available
  ? require('mssql/msnodesqlv8')
  : require('mssql');

// Build connection config based on available drivers and auth method
function buildConfig(): any {
  // For Windows Auth with msnodesqlv8
  if (useWindowsAuth && msnodesqlv8Available) {
    return {
      connectionString: `Driver={ODBC Driver 17 for SQL Server};Server=${server};Database=${database};Trusted_Connection=Yes;`,
      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
      },
    };
  }

  // For SQL Auth (cross-platform)
  if (!useWindowsAuth) {
    return {
      server,
      database,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT || '1433'),
      options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: process.env.DB_TRUST_CERT !== 'false',
        enableArithAbort: true,
      },
      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
      },
    };
  }

  // Fallback: SQL Auth required but not provided
  throw new Error(
    'No database credentials provided and msnodesqlv8 driver not available.\n' +
    'Options:\n' +
    '  1. Set DB_USER and DB_PASSWORD environment variables for SQL Auth\n' +
    '  2. Install msnodesqlv8 for Windows integrated auth: npm install msnodesqlv8'
  );
}

// Export connection string for logging (without password)
export const connectionString = `Server=${server};Database=${database};${useWindowsAuth ? 'Windows Auth' : 'SQL Auth'}`;

class DatabaseService {
  private static instance: DatabaseService;
  private pool: any = null;
  private connected: boolean = false;
  private reconnectPromise: Promise<void> | null = null;

  private constructor() {}

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

    console.log('Connecting to database...');
    console.log('Connection info:', connectionString);

    try {
      const config = buildConfig();
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
    if (!this.pool) {
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

  private bindRequestParams(request: any, params?: Record<string, any>): void {
    if (!params) {
      return;
    }

    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        request.input(key, sql.NVarChar, null);
      } else if (typeof value === 'string') {
        request.input(key, sql.NVarChar, value);
      } else if (typeof value === 'number') {
        if (Number.isInteger(value)) {
          request.input(key, sql.Int, value);
        } else {
          request.input(key, sql.Float, value);
        }
      } else if (value instanceof Date) {
        request.input(key, sql.DateTime, value);
      } else if (typeof value === 'boolean') {
        request.input(key, sql.Bit, value);
      } else {
        request.input(key, sql.NVarChar, String(value));
      }
    });
  }

  private isTransientConnectionError(err: any): boolean {
    const code = String(err?.code || '').toUpperCase();
    const message = String(err?.message || '').toLowerCase();

    return (
      code === 'ECONNCLOSED' ||
      code === 'ETIMEOUT' ||
      code === 'ESOCKET' ||
      code === 'ENOTOPEN' ||
      message.includes('connectionerror') ||
      message.includes('connection is closed') ||
      message.includes('failed to connect')
    );
  }

  private async reconnect(): Promise<void> {
    if (this.reconnectPromise) {
      await this.reconnectPromise;
      return;
    }

    this.reconnectPromise = (async () => {
      try {
        if (this.pool) {
          await this.pool.close();
        }
      } catch (closeError) {
        console.warn('Error while closing stale DB connection:', closeError);
      } finally {
        this.pool = null;
        this.connected = false;
      }

      await this.connect();
    })();

    try {
      await this.reconnectPromise;
    } finally {
      this.reconnectPromise = null;
    }
  }

  // Helper method to execute queries
  public async executeQuery<T = any>(query: string, params?: Record<string, any>): Promise<T[]> {
    if (!this.pool || !this.connected) {
      await this.connect();
    }

    try {
      const request = this.pool.request();
      this.bindRequestParams(request, params);

      const result = await request.query(query);
      return result.recordset as T[];
    } catch (err) {
      console.error('Query execution failed:', err);

      if (this.isTransientConnectionError(err)) {
        console.warn('Transient DB error detected. Reconnecting and retrying query once...');
        await this.reconnect();

        const retryRequest = this.pool.request();
        this.bindRequestParams(retryRequest, params);
        const retryResult = await retryRequest.query(query);
        return retryResult.recordset as T[];
      }

      throw err;
    }
  }

  // Helper method to execute stored procedures
  public async executeStoredProcedure<T = any>(procedureName: string, params?: Record<string, any>): Promise<T[]> {
    if (!this.pool || !this.connected) {
      await this.connect();
    }

    try {
      const request = this.pool.request();
      this.bindRequestParams(request, params);

      const result = await request.execute(procedureName);
      return result.recordset as T[];
    } catch (err) {
      console.error('Stored procedure execution failed:', err);

      if (this.isTransientConnectionError(err)) {
        console.warn('Transient DB error detected. Reconnecting and retrying stored procedure once...');
        await this.reconnect();

        const retryRequest = this.pool.request();
        this.bindRequestParams(retryRequest, params);
        const retryResult = await retryRequest.execute(procedureName);
        return retryResult.recordset as T[];
      }

      throw err;
    }
  }
}

export const databaseService = DatabaseService.getInstance();
export default databaseService;

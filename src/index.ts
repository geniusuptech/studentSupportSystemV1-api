import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import databaseService from './config/database';
import { setupSwagger } from './config/swagger';
import studentsRoutes from './routes/students';
import studentAuthRoutes from './routes/studentAuth';
import supportRequestsRoutes from './routes/support-requests';
import partnersRoutes from './routes/partners';
import authRoutes from './routes/auth';
import dashboardRoutes from './routes/dashboard';
import universitiesRoutes from './routes/universities';
import programsRoutes from './routes/programs';
import riskLevelsRoutes from './routes/riskLevels';
import interventionsRoutes from './routes/interventions';
import reportsRoutes from './routes/reports';

// Load environment variables
dotenv.config();

// Custom error interface
interface CustomError extends Error {
  status?: number;
  statusCode?: number;
}

class StudentWellnessServer {
  private app: Express;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3001', 10);
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" }
    }));

    // CORS configuration
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));

    // Compression
    this.app.use(compression());

    // Logging
    this.app.use(morgan('combined'));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use(limiter);

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging middleware
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });

    // Setup Swagger documentation
    setupSwagger(this.app);
  }

  private initializeRoutes(): void {
    /**
     * @swagger
     * /health:
     *   get:
     *     summary: API health check
     *     description: Check the health and status of the API server
     *     tags: [Health]
     *     responses:
     *       200:
     *         description: API is healthy and running
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: ok
     *                 timestamp:
     *                   type: string
     *                   format: date-time
     *                   example: 2026-03-01T10:30:00.000Z
     *                 uptime:
     *                   type: number
     *                   description: Server uptime in seconds
     *                   example: 3600
     *                 environment:
     *                   type: string
     *                   example: development
     *                 version:
     *                   type: string
     *                   example: 1.0.0
     */
    // Health check endpoint
    this.app.get('/api/health', (req: Request, res: Response) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0'
      });
    });

    /**
     * @swagger
     * /test-db:
     *   get:
     *     summary: Database connection test
     *     description: Test the connection to the SQL Server database
     *     tags: [Health]
     *     responses:
     *       200:
     *         description: Database connection test successful
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 database:
     *                   type: string
     *                   enum: [connected, disconnected]
     *                   example: connected
     *                 timestamp:
     *                   type: string
     *                   format: date-time
     *       500:
     *         description: Database connection failed
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 error:
     *                   type: string
     *                   example: Database connection test failed
     *                 details:
     *                   type: string
     *                   example: Login failed for user 'sa'
     */
    // Database connection test endpoint
    this.app.get('/api/test-db', async (req: Request, res: Response) => {
      try {
        const isConnected = await databaseService.testConnection();
        res.json({
          database: isConnected ? 'connected' : 'disconnected',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Database test error:', error);
        res.status(500).json({
          error: 'Database connection test failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/students/auth', studentAuthRoutes);
    this.app.use('/api/students', studentsRoutes);
    this.app.use('/api/support-requests', supportRequestsRoutes);
    this.app.use('/api/partners', partnersRoutes);
    this.app.use('/api/dashboard', dashboardRoutes);
    this.app.use('/api/universities', universitiesRoutes);
    this.app.use('/api/programs', programsRoutes);
    this.app.use('/api/risk-levels', riskLevelsRoutes);
    this.app.use('/api/interventions', interventionsRoutes);
    this.app.use('/api/reports', reportsRoutes);

    // Root endpoint
    this.app.get('/', (req: Request, res: Response) => {
      res.json({
        message: 'Student Wellness Dashboard API',
        version: '1.0.0',
        documentation: '/api/health',
        endpoints: {
          health: '/api/health',
          databaseTest: '/api/test-db',
          authentication: '/api/auth',
          students: '/api/students',
          supportRequests: '/api/support-requests',
          partners: '/api/partners',
          dashboard: '/api/dashboard',
          universities: '/api/universities',
          programs: '/api/programs',
          riskLevels: '/api/risk-levels',
          interventions: '/api/interventions',
          reports: '/api/reports'
        }
      });
    });

    // 404 handler
    this.app.use('*', (req: Request, res: Response) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`,
        availableRoutes: [
          '/api/health',
          '/api/test-db',
          '/api/students',
          '/api/support-requests',
          '/api/partners',
          '/api/dashboard',
          '/api/universities',
          '/api/programs',
          '/api/risk-levels',
          '/api/interventions',
          '/api/reports'
        ]
      });
    });
  }

  private initializeErrorHandling(): void {
    // Global error handler
    this.app.use((error: CustomError, req: Request, res: Response, next: NextFunction) => {
      console.error('Global error handler:', error);

      const status = error.status || error.statusCode || 500;
      const message = error.message || 'Internal Server Error';

      res.status(status).json({
        error: {
          message,
          status,
          timestamp: new Date().toISOString(),
          path: req.path,
          method: req.method
        },
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      });
    });

    // Graceful shutdown handling
    process.on('SIGTERM', this.gracefulShutdown.bind(this));
    process.on('SIGINT', this.gracefulShutdown.bind(this));

    // Unhandled promise rejection handler
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    // Uncaught exception handler
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      this.gracefulShutdown('uncaught exception');
    });
  }

  private async gracefulShutdown(signal?: string): Promise<void> {
    console.log(`Received ${signal || 'shutdown signal'}, shutting down gracefully...`);

    try {
      // Close database connection
      await databaseService.disconnect();
      console.log('Database connection closed');

      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  }

  public async start(): Promise<void> {
    try {
      // Attempt to connect to database (optional for development)
      try {
        await databaseService.connect();
        console.log('✅ Database connection successful');
      } catch (dbError) {
        console.warn('⚠️  Database connection failed:', (dbError as Error).message);
        console.log('🔄 Server will start without database connection');
        console.log('💡 You can test database connectivity at /api/test-db');
      }

      // Start server regardless of database connection status
      this.app.listen(this.port, () => {
        console.log(`
🚀 Student Wellness Dashboard API Server Started
📊 Environment: ${process.env.NODE_ENV || 'development'}
🌐 Server running on port ${this.port}
🔗 Health check: http://localhost:${this.port}/api/health
🗃️  Database test: http://localhost:${this.port}/api/test-db
📖 API Documentation: http://localhost:${this.port}/api-docs
📚 API Endpoints:
   • Students: http://localhost:${this.port}/api/students
   • Support Requests: http://localhost:${this.port}/api/support-requests  
   • Partners: http://localhost:${this.port}/api/partners
        `);
      });

    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  public getApp(): Express {
    return this.app;
  }
}

// Create and start server instance
const server = new StudentWellnessServer();

// Start the server if this file is run directly
if (require.main === module) {
  server.start().catch((error) => {
    console.error('Server startup failed:', error);
    process.exit(1);
  });
}

export default server;
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

// Import route definitions
import studentsRoutes from './routes/students';
import studentAuthRoutes from './routes/studentAuth';
import supportRequestsRoutes from './routes/support-requests';
import partnersRoutes from './routes/partners';
import { authService } from './services/authServices';
import authRoutes from './routes/auth';
import dashboardRoutes from './routes/dashboard';
import universitiesRoutes from './routes/universities';
import programsRoutes from './routes/programs';
import riskLevelsRoutes from './routes/riskLevels';
import interventionsRoutes from './routes/interventions';
import reportsRoutes from './routes/reports';
import messagesRoutes from './routes/messages';
import logsRoutes from './routes/logs';

// Import services and config
import { swaggerSpec } from './config/swagger';
import databaseService from './config/database';

// Types for Environment Bindings
type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Middlewares
app.use('*', logger());
app.use('*', cors({
  origin: '*', 
  credentials: true,
}));

// Initialize Database config from Worker Env
app.use('*', async (c, next) => {
  databaseService.setDB(c.env.DB);
  authService.setSecret(c.env.JWT_SECRET || 'your-secret-key-change-in-production');
  await next();
});

// Health check
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: 'production',
    platform: 'Cloudflare Workers (Hono)',
    version: '1.2.0',
    dbConfigured: databaseService.isConfigured()
  });
});

// Database connection test (D1 verify)
app.get('/api/test-db', async (c) => {
  try {
    if (!c.env.DB) throw new Error('DB binding not found');
    const result = await c.env.DB.prepare('SELECT 1').all();
    return c.json({
      success: true,
      message: 'Cloudflare D1 Database is connected!',
      result: result.results
    });
  } catch (err: any) {
    return c.json({
      success: false,
      message: 'Database connection failed',
      error: err.message
    }, 500);
  }
});

// Home endpoint
app.get('/', (c) => {
  return c.json({
    message: 'Student Wellness Dashboard API is LIVE (Cloudflare D1)',
    version: '1.2.0',
    documentation: '/api-docs',
    health: '/api/health',
    test_db: '/api/test-db',
    status: 'Ready'
  });
});

/**
 * Swagger Documentation UI
 */
app.get('/api-docs', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Student Wellness API Documentation</title>
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
      <style>
        html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
        *, *:before, *:after { box-sizing: inherit; }
        body { margin: 0; background: #fafafa; }
      </style>
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
      <script>
        window.onload = () => {
          window.ui = SwaggerUIBundle({
            url: '/api-docs.json',
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [SwaggerUIBundle.presets.apis],
          });
        };
      </script>
    </body>
    </html>
  `);
});

// Swagger JSON Spec
app.get('/api-docs.json', (c) => {
  return c.json(swaggerSpec);
});

// Register API Routes - Standard /api prefix
app.route('/api/students/auth', studentAuthRoutes);
app.route('/api/students', studentsRoutes);
app.route('/api/auth', authRoutes);
app.route('/api/support-requests', supportRequestsRoutes);
app.route('/api/partners', partnersRoutes);
app.route('/api/dashboard', dashboardRoutes);
app.route('/api/universities', universitiesRoutes);
app.route('/api/programs', programsRoutes);
app.route('/api/risk-levels', riskLevelsRoutes);
app.route('/api/interventions', interventionsRoutes);
app.route('/api/reports', reportsRoutes);
app.route('/api/messages', messagesRoutes);
app.route('/api/logs', logsRoutes);

// Register API Routes - Root level aliases for Frontend Compatibility
app.route('/students/auth', studentAuthRoutes); // Direct match for students/auth/login
app.route('/students', studentsRoutes);
app.route('/auth', authRoutes);
app.route('/support-requests', supportRequestsRoutes);
app.route('/partners', partnersRoutes);
app.route('/dashboard', dashboardRoutes);
app.route('/universities', universitiesRoutes);
app.route('/programs', programsRoutes);
app.route('/risk-levels', riskLevelsRoutes);
app.route('/interventions', interventionsRoutes);
app.route('/reports', reportsRoutes);
app.route('/messages', messagesRoutes);
app.route('/logs', logsRoutes);

// Global Error Handler
app.onError((err, c) => {
  console.error(`[API Error] ${err.message}`);
  return c.json({
    success: false,
    error: 'Internal Server Error',
    message: err.message
  }, 500) as any;
});

// 404 Not Found Handler
app.notFound((c) => {
  return c.json({
    success: false,
    error: 'Not Found',
    message: `Path ${c.req.path} not found`
  }, 404);
});

export default app;
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

// Import route definitions
import studentsRoutes from './routes/students';
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
import coordinatorsRoutes from './routes/coordinators';
import notificationsRoutes from './routes/notifications';
import studentPortalRoutes from './routes/student-portal';
import studentAuthRoutes from './routes/studentAuth';

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
  origin: (origin) => origin || '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  credentials: true,
}));

// Initialize Database and Auth config from Worker Env
app.use('*', async (c, next) => {
  databaseService.setDB(c.env.DB);
  
  // Only set JWT secret if it exists (for non-health endpoints)
  if (c.env.JWT_SECRET) {
    authService.setSecret(c.env.JWT_SECRET);
  }
  
  await next();
});

// Health check - should work without authentication
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: 'production',
    platform: 'Cloudflare Workers (Hono)',
    version: '1.2.0',
    dbConfigured: databaseService.isConfigured(),
    jwtConfigured: !!c.env.JWT_SECRET,
    jwtSecretLength: c.env.JWT_SECRET ? c.env.JWT_SECRET.length : 0,
    jwtSecretFirstChars: c.env.JWT_SECRET ? c.env.JWT_SECRET.substring(0, 30) + '...' : 'NOT SET'
  });
});



// Home endpoint
app.get('/', (c) => {
  return c.json({
    message: 'Student Wellness Dashboard API is LIVE (Cloudflare D1)',
    version: '1.2.0',
    documentation: '/api-docs',
    health: '/api/health',
    diagnostics: '/api/diagnostics',
    status: 'Ready'
  });
});

// Diagnostic endpoint - helps debug JWT and token issues
app.get('/api/diagnostics', (c) => {
  const authHeader = c.req.header('authorization');
  const tokenFromHeader = authHeader ? authHeader.split(' ')[1] : null;
  const jwtSecret = c.env.JWT_SECRET;
  
  return c.json({
    jwt_configured: !!jwtSecret,
    jwt_secret_length: jwtSecret ? jwtSecret.length : 0,
    jwt_secret_start: jwtSecret ? jwtSecret.substring(0, 40) + '...' : 'NOT SET',
    authorization_header_present: !!authHeader,
    token_in_header: !!tokenFromHeader,
    token_format_valid: authHeader ? authHeader.startsWith('Bearer ') : null,
    token_value_start: tokenFromHeader ? tokenFromHeader.substring(0, 30) + '...' : null,
    db_configured: databaseService.isConfigured(),
    message: 'Use this endpoint to verify JWT configuration and token format before testing protected endpoints'
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
            persistAuthorization: true,
            withCredentials: true,
            presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
            plugins: [SwaggerUIBundle.plugins.DownloadUrl],
            requestInterceptor: (request) => {
              // Allow cookies to be sent with requests
              request.credentials = 'include';
              return request;
            },
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
app.route('/api/students', studentsRoutes);
app.route('/api/auth', authRoutes); // Unified auth endpoint for all user types (students, coordinators, partners)
app.route('/api/students/auth', studentAuthRoutes); // Student-specific auth (login, verify, me)
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
app.route('/api/coordinators', coordinatorsRoutes);
app.route('/api/notifications', notificationsRoutes);
app.route('/api/student-portal', studentPortalRoutes);

// Register API Routes - Root level aliases for Frontend Compatibility  
app.route('/students', studentsRoutes);
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
app.route('/coordinators', coordinatorsRoutes);
app.route('/notifications', notificationsRoutes);
app.route('/student-portal', studentPortalRoutes);

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
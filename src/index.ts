import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { d1Middleware } from './utils/hono-express-adapter';

// Import route definitions
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

const app = new Hono<{ Bindings: { DB: D1Database } }>();

// Middlewares
app.use('*', logger());
app.use('*', cors({
  origin: '*', // Adjust for production
  credentials: true,
}));

// Apply D1 Database context to all requests
app.use('*', d1Middleware());

// Health check
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: 'production',
    platform: 'Cloudflare Workers (D1)',
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (c) => {
  return c.json({
    message: 'Student Wellness Dashboard API (Cloudflare Worker)',
    version: '1.0.0',
    documentation: '/api/health'
  });
});

// Register API Routes
app.route('/api/students', studentsRoutes);
app.route('/api/students/auth', studentAuthRoutes);
app.route('/api/auth', authRoutes);
app.route('/api/support-requests', supportRequestsRoutes);
app.route('/api/partners', partnersRoutes);
app.route('/api/dashboard', dashboardRoutes);
app.route('/api/universities', universitiesRoutes);
app.route('/api/programs', programsRoutes);
app.route('/api/risk-levels', riskLevelsRoutes);
app.route('/api/interventions', interventionsRoutes);
app.route('/api/reports', reportsRoutes);

export default app;
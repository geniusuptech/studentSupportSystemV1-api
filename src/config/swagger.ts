export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Student Wellness Dashboard API',
    version: '2.0.0',
    description: 'RESTful API for the Student Wellness Dashboard - Full Production Implementation with Coordinator & Student Portals',
    contact: {
      name: 'API Support',
      email: 'support@studentwellness.example.com'
    }
  },
  servers: [
    { url: '/api', description: 'Cloudflare API Gateway' },
  ],
  tags: [
    { name: 'Health', description: 'API health check' },
    { name: 'Auth', description: 'Authentication & user management' },
    { name: 'Students', description: 'Student management (coordinator-facing)' },
    { name: 'Dashboard', description: 'Coordinator dashboard stats & data' },
    { name: 'Partners', description: 'Support partner management' },
    { name: 'Support Requests', description: 'Support request management' },
    { name: 'Messaging', description: 'In-app messaging system' },
    { name: 'Coordinators', description: 'Coordinator profile & management' },
    { name: 'Interventions', description: 'Student intervention tracking' },
    { name: 'Notifications', description: 'User notification system' },
    { name: 'Reports', description: 'Analytics & reporting' },
    { name: 'Activity Logs', description: 'System activity logging' },
    { name: 'Universities', description: 'University reference data' },
    { name: 'Programs', description: 'Academic program reference data' },
    { name: 'Risk Levels', description: 'Risk level reference data' },
    { name: 'Student Portal', description: 'Student-facing portal endpoints (requires student auth)' },
    { name: 'Student Auth', description: 'Student-specific authentication' },
  ],
  paths: {
    // ==================== HEALTH ====================
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health Check',
        responses: { '200': { description: 'API is healthy' } }
      }
    },

    // ==================== AUTH ====================
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Unified login for all user types (students, coordinators, partners, admins)',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } }
        },
        responses: { '200': { description: 'Login successful with JWT token' }, '401': { description: 'Invalid credentials' } }
      }
    },
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } }
        },
        responses: { '201': { description: 'User created' }, '400': { description: 'Validation error' } }
      }
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user details (name, surname, userType)',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Current user data' }, '401': { description: 'Unauthorized' } }
      }
    },
    '/auth/user-details': {
      get: {
        tags: ['Auth'],
        summary: 'Get user details for frontend routing (includes userType)',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'User details with routing info' }, '401': { description: 'Unauthorized' } }
      }
    },
    '/auth/change-password': {
      post: {
        tags: ['Auth'],
        summary: 'Change password (authenticated)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { currentPassword: { type: 'string' }, newPassword: { type: 'string' } } } } }
        },
        responses: { '200': { description: 'Password changed' }, '400': { description: 'Invalid current password' } }
      }
    },
    '/auth/update-password': {
      post: {
        tags: ['Auth'],
        summary: 'Update password by email (admin/setup)',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, newPassword: { type: 'string' } } } } }
        },
        responses: { '200': { description: 'Password updated' } }
      }
    },
    '/auth/users': {
      get: {
        tags: ['Auth'],
        summary: 'Get all users (admin/setup)',
        responses: { '200': { description: 'List of users' } }
      }
    },
    '/auth/users/{id}': {
      get: {
        tags: ['Auth'],
        summary: 'Get user by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'User data' }, '404': { description: 'Not found' } }
      }
    },
    '/auth/validate-token': {
      get: {
        tags: ['Auth'],
        summary: 'Validate a JWT token',
        responses: { '200': { description: 'Token is valid' }, '400': { description: 'Invalid token' } }
      }
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout (clears JWT cookie)',
        responses: { '200': { description: 'Logged out' } }
      }
    },
    '/auth/deactivate': {
      post: {
        tags: ['Auth'],
        summary: 'Deactivate own account',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { password: { type: 'string' } } } } }
        },
        responses: { '200': { description: 'Account deactivated' } }
      }
    },

    // ==================== STUDENTS (Coordinator-facing) ====================
    '/students': {
      get: {
        tags: ['Students'],
        summary: 'Get all students',
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['Active', 'Inactive'] } },
          { name: 'risk', in: 'query', schema: { type: 'string', enum: ['Safe', 'At Risk', 'Critical'] } },
          { name: 'university', in: 'query', schema: { type: 'string' } }
        ],
        responses: { '200': { description: 'List of students with active request counts' } }
      },
      post: {
        tags: ['Students'],
        summary: 'Create a new student',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateStudent' } } }
        },
        responses: { '201': { description: 'Student created' }, '400': { description: 'Validation error' } }
      }
    },
    '/students/{id}': {
      get: {
        tags: ['Students'],
        summary: 'Get student by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Student details' }, '404': { description: 'Not found' } }
      },
      put: {
        tags: ['Students'],
        summary: 'Update student',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', description: 'Any student fields to update' } } }
        },
        responses: { '200': { description: 'Student updated' }, '404': { description: 'Not found' } }
      },
      delete: {
        tags: ['Students'],
        summary: 'Deactivate student (soft delete)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Student deactivated' }, '404': { description: 'Not found' } }
      }
    },
    '/students/risk/{level}': {
      get: {
        tags: ['Students'],
        summary: 'Get students by risk level',
        parameters: [{ name: 'level', in: 'path', required: true, schema: { type: 'string', enum: ['Safe', 'At Risk', 'Critical'] } }],
        responses: { '200': { description: 'Filtered students' } }
      }
    },
    '/students/statistics': {
      get: {
        tags: ['Students'],
        summary: 'Get student statistics (totals, GPA, risk distribution)',
        responses: { '200': { description: 'Statistics data' } }
      }
    },
    '/students/{id}/risk': {
      put: {
        tags: ['Students'],
        summary: 'Update student risk level',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { riskLevel: { type: 'string', enum: ['Safe', 'At Risk', 'Critical'] }, reason: { type: 'string' } } } } }
        },
        responses: { '200': { description: 'Risk level updated' } }
      }
    },
    '/students/{id}/courses': {
      get: {
        tags: ['Students'],
        summary: 'Get student courses',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Course list' } }
      }
    },
    '/students/{id}/metrics': {
      get: {
        tags: ['Students'],
        summary: 'Get student academic/wellness metrics',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Metrics data' } }
      }
    },
    '/students/{id}/assignments': {
      get: {
        tags: ['Students'],
        summary: 'Get student assignments',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Assignment list' } }
      }
    },

    // ==================== DASHBOARD ====================
    '/dashboard/summary': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get dashboard summary (total students, critical, avg GPA, active interventions)',
        responses: { '200': { description: 'Summary stats' } }
      }
    },
    '/dashboard/risk-distribution': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get risk distribution with counts and percentages',
        responses: { '200': { description: 'Risk distribution data' } }
      }
    },
    '/dashboard/students': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get students formatted for dashboard table',
        parameters: [
          { name: 'university', in: 'query', schema: { type: 'string' } },
          { name: 'program', in: 'query', schema: { type: 'string' } },
          { name: 'riskLevel', in: 'query', schema: { type: 'string' } },
          { name: 'year', in: 'query', schema: { type: 'integer' } }
        ],
        responses: { '200': { description: 'Dashboard student table data' } }
      }
    },
    '/dashboard/student-management': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get student management statistics',
        responses: { '200': { description: 'Management stats' } }
      }
    },
    '/dashboard/search': {
      get: {
        tags: ['Dashboard'],
        summary: 'Search students by keyword',
        parameters: [
          { name: 'q', in: 'query', required: true, schema: { type: 'string' }, description: 'Search keyword' },
          { name: 'university', in: 'query', schema: { type: 'string' } },
          { name: 'riskLevel', in: 'query', schema: { type: 'string' } }
        ],
        responses: { '200': { description: 'Search results' } }
      }
    },
    '/dashboard/export': {
      get: {
        tags: ['Dashboard'],
        summary: 'Export students to XLSX/CSV/JSON',
        parameters: [
          { name: 'format', in: 'query', schema: { type: 'string', enum: ['xlsx', 'csv', 'json'], default: 'xlsx' } }
        ],
        responses: { '200': { description: 'File download or JSON data' } }
      }
    },

    // ==================== COORDINATORS ====================
    '/coordinators': {
      get: {
        tags: ['Coordinators'],
        summary: 'Get all coordinators',
        responses: { '200': { description: 'List of coordinators' } }
      }
    },
    '/coordinators/profile': {
      get: {
        tags: ['Coordinators'],
        summary: 'Get own coordinator profile (from JWT)',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Coordinator profile' }, '401': { description: 'Unauthorized' } }
      },
      put: {
        tags: ['Coordinators'],
        summary: 'Update own coordinator profile',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, email: { type: 'string' }, department: { type: 'string' } } } } }
        },
        responses: { '200': { description: 'Profile updated' } }
      }
    },
    '/coordinators/{id}': {
      get: {
        tags: ['Coordinators'],
        summary: 'Get coordinator by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Coordinator data' }, '404': { description: 'Not found' } }
      },
      put: {
        tags: ['Coordinators'],
        summary: 'Update coordinator by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, email: { type: 'string' }, department: { type: 'string' } } } } }
        },
        responses: { '200': { description: 'Coordinator updated' } }
      }
    },
    '/coordinators/{id}/dashboard': {
      get: {
        tags: ['Coordinators'],
        summary: 'Get coordinator-specific dashboard stats',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Dashboard stats' } }
      }
    },

    // ==================== PARTNERS ====================
    '/partners': {
      get: {
        tags: ['Partners'],
        summary: 'Get all partners',
        parameters: [
          { name: 'type', in: 'query', schema: { type: 'string' } },
          { name: 'available', in: 'query', schema: { type: 'string', enum: ['true', 'false'] } },
          { name: 'location', in: 'query', schema: { type: 'string' } }
        ],
        responses: { '200': { description: 'Partner list' } }
      },
      post: {
        tags: ['Partners'],
        summary: 'Create a new partner',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreatePartner' } } }
        },
        responses: { '201': { description: 'Partner created' }, '400': { description: 'Validation error' } }
      }
    },
    '/partners/available': {
      get: {
        tags: ['Partners'],
        summary: 'Get available partners (with capacity)',
        parameters: [
          { name: 'type', in: 'query', schema: { type: 'string' } },
          { name: 'specialization', in: 'query', schema: { type: 'string' } }
        ],
        responses: { '200': { description: 'Available partners with capacity info' } }
      }
    },
    '/partners/workload': {
      get: {
        tags: ['Partners'],
        summary: 'Get partner workload analysis',
        responses: { '200': { description: 'Workload data and summary' } }
      }
    },
    '/partners/statistics': {
      get: {
        tags: ['Partners'],
        summary: 'Get partner statistics',
        responses: { '200': { description: 'Aggregate partner stats' } }
      }
    },
    '/partners/types': {
      get: {
        tags: ['Partners'],
        summary: 'Get distinct partner types',
        responses: { '200': { description: 'List of partner types' } }
      }
    },
    '/partners/{id}': {
      get: {
        tags: ['Partners'],
        summary: 'Get partner details with stats and recent requests',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Partner details' }, '404': { description: 'Not found' } }
      },
      put: {
        tags: ['Partners'],
        summary: 'Update partner',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', description: 'Any partner fields to update' } } }
        },
        responses: { '200': { description: 'Partner updated' } }
      },
      delete: {
        tags: ['Partners'],
        summary: 'Deactivate partner',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Partner deactivated' } }
      }
    },

    // ==================== SUPPORT REQUESTS ====================
    '/support-requests': {
      get: {
        tags: ['Support Requests'],
        summary: 'Get all support requests',
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['Open', 'In Progress', 'Resolved', 'Closed'] } },
          { name: 'studentId', in: 'query', schema: { type: 'string' } },
          { name: 'partnerId', in: 'query', schema: { type: 'string' } }
        ],
        responses: { '200': { description: 'Support request list' } }
      },
      post: {
        tags: ['Support Requests'],
        summary: 'Create a new support request',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateSupportRequest' } } }
        },
        responses: { '201': { description: 'Request created' } }
      }
    },
    '/support-requests/statistics': {
      get: {
        tags: ['Support Requests'],
        summary: 'Get support request statistics',
        responses: { '200': { description: 'Stats by status, assigned/unassigned' } }
      }
    },
    '/support-requests/{id}': {
      get: {
        tags: ['Support Requests'],
        summary: 'Get support request by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Request details' }, '404': { description: 'Not found' } }
      },
      patch: {
        tags: ['Support Requests'],
        summary: 'Update support request (status, priority)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string' }, priority: { type: 'string' } } } } }
        },
        responses: { '200': { description: 'Updated' } }
      }
    },
    '/support-requests/{id}/assign': {
      put: {
        tags: ['Support Requests'],
        summary: 'Assign a partner to a support request',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { partnerId: { type: 'string' } }, required: ['partnerId'] } } }
        },
        responses: { '200': { description: 'Partner assigned' } }
      }
    },
    '/support-requests/{id}/status': {
      put: {
        tags: ['Support Requests'],
        summary: 'Update support request status',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', enum: ['Open', 'In Progress', 'Resolved', 'Closed'] } } } } }
        },
        responses: { '200': { description: 'Status updated' } }
      }
    },

    // ==================== MESSAGING ====================
    '/messages/conversations': {
      get: {
        tags: ['Messaging'],
        summary: 'Get list of conversations',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Conversation list' } }
      }
    },
    '/messages/thread/{id}': {
      get: {
        tags: ['Messaging'],
        summary: 'Get message thread with another user',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Other user ID' },
          { name: 'type', in: 'query', schema: { type: 'string', enum: ['student', 'coordinator', 'partner'] } }
        ],
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Thread messages' } }
      }
    },
    '/messages/send': {
      post: {
        tags: ['Messaging'],
        summary: 'Send a message',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { recipientId: { type: 'string' }, recipientType: { type: 'string' }, text: { type: 'string' } }, required: ['recipientId', 'text'] } } }
        },
        responses: { '200': { description: 'Message sent' } }
      }
    },
    '/messages/unread-count': {
      get: {
        tags: ['Messaging'],
        summary: 'Get unread message count',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Unread count' } }
      }
    },
    '/messages/mark-read/{id}': {
      post: {
        tags: ['Messaging'],
        summary: 'Mark messages from a user as read',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'type', in: 'query', schema: { type: 'string' } }
        ],
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Messages marked as read' } }
      }
    },

    // ==================== INTERVENTIONS ====================
    '/interventions': {
      get: {
        tags: ['Interventions'],
        summary: 'Get all interventions',
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['Active', 'Pending', 'Completed', 'Cancelled'] } },
          { name: 'studentId', in: 'query', schema: { type: 'string' } },
          { name: 'coordinatorId', in: 'query', schema: { type: 'string' } }
        ],
        responses: { '200': { description: 'Intervention list' } }
      },
      post: {
        tags: ['Interventions'],
        summary: 'Create a new intervention',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateIntervention' } } }
        },
        responses: { '201': { description: 'Intervention created' } }
      }
    },
    '/interventions/active': {
      get: {
        tags: ['Interventions'],
        summary: 'Get active interventions only',
        parameters: [
          { name: 'coordinatorId', in: 'query', schema: { type: 'string' } },
          { name: 'studentId', in: 'query', schema: { type: 'string' } }
        ],
        responses: { '200': { description: 'Active interventions' } }
      }
    },
    '/interventions/statistics': {
      get: {
        tags: ['Interventions'],
        summary: 'Get intervention statistics',
        responses: { '200': { description: 'Intervention stats' } }
      }
    },
    '/interventions/{id}': {
      get: {
        tags: ['Interventions'],
        summary: 'Get intervention by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Intervention details' }, '404': { description: 'Not found' } }
      },
      put: {
        tags: ['Interventions'],
        summary: 'Update intervention',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string' }, notes: { type: 'string' }, priority: { type: 'string' }, followUpDate: { type: 'string' } } } } }
        },
        responses: { '200': { description: 'Intervention updated' } }
      }
    },

    // ==================== NOTIFICATIONS ====================
    '/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'Get notifications for current user',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'unreadOnly', in: 'query', schema: { type: 'string', enum: ['true', 'false'] } },
          { name: 'type', in: 'query', schema: { type: 'string', enum: ['info', 'warning', 'error', 'success'] } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } }
        ],
        responses: { '200': { description: 'Notification list' } }
      },
      post: {
        tags: ['Notifications'],
        summary: 'Create a notification (system use)',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { userId: { type: 'string' }, userType: { type: 'string' }, title: { type: 'string' }, message: { type: 'string' }, type: { type: 'string' }, link: { type: 'string' } }, required: ['userId', 'userType', 'title', 'message'] } } }
        },
        responses: { '201': { description: 'Notification created' } }
      }
    },
    '/notifications/unread-count': {
      get: {
        tags: ['Notifications'],
        summary: 'Get unread notification count',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Unread count' } }
      }
    },
    '/notifications/{id}/read': {
      post: {
        tags: ['Notifications'],
        summary: 'Mark a notification as read',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Marked as read' } }
      }
    },
    '/notifications/mark-all-read': {
      post: {
        tags: ['Notifications'],
        summary: 'Mark all notifications as read',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'All marked as read' } }
      }
    },

    // ==================== REPORTS ====================
    '/reports/summary': {
      get: {
        tags: ['Reports'],
        summary: 'Comprehensive summary report (students, requests, partners, universities)',
        responses: { '200': { description: 'Full summary report' } }
      }
    },
    '/reports/risk-trends': {
      get: {
        tags: ['Reports'],
        summary: 'Risk level trends over time',
        responses: { '200': { description: 'Trend data' } }
      }
    },
    '/reports/support-requests': {
      get: {
        tags: ['Reports'],
        summary: 'Support request analytics (by status, priority, category, monthly)',
        responses: { '200': { description: 'Support request analytics' } }
      }
    },
    '/reports/partners': {
      get: {
        tags: ['Reports'],
        summary: 'Partner performance report',
        responses: { '200': { description: 'Partner performance data' } }
      }
    },
    '/reports/activity': {
      get: {
        tags: ['Reports'],
        summary: 'Recent system activity report',
        responses: { '200': { description: 'Activity log entries' } }
      }
    },
    '/reports/students/export': {
      get: {
        tags: ['Reports'],
        summary: 'Export students to file (XLSX/CSV/JSON)',
        parameters: [
          { name: 'format', in: 'query', schema: { type: 'string', enum: ['xlsx', 'csv', 'json'], default: 'xlsx' } }
        ],
        responses: { '200': { description: 'File download or JSON data' } }
      }
    },

    // ==================== ACTIVITY LOGS ====================
    '/logs': {
      get: {
        tags: ['Activity Logs'],
        summary: 'Get activity logs',
        parameters: [
          { name: 'userType', in: 'query', schema: { type: 'string' } },
          { name: 'userId', in: 'query', schema: { type: 'string' } },
          { name: 'action', in: 'query', schema: { type: 'string' } },
          { name: 'entityType', in: 'query', schema: { type: 'string' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } }
        ],
        responses: { '200': { description: 'Log entries' } }
      },
      post: {
        tags: ['Activity Logs'],
        summary: 'Create a new activity log entry',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { userType: { type: 'string' }, userId: { type: 'string' }, action: { type: 'string' }, entityType: { type: 'string' }, entityId: { type: 'string' }, details: { type: 'string' } }, required: ['action'] } } }
        },
        responses: { '201': { description: 'Log created' } }
      }
    },
    '/logs/entity/{type}/{id}': {
      get: {
        tags: ['Activity Logs'],
        summary: 'Get logs for a specific entity',
        parameters: [
          { name: 'type', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: { '200': { description: 'Entity-specific logs' } }
      }
    },
    '/logs/{id}/status': {
      put: {
        tags: ['Activity Logs'],
        summary: 'Update log entry details',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Log updated' } }
      }
    },

    // ==================== UNIVERSITIES ====================
    '/universities': {
      get: {
        tags: ['Universities'],
        summary: 'Get all universities with student counts',
        responses: { '200': { description: 'University list' } }
      }
    },
    '/universities/student/{studentId}': {
      get: {
        tags: ['Universities'],
        summary: 'Get university by student ID',
        parameters: [{ name: 'studentId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'University data' }, '404': { description: 'Student not found' } }
      }
    },

    // ==================== PROGRAMS ====================
    '/programs': {
      get: {
        tags: ['Programs'],
        summary: 'Get all academic programs with student counts',
        responses: { '200': { description: 'Program list' } }
      }
    },
    '/programs/student/{studentId}': {
      get: {
        tags: ['Programs'],
        summary: 'Get program by student ID',
        parameters: [{ name: 'studentId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Program data' }, '404': { description: 'Student not found' } }
      }
    },

    // ==================== RISK LEVELS ====================
    '/risk-levels': {
      get: {
        tags: ['Risk Levels'],
        summary: 'Get all risk level definitions',
        responses: { '200': { description: 'Risk level list with colors and descriptions' } }
      }
    },
    '/risk-levels/student/{studentId}': {
      get: {
        tags: ['Risk Levels'],
        summary: 'Get risk level for a specific student',
        parameters: [{ name: 'studentId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Student risk level' }, '404': { description: 'Student not found' } }
      }
    },

    // ==================== STUDENT AUTH ====================
    '/students/auth/login': {
      post: {
        tags: ['Student Auth'],
        summary: 'Student-specific login (validates student account type)',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } }
        },
        responses: { '200': { description: 'Login successful' }, '401': { description: 'Invalid credentials or not a student account' } }
      }
    },
    '/students/auth/verify': {
      get: {
        tags: ['Student Auth'],
        summary: 'Verify student JWT token',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Token is valid' }, '401': { description: 'Invalid token' } }
      }
    },
    '/students/auth/me': {
      get: {
        tags: ['Student Auth'],
        summary: 'Get current student info from token',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Student info' }, '401': { description: 'Unauthorized' } }
      }
    },

    // ==================== STUDENT PORTAL ====================
    '/student-portal/dashboard': {
      get: {
        tags: ['Student Portal'],
        summary: 'Get student dashboard (profile, summary stats, recent grades, upcoming assignments)',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Full dashboard data' } }
      }
    },
    '/student-portal/profile': {
      get: {
        tags: ['Student Portal'],
        summary: 'Get student profile (personal info, university, program, bio, interests)',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Profile data' } }
      },
      put: {
        tags: ['Student Portal'],
        summary: 'Update student profile',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, phone: { type: 'string' }, bio: { type: 'string' }, interests: { type: 'string' }, goals: { type: 'string' }, achievements: { type: 'string' }, preferredContactMethod: { type: 'string' } } } } }
        },
        responses: { '200': { description: 'Profile updated' } }
      }
    },
    '/student-portal/courses': {
      get: {
        tags: ['Student Portal'],
        summary: 'Get enrolled courses',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['In Progress', 'Completed', 'Withdrawn', 'Failed'] } },
          { name: 'semester', in: 'query', schema: { type: 'string' } },
          { name: 'year', in: 'query', schema: { type: 'integer' } }
        ],
        responses: { '200': { description: 'Course list' } }
      }
    },
    '/student-portal/courses/summary': {
      get: {
        tags: ['Student Portal'],
        summary: 'Get course summary stats (total, in-progress, completed, avg grade, credits)',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Course summary' } }
      }
    },
    '/student-portal/assignments': {
      get: {
        tags: ['Student Portal'],
        summary: 'Get assignments',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['Pending', 'Submitted', 'Graded', 'Late', 'Missing'] } },
          { name: 'courseId', in: 'query', schema: { type: 'string' } },
          { name: 'upcoming', in: 'query', schema: { type: 'string', enum: ['true'] } },
          { name: 'overdue', in: 'query', schema: { type: 'string', enum: ['true'] } }
        ],
        responses: { '200': { description: 'Assignment list' } }
      }
    },
    '/student-portal/assignments/summary': {
      get: {
        tags: ['Student Portal'],
        summary: 'Get assignment summary stats',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Assignment summary' } }
      }
    },
    '/student-portal/grades': {
      get: {
        tags: ['Student Portal'],
        summary: 'Get all grades (courses + assignments + GPA)',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Grades data' } }
      }
    },
    '/student-portal/support-requests': {
      get: {
        tags: ['Student Portal'],
        summary: 'Get own support requests',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string' } }
        ],
        responses: { '200': { description: 'Support request list' } }
      },
      post: {
        tags: ['Student Portal'],
        summary: 'Submit a new support request',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { title: { type: 'string' }, description: { type: 'string' }, categoryId: { type: 'integer' }, priority: { type: 'string', enum: ['Low', 'Medium', 'High'] } }, required: ['title', 'description'] } } }
        },
        responses: { '201': { description: 'Request created' } }
      }
    },
    '/student-portal/support-requests/categories': {
      get: {
        tags: ['Student Portal'],
        summary: 'Get support request categories',
        responses: { '200': { description: 'Category list' } }
      }
    },
    '/student-portal/wellness': {
      get: {
        tags: ['Student Portal'],
        summary: 'Get wellness data (metrics, risk level, check-in history)',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Wellness data' } }
      }
    },
    '/student-portal/wellness/checkin': {
      post: {
        tags: ['Student Portal'],
        summary: 'Submit a wellness check-in',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { moodScore: { type: 'integer', minimum: 1, maximum: 10 }, stressLevel: { type: 'integer', minimum: 1, maximum: 10 }, sleepHours: { type: 'number' }, exerciseMinutes: { type: 'integer' }, notes: { type: 'string' } } } } }
        },
        responses: { '201': { description: 'Check-in recorded' } }
      }
    },
    '/student-portal/schedule': {
      get: {
        tags: ['Student Portal'],
        summary: 'Get weekly schedule',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'dayOfWeek', in: 'query', schema: { type: 'string', enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] } },
          { name: 'type', in: 'query', schema: { type: 'string', enum: ['Lecture', 'Tutorial', 'Lab', 'Exam', 'Other'] } }
        ],
        responses: { '200': { description: 'Schedule items' } }
      },
      post: {
        tags: ['Student Portal'],
        summary: 'Add a schedule item',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { title: { type: 'string' }, dayOfWeek: { type: 'string' }, startTime: { type: 'string' }, endTime: { type: 'string' }, location: { type: 'string' }, type: { type: 'string' }, courseId: { type: 'integer' } }, required: ['title', 'dayOfWeek', 'startTime', 'endTime'] } } }
        },
        responses: { '201': { description: 'Schedule item added' } }
      }
    },
    '/student-portal/schedule/{id}': {
      delete: {
        tags: ['Student Portal'],
        summary: 'Remove a schedule item',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Schedule item removed' } }
      }
    },
    '/student-portal/settings': {
      get: {
        tags: ['Student Portal'],
        summary: 'Get student settings (theme, notifications, privacy)',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Settings data' } }
      },
      put: {
        tags: ['Student Portal'],
        summary: 'Update student settings',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { theme: { type: 'string', enum: ['light', 'dark', 'system'] }, language: { type: 'string' }, emailNotifications: { type: 'boolean' }, pushNotifications: { type: 'boolean' }, smsNotifications: { type: 'boolean' }, showProfilePublic: { type: 'boolean' }, showGPA: { type: 'boolean' }, twoFactorEnabled: { type: 'boolean' } } } } }
        },
        responses: { '200': { description: 'Settings updated' } }
      }
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'mfundo1.mthembu@gmail.com' },
          password: { type: 'string', minLength: 6, example: 'Genius-dev' }
        }
      },
      RegisterRequest: {
        type: 'object',
        required: ['email', 'password', 'userType', 'firstName', 'lastName'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
          userType: { type: 'string', enum: ['Student', 'Coordinator', 'Partner'] },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          studentID: { type: 'string', description: 'Required if userType is Student' },
          coordinatorID: { type: 'string', description: 'Required if userType is Coordinator' },
          partnerID: { type: 'string', description: 'Required if userType is Partner' }
        }
      },
      LoginResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          token: { type: 'string' },
          expiresIn: { type: 'string' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string' },
              type: { type: 'string', enum: ['Student', 'Coordinator', 'Partner', 'Admin'] },
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              studentId: { type: 'string' },
              coordinatorId: { type: 'string' },
              partnerId: { type: 'string' }
            }
          }
        }
      },
      CreateStudent: {
        type: 'object',
        required: ['name', 'studentNumber', 'universityId', 'programId', 'email'],
        properties: {
          name: { type: 'string', example: 'John Smith' },
          studentNumber: { type: 'string', example: 'ST2026050' },
          universityId: { type: 'integer', example: 1 },
          programId: { type: 'integer', example: 1 },
          year: { type: 'integer', example: 2 },
          gpa: { type: 'number', example: 3.5 },
          riskLevel: { type: 'string', enum: ['Safe', 'At Risk', 'Critical'], default: 'Safe' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          emergencyContact: { type: 'string' },
          emergencyPhone: { type: 'string' }
        }
      },
      CreatePartner: {
        type: 'object',
        required: ['name', 'email'],
        properties: {
          name: { type: 'string', example: 'Dr. Jane Counselor' },
          type: { type: 'string', example: 'Individual' },
          specialization: { type: 'string', example: 'Academic Counseling' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          maxCapacity: { type: 'integer', default: 10 },
          hourlyRate: { type: 'number' },
          location: { type: 'string' },
          bio: { type: 'string' },
          yearsOfExperience: { type: 'integer' }
        }
      },
      CreateSupportRequest: {
        type: 'object',
        required: ['studentId', 'title', 'description'],
        properties: {
          studentId: { type: 'integer' },
          categoryId: { type: 'integer', default: 1 },
          title: { type: 'string' },
          description: { type: 'string' },
          priority: { type: 'string', enum: ['Low', 'Medium', 'High'], default: 'Medium' }
        }
      },
      CreateIntervention: {
        type: 'object',
        required: ['studentId', 'type'],
        properties: {
          studentId: { type: 'integer' },
          coordinatorId: { type: 'integer' },
          type: { type: 'string', example: 'Academic Review' },
          notes: { type: 'string' },
          priority: { type: 'string', enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
          followUpDate: { type: 'string', format: 'date' }
        }
      }
    }
  },
};

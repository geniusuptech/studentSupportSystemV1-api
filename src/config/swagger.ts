export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Student Wellness Dashboard API',
    version: '1.0.0',
    description: 'RESTful API for the Student Wellness Dashboard - Production Implementation',
    contact: {
      name: 'API Support',
      email: 'support@studentwellness.example.com'
    }
  },
  servers: [
    { url: '/api', description: 'Cloudflare API Gateway' },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health Check',
        responses: { '200': { description: 'API is healthy' } }
      }
    },
'/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Unified login for all user types (students, coordinators, partners, admins)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/LoginRequest'
              }
            }
          }
        },
        responses: { '200': { description: 'Success' }, '401': { description: 'Unauthorized' } }
      }
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user details (name, surname, userType)',
        security: [{ bearerAuth: [] }],
        responses: { 
          '200': { description: 'Success', content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginResponse' } } } },
          '401': { description: 'Unauthorized' }
        }
      }
    },
    '/students': {
      get: {
        tags: ['Students'],
        summary: 'Get all students',
        responses: { '200': { description: 'Success' } }
      }
    },
    '/students/{id}': {
      get: {
        tags: ['Students'],
        summary: 'Get student details',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Success' }, '404': { description: 'Not Found' } }
      }
    },
    '/students/risk/{level}': {
      get: {
        tags: ['Students'],
        summary: 'Get students by risk level',
        parameters: [{ name: 'level', in: 'path', required: true, schema: { type: 'string', enum: ['Safe', 'At Risk', 'Critical'] } }],
        responses: { '200': { description: 'Success' } }
      }
    },

    '/dashboard/summary': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get summary stats',
        responses: { '200': { description: 'Success' } }
      }
    },
    '/dashboard/risk-distribution': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get risk distribution graph data',
        responses: { '200': { description: 'Success' } }
      }
    },
    '/partners': {
      get: {
        tags: ['Partners'],
        summary: 'Get all partners',
        responses: { '200': { description: 'Success' } }
      }
    },
    '/support-requests': {
      get: {
        tags: ['Support'],
        summary: 'Get all support requests',
        responses: { '200': { description: 'Success' } }
      }
    },
    '/messages/conversations': {
      get: {
        tags: ['Messaging'],
        summary: 'Get list of conversations',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Success' } }
      }
    },
    '/messages/thread/{id}': {
      get: {
        tags: ['Messaging'],
        summary: 'Get message thread',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Success' } }
      }
    },
    '/messages/send': {
      post: {
        tags: ['Messaging'],
        summary: 'Send message',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Success' } }
      }
    }
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
          email: {
            type: 'string',
            format: 'email',
            example: 'student@example.com'
          },
          password: {
            type: 'string',
            minLength: 6,
            example: 'password123'
          }
        }
      },
      LoginResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          token: { type: 'string' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              type: { type: 'string', enum: ['student', 'coordinator', 'admin'] },
              email: { type: 'string' }
            }
          }
        }
      }
    }
  },
};

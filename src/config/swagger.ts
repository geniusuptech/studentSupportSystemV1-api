import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Student Wellness Dashboard API',
      version: '1.0.0',
      description: 'RESTful API for the Student Wellness Dashboard - Managing student data, risk assessments, and support requests',
      contact: {
        name: 'Student Wellness Team',
        email: 'support@studentwellness.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001/api',
        description: 'Development server',
      },
      {
        url: 'https://api.studentwellness.com/api',
        description: 'Production server',
      },
    ],
    tags: [
      {
        name: 'Students',
        description: 'Student management endpoints',
      },
      {
        name: 'Partners',
        description: 'Partner organization management',
      },
      {
        name: 'Support Requests',
        description: 'Student support request management',
      },
      {
        name: 'Health',
        description: 'API health and status endpoints',
      },
    ],
    components: {
      schemas: {
        Student: {
          type: 'object',
          required: ['StudentID', 'StudentName', 'StudentNumber', 'UniversityID', 'ProgramID'],
          properties: {
            StudentID: {
              type: 'integer',
              description: 'Unique student identifier',
              example: 21056789,
            },
            StudentName: {
              type: 'string',
              description: 'Full name of the student',
              example: 'Lerato Khumalo',
            },
            StudentNumber: {
              type: 'string',
              description: 'University student number',
              example: 'STUD21056789',
            },
            UniversityID: {
              type: 'integer',
              description: 'University identifier',
              example: 1,
            },
            UniversityName: {
              type: 'string',
              description: 'University name',
              example: 'University of Cape Town',
            },
            ProgramID: {
              type: 'integer',
              description: 'Academic program identifier',
              example: 1,
            },
            ProgramName: {
              type: 'string',
              description: 'Academic program name',
              example: 'BCom Accounting',
            },
            YearOfStudy: {
              type: 'integer',
              description: 'Current year of study',
              example: 2,
              minimum: 1,
              maximum: 6,
            },
            GPA: {
              type: 'number',
              format: 'float',
              description: 'Grade Point Average',
              example: 2.1,
              minimum: 0.0,
              maximum: 4.0,
            },
            RiskLevel: {
              type: 'string',
              enum: ['Safe', 'At Risk', 'Critical'],
              description: 'Student risk assessment level',
              example: 'At Risk',
            },
            ContactEmail: {
              type: 'string',
              format: 'email',
              description: 'Student contact email',
              example: 'lerato.khumalo@uct.ac.za',
            },
            ContactPhone: {
              type: 'string',
              description: 'Student phone number',
              example: '+27 83 555 4455',
            },
            EmergencyContact: {
              type: 'string',
              description: 'Emergency contact name',
              example: 'Thabo Khumalo',
            },
            EmergencyPhone: {
              type: 'string',
              description: 'Emergency contact phone',
              example: '+27 84 555 7788',
            },
            DateEnrolled: {
              type: 'string',
              format: 'date-time',
              description: 'Date of enrollment',
              example: '2023-02-15T00:00:00.000Z',
            },
            LastLoginDate: {
              type: 'string',
              format: 'date-time',
              description: 'Last login timestamp',
              example: '2026-02-25T08:30:00.000Z',
            },
            IsActive: {
              type: 'boolean',
              description: 'Whether the student record is active',
              example: true,
            },
            CreatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Record creation timestamp',
            },
            UpdatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Record last update timestamp',
            },
            ActiveRequestCount: {
              type: 'integer',
              description: 'Number of active support requests',
              example: 0,
            },
          },
        },
        StudentProfile: {
          type: 'object',
          properties: {
            StudentInfo: {
              type: 'object',
              properties: {
                StudentID: { type: 'integer', example: 21056789 },
                StudentName: { type: 'string', example: 'Lerato Khumalo' },
                StudentNumber: { type: 'string', example: 'STUD21056789' },
                RiskLevel: { type: 'string', enum: ['Safe', 'At Risk', 'Critical'], example: 'At Risk' },
                GPA: { type: 'number', example: 2.1 },
                YearOfStudy: { type: 'integer', example: 2 },
                ContactEmail: { type: 'string', example: 'lerato.khumalo@uct.ac.za' },
                ContactPhone: { type: 'string', example: '+27 83 555 4455' },
                EmergencyContact: { type: 'string', example: 'Thabo Khumalo' },
                EmergencyPhone: { type: 'string', example: '+27 84 555 7788' },
                DateEnrolled: { type: 'string', format: 'date-time' },
                LastLoginDate: { type: 'string', format: 'date-time' },
              },
            },
            UniversityInfo: {
              type: 'object',
              properties: {
                UniversityID: { type: 'integer', example: 1 },
                UniversityName: { type: 'string', example: 'University of Cape Town' },
              },
            },
            ProgramInfo: {
              type: 'object',
              properties: {
                ProgramID: { type: 'integer', example: 1 },
                ProgramName: { type: 'string', example: 'BCom Accounting' },
              },
            },
          },
        },
        StudentStatistics: {
          type: 'object',
          properties: {
            totalStudents: {
              type: 'integer',
              description: 'Total number of active students',
              example: 150,
            },
            riskLevels: {
              type: 'object',
              properties: {
                safe: { type: 'integer', example: 62 },
                atRisk: { type: 'integer', example: 45 },
                critical: { type: 'integer', example: 23 },
              },
            },
            averageGPA: {
              type: 'number',
              format: 'float',
              example: 2.8,
            },
            universities: {
              type: 'object',
              additionalProperties: {
                type: 'integer',
              },
              example: {
                'University of Cape Town': 45,
                'University of the Witwatersrand': 38,
              },
            },
            programs: {
              type: 'object',
              additionalProperties: {
                type: 'integer',
              },
              example: {
                'Computer Science': 25,
                'Business Administration': 22,
              },
            },
            yearDistribution: {
              type: 'object',
              additionalProperties: {
                type: 'integer',
              },
              example: {
                'Year 1': 45,
                'Year 2': 38,
                'Year 3': 35,
              },
            },
          },
        },
        UpdateRiskLevelRequest: {
          type: 'object',
          required: ['riskLevel'],
          properties: {
            riskLevel: {
              type: 'string',
              enum: ['Safe', 'At Risk', 'Critical'],
              description: 'New risk level for the student',
              example: 'Critical',
            },
            reason: {
              type: 'string',
              description: 'Reason for the risk level change',
              example: 'Academic performance declined significantly',
            },
          },
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Operation completed successfully',
            },
            data: {
              type: 'object',
              description: 'Response data',
            },
            count: {
              type: 'integer',
              description: 'Number of items returned (for list endpoints)',
            },
            error: {
              type: 'string',
              description: 'Error message (only present on errors)',
            },
          },
        },
        ValidationError: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Validation failed',
            },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  msg: { type: 'string', example: 'Student ID must be a positive integer' },
                  param: { type: 'string', example: 'id' },
                  location: { type: 'string', example: 'params' },
                },
              },
            },
          },
        },
      },
      responses: {
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: { type: 'string', example: 'Student not found' },
                  message: { type: 'string', example: 'Student with ID 999999 not found or inactive' },
                },
              },
            },
          },
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ValidationError' },
            },
          },
        },
        InternalServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: { type: 'string', example: 'Internal server error' },
                  message: { type: 'string', example: 'An unexpected error occurred' },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // Path to the API files
};

export const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
  // Swagger page
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Student Wellness API Documentation',
  }));

  // Docs in JSON format
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
};
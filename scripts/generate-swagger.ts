import swaggerJsdoc from 'swagger-jsdoc';
import fs from 'fs';
import path from 'path';

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
        url: 'http://localhost:3000/api',
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

// Ensure the directory exists
const outputDir = path.join(__dirname, '../src/config');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(
  path.join(outputDir, 'swagger.json'),
  JSON.stringify(swaggerSpec, null, 2)
);

console.log('✅ Swagger JSON generated successfully!');

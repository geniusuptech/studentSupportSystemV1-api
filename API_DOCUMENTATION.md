# Student Wellness Dashboard API Documentation

## 📖 Overview

The Student Wellness Dashboard API is a RESTful service designed to manage student data, risk assessments, and support requests for educational institutions.

## 🚀 Quick Start

### Starting the Server

```bash
# Development mode
npm run dev

# Production mode  
npm run build
npm start
```

### Accessing API Documentation

Once the server is running, you can access the interactive API documentation at:

**📋 Swagger UI:** http://localhost:3001/api-docs

**📄 OpenAPI JSON:** http://localhost:3001/api-docs.json

## 🛠️ API Endpoints

### Base URL
```
http://localhost:3001/api
```

### Health & Status
- `GET /api/health` - Check API health and status
- `GET /api/test-db` - Test database connection

### Students
- `GET /api/students` - Get all students
- `GET /api/students/{id}` - Get student by ID (detailed profile)
- `GET /api/students/risk/{level}` - Get students by risk level
- `GET /api/students/statistics` - Get student statistics  
- `PUT /api/students/{id}/risk` - Update student risk level

### Partners
- `GET /api/partners` - Get all partners
- (Additional partner endpoints as implemented)

### Support Requests
- `GET /api/support-requests` - Get all support requests
- (Additional support request endpoints as implemented)

## 🧪 Testing the API

### Using Swagger UI
1. Navigate to http://localhost:3001/api-docs
2. Expand any endpoint section
3. Click "Try it out"
4. Fill in required parameters
5. Click "Execute" to test

### Using curl

```bash
# Get all students
curl -X GET "http://localhost:3001/api/students"

# Get specific student (example ID: 21056789)
curl -X GET "http://localhost:3001/api/students/21056789"

# Get students by risk level
curl -X GET "http://localhost:3001/api/students/risk/At%20Risk"

# Update student risk level
curl -X PUT "http://localhost:3001/api/students/21056789/risk" \
  -H "Content-Type: application/json" \
  -d '{"riskLevel": "Critical", "reason": "Academic performance declined"}'
```

### Using JavaScript/Node.js

```javascript
// Test script example
const BASE_URL = 'http://localhost:3001/api';

// Get student by ID
async function getStudent(id) {
  const response = await fetch(`${BASE_URL}/students/${id}`);
  const data = await response.json();
  return data;
}

// Usage
getStudent(21056789).then(student => console.log(student));
```

## 📊 Response Formats

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "count": 150 // for list endpoints
}
```

### Error Response
```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

### Validation Error
```json
{
  "error": "Validation failed",
  "details": [
    {
      "msg": "Student ID must be a positive integer",
      "param": "id",
      "location": "params"
    }
  ]
}
```

## 🔒 Authentication

Currently, the API does not require authentication. This may be added in future versions using JWT tokens.

## 🎯 Risk Levels

Students can have one of three risk levels:
- **Safe**: Student is performing well
- **At Risk**: Student needs monitoring
- **Critical**: Student requires immediate intervention

## 📋 Data Models

### Student Object
```json
{
  "StudentID": 21056789,
  "StudentName": "Lerato Khumalo",
  "StudentNumber": "STUD21056789",
  "UniversityID": 1,
  "UniversityName": "University of Cape Town",
  "ProgramID": 1,
  "ProgramName": "BCom Accounting",
  "YearOfStudy": 2,
  "GPA": 2.1,
  "RiskLevel": "At Risk",
  "ContactEmail": "lerato.khumalo@uct.ac.za",
  "ContactPhone": "+27 83 555 4455",
  "EmergencyContact": "Thabo Khumalo",
  "EmergencyPhone": "+27 84 555 7788",
  "DateEnrolled": "2023-02-15T00:00:00.000Z",
  "LastLoginDate": "2026-02-25T08:30:00.000Z",
  "IsActive": true,
  "CreatedAt": "2023-02-15T10:00:00.000Z",
  "UpdatedAt": "2026-03-01T09:30:00.000Z",
  "ActiveRequestCount": 0
}
```

## 🚨 Error Codes

- **400**: Bad Request - Invalid input or validation error
- **404**: Not Found - Resource does not exist
- **500**: Internal Server Error - Server-side error

## 🔧 Development

### Environment Variables
Create a `.env` file with your database configuration:

```env
NODE_ENV=development
PORT=3001
DB_SERVER=localhost\SQLEXPRESS
DB_NAME=StudentWellnessDB
DB_USER=
DB_PASSWORD=
DB_PORT=1433
DB_ENCRYPT=false
DB_TRUST_CERT=true
```

### Building and Running
```bash
# Install dependencies
npm install

# Development with hot reload
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

## 📝 API Versioning

Current API version: **v1.0.0**

Future versions will be accessible via path versioning:
- `/api/v1/...`
- `/api/v2/...`

## 🤝 Support

For API support and questions:
- Check the Swagger documentation at `/api-docs`
- Review the test examples in `test-student-api.js`
- Test database connectivity with `test-database-connection.js`

## 📚 Additional Resources

- **Interactive Documentation**: http://localhost:3001/api-docs
- **OpenAPI Specification**: http://localhost:3001/api-docs.json
- **Health Check**: http://localhost:3001/api/health
- **Database Test**: http://localhost:3001/api/test-db
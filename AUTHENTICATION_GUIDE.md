# Authentication API Testing Guide

## Overview
The Student Wellness Dashboard API now includes comprehensive authentication functionality with JWT tokens. This guide shows how to test the authentication endpoints.

## Environment Setup
1. Make sure your database is running with the Users table created
2. Set your JWT_SECRET in the .env file (copy from .env.example)
3. Server should be running on http://localhost:3001

## Authentication Endpoints

### 1. User Registration
**POST** `/api/auth/register`

**Request Body:**
```json
{
  "email": "test.student@example.com",
  "password": "SecurePassword123",
  "confirmPassword": "SecurePassword123", 
  "firstName": "Test",
  "lastName": "Student",
  "userType": "Student"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "user": {
    "UserID": 123,
    "Email": "test.student@example.com",
    "UserType": "Student",
    "FirstName": "Test",
    "LastName": "Student"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "24h"
}
```

### 2. User Login
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "admin@studentwellness.com",
  "password": "YOUR_GENERATED_PASSWORD"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "UserID": 5,
    "Email": "admin@studentwellness.com",
    "UserType": "Admin",
    "FirstName": "System",
    "LastName": "Administrator"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "24h"
}
```

### 3. Get Current User (Protected Route)
**GET** `/api/auth/me`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "user": {
    "UserID": 5,
    "Email": "admin@studentwellness.com",
    "UserType": "Admin",
    "FirstName": "System",
    "LastName": "Administrator",
    "IsActive": true,
    "CreatedAt": "2026-03-01T10:30:00.000Z"
  }
}
```

### 4. Change Password (Protected Route)
**POST** `/api/auth/change-password`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Request Body:**
```json
{
  "currentPassword": "YOUR_CURRENT_PASSWORD",
  "newPassword": "NewSecurePassword456",
  "confirmNewPassword": "NewSecurePassword456"
}
```

### 5. Logout
**POST** `/api/auth/logout`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Sample Test Users

Use generated credentials from setup scripts, not static default passwords.

Password formats:
- `Student`: `GUPS{First2Letters}{SurnameInitial}{NNN}`
- `Coordinator`: `GUPC{First2Letters}{SurnameInitial}{NNN}`
- `Partner`: `GUPP{First2Letters}{SurnameInitial}{NNN}`
- `Admin`: `GUPA{First2Letters}{SurnameInitial}{NNN}`

Generate/reset Users-table credentials:
```bash
npm run setup:users-auth
```

| Email | Password | User Type | Description |
|-------|----------|-----------|-------------|
| admin@studentwellness.com | Generated (`GUPA...`) | Admin | System Administrator |
| sarah.mitchell@uct.ac.za | Generated (`GUPC...`) | Coordinator | UCT Coordinator |
| david.johnson@wits.ac.za | Generated (`GUPC...`) | Coordinator | Wits Coordinator |
| lerato.khumalo@students.uct.ac.za | Generated (`GUPS...`) | Student | Sample Student |
| michael.chen@uct.ac.za | Generated (`GUPP...`) | Partner | Sample Partner |

**⚠️ IMPORTANT: Change all default passwords before production deployment!**

## Testing with cURL

### Register a new user:
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "SecurePassword123",
    "confirmPassword": "SecurePassword123",
    "firstName": "New",
    "lastName": "User",
    "userType": "Student"
  }'
```

### Login:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@studentwellness.com",
    "password": "YOUR_GENERATED_PASSWORD"
  }'
```

### Get current user (replace TOKEN with actual JWT):
```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## Testing with Postman/Thunder Client

1. **Create a new request collection for Authentication**
2. **Set base URL**: `http://localhost:3001/api/auth`
3. **Test Registration**: POST to `/register` with user data
4. **Test Login**: POST to `/login` with credentials  
5. **Save the JWT token** from login response
6. **Test Protected Routes**: Add `Authorization: Bearer {token}` header

## Error Responses

### Validation Error (400):
```json
{
  "success": false,
  "error": "Validation Error",
  "message": "Please check your input data",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

### Authentication Error (401):
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Access token is required"
}
```

### Invalid Credentials (401):
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

## Token Management

- **JWT tokens expire in 24 hours** (configurable via JWT_EXPIRES_IN env variable)
- **Store tokens securely** on the client side (recommend httpOnly cookies or secure localStorage)
- **Include tokens in all protected API calls** using the Authorization header
- **Handle token expiration** gracefully by redirecting to login

## Role-Based Access Control

The API supports role-based access with these user types:
- **Student**: Access to their own data and support requests
- **Partner**: Access to assigned students and support cases  
- **Coordinator**: Full access to university students and dashboard
- **Admin**: System-wide administrative access

Use the middleware functions for route protection:
- `authenticateToken`: Require valid JWT
- `requireCoordinatorAccess`: Coordinator or Admin only
- `requireStudentAccess`: Student, Coordinator, or Admin
- `requirePartnerAccess`: Partner, Coordinator, or Admin  
- `requireAdminAccess`: Admin only

## Integration with Swagger UI

Visit `http://localhost:3001/api-docs` to see the interactive API documentation with authentication schemas and try the endpoints directly from the browser.

## Next Steps

1. **Run the database scripts** in order:
   - `universities_table_script.sql`
   - `partners_table_script.sql` 
   - `users_table_script.sql`
   - `coordinator_dashboard_sample_data.sql`
   - `npm run setup:users-auth`

2. **Test the authentication flow** using the sample credentials

3. **Protect existing routes** by adding authentication middleware

4. **Integrate with your frontend** application for complete user management

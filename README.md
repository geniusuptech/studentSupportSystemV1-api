# Student Wellness Dashboard API (Cloudflare D1)

A production-ready, ultra-lightweight REST API for the Student Wellness Dashboard, built with **Hono**, **TypeScript**, and **Cloudflare D1 SQL**, fully optimized for Cloudflare Workers.

## 📋 Overview

This API is now entirely serverless and runs on the Cloudflare Edge. Its database is hosted on **Cloudflare D1**, eliminating the need for an external Microsoft SQL Server.

- **Frontend**: Hosted on [Netlify](https://www.netlify.com/).
- **Backend API**: Hosted on [Cloudflare Workers](https://workers.cloudflare.com/).
- **Database**: [Cloudflare D1](https://developers.cloudflare.com/d1/) (Serverless SQLite).

## 🏗️ Architecture

- **Framework**: [Hono](https://hono.dev/) (Ultra-fast web framework).
- **Runtime**: Cloudflare Workers (Native V8 isolates).
- **Database Engine**: Cloudflare D1 (SQL-based serverless storage).
- **Authentication**: `hono/jwt` (Standard-compliant Web Crypto).
- **Language**: TypeScript (Strongly typed).

## 🚀 Deployment & Management

### 1. The Live API
The API is live at:
**`https://student-support-api.kimnanuseb.workers.dev`**

### 2. Database Management
Mr. Mfundo can manage the database directly from the Cloudflare Dashboard:
1.  **Login**: [Cloudflare Dashboard](https://dash.cloudflare.com/)
2.  **Navigate**: Workers & Pages > D1 > `student-wellness-db`.
3.  **Features**: View tables, export/import CSV/SQL, and query data directly in the browser.

### 3. Updating the API
To push updates, use the following commands in this directory:
```bash
# Push latest code to live
npm run deploy
```

## 📋 API Documentation

Interactive Swagger documentation is available at:
`https://student-support-api.kimnanuseb.workers.dev/api-docs`

## 📡 Core API Endpoints (Base: `/api`)

### 🔑 Authentication
- `POST /auth/login` - Admin/Coordinator login
- `POST /students/auth/login` - Student login

### 🎓 Student Management
- `GET /students` - Get all students (with filters)
- `GET /students/:id` - Get student details
- `GET /students/risk/:level` - Filter by risk level
- `PUT /students/:id/risk` - Update student risk level

### 🎫 Support Requests
- `GET /support-requests` - Get all requests
- `POST /support-requests` - Create a new request
- `PUT /support-requests/:id/assign` - Assign to a partner
- `PUT /support-requests/:id/status` - Update request status

### 🤝 Partner Management
- `GET /partners` - Get all partners
- `GET /partners/available` - Filter by availability
- `GET /partners/workload` - Workload stats

### 💬 Messaging
- `GET /messages/conversations` - Get conversation list
- `GET /messages/thread/:id` - Get chat history
- `POST /messages/send` - Send a message

## 🔒 Security

- **CORS**: Pre-configured for the Genius Up Netlify frontend.
- **JWT**: Secure token-based authentication.
- **DDoS/WAF**: Built-in Cloudflare network security.

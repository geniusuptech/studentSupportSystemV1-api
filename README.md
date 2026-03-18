# Student Wellness Dashboard API

A production-ready, high-performance REST API for the Student Wellness Dashboard, built with Hono, TypeScript, and Microsoft SQL Server, optimized for Cloudflare Workers.

## 📋 Overview

This API is designed to handle student wellness data with a focus on speed, reliability, and security.

- **Frontend**: Hosted on Netlify.
- **Backend API**: Hosted on Cloudflare Workers.
- **Database**: Microsoft SQL Server (Managed by Mfundo).

## 🏗️ Architecture

- **Framework**: [Hono](https://hono.dev/) (Ultra-fast web framework)
- **Runtime**: [Cloudflare Workers](https://workers.cloudflare.com/) with `nodejs_compat`
- **Database**: Microsoft SQL Server (MSSQL via `mssql` package)
- **Language**: TypeScript
- **Documentation**: Swagger UI (OpenAPI 3.0)

## 🚀 Deployment (Cloudflare Workers)

### 1. Configure Environment Variables
Mfundo manages the SQL Server. You need to configure the connection in Cloudflare:

```bash
# Set sensitive credentials as secrets
npx wrangler secret put DB_USER
npx wrangler secret put DB_PASSWORD
```

Non-sensitive variables can be set in `wrangler.toml`:
- `DB_SERVER`: The SQL Server address.
- `DB_NAME`: The database name.
- `DB_PORT`: Default is 1433.

### 2. Deploy to Production
```bash
npm run deploy
```

## 📋 API Documentation

Interactive documentation is available at:
`https://your-worker.workers.dev/api-docs`

## 📡 API Endpoints (Base: `/api`)

### Auth
- `POST /auth/login` - Admin/Coordinator login
- `POST /students/auth/login` - Student login

### Students
- `GET /students` - Get all students
- `GET /students/:id` - Get student details
- `GET /students/risk/:level` - Filter by risk level

### Messaging
- `GET /messages/conversations` - Get conversation list
- `GET /messages/thread/:id` - Get chat history
- `POST /messages/send` - Send a message

### Partners & Support
- `GET /partners` - Get all support partners
- `GET /support-requests` - Get academic/wellness requests

## 🔒 Security

- **CORS**: Configured for cross-origin access (Netlify frontend).
- **Auth**: JWT-based authentication.
- **Edge Protection**: Powered by Cloudflare DDoS & WAF.

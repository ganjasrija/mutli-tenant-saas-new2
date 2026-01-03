# System Architecture Document

---

## 1. High-Level System Architecture

The Multi-Tenant SaaS Platform follows a three-tier architecture consisting of:

- Client (Web Browser)
- Frontend Application (React)
- Backend API Server (Node.js + Express)
- Database (PostgreSQL)

### Architecture Flow
1. Users access the system through a web browser.
2. The browser communicates with the React frontend.
3. Frontend sends API requests to the backend server.
4. Backend validates authentication and authorization using JWT.
5. Backend interacts with PostgreSQL database.
6. Responses are sent back to the frontend.

This separation ensures scalability, maintainability, and security.

---

## 2. Authentication & Authorization Flow

1. User submits login credentials.
2. Backend verifies credentials and tenant status.
3. JWT token is generated with userId, tenantId, and role.
4. Token is sent to frontend.
5. Frontend includes JWT in Authorization header for protected APIs.
6. Backend middleware validates token and enforces RBAC.

---

## 3. Multi-Tenant Data Isolation Strategy

- All tenant-specific tables include a tenant_id column.
- Tenant ID is extracted from JWT token.
- Queries are automatically filtered using tenant_id.
- Super admins bypass tenant filtering.

This guarantees complete data isolation.

---

## 4. API Architecture Overview

### Authentication APIs
- POST /api/auth/register-tenant
- POST /api/auth/login
- GET /api/auth/me
- POST /api/auth/logout

### Tenant APIs
- GET /api/tenants/:tenantId
- PUT /api/tenants/:tenantId
- GET /api/tenants

### User APIs
- POST /api/tenants/:tenantId/users
- GET /api/tenants/:tenantId/users
- PUT /api/users/:userId
- DELETE /api/users/:userId

### Project APIs
- POST /api/projects
- GET /api/projects
- PUT /api/projects/:projectId
- DELETE /api/projects/:projectId

### Task APIs
- POST /api/projects/:projectId/tasks
- GET /api/projects/:projectId/tasks
- PATCH /api/tasks/:taskId/status
- PUT /api/tasks/:taskId

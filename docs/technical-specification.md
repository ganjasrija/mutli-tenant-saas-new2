# Technical Specification Document

---

## 1. Backend Architecture Overview

The backend follows a layered architecture to ensure separation of concerns.

### Layers:
- Routes Layer
- Controllers Layer
- Services Layer
- Repositories Layer
- Middleware Layer
- Utils Layer

---

## 2. Folder Structure

backend/
├── src/
│ ├── config/
│ │ ├── database.js
│ │ └── env.js
│ ├── routes/
│ │ ├── auth.routes.js
│ │ ├── tenant.routes.js
│ │ ├── user.routes.js
│ │ ├── project.routes.js
│ │ └── task.routes.js
│ ├── controllers/
│ ├── services/
│ ├── repositories/
│ ├── middlewares/
│ │ ├── auth.middleware.js
│ │ ├── tenant.middleware.js
│ │ └── rbac.middleware.js
│ ├── utils/
│ ├── app.js
│ └── server.js
└── package.json

---

## 3. Middleware Responsibilities

### Authentication Middleware
- Validates JWT token
- Extracts userId, tenantId, role

### Tenant Middleware
- Enforces tenant isolation
- Injects tenantId into request context

### RBAC Middleware
- Verifies user permissions per role
- Blocks unauthorized access

---

## 4. Naming Conventions

- Files: kebab-case
- Classes: PascalCase
- Functions: camelCase
- Database tables: snake_case
- API endpoints: RESTful naming

---

## 5. Error Handling Strategy

- Centralized error handler
- Standard HTTP status codes
- Meaningful error messages

---
---

## 6. Frontend Architecture Overview

The frontend is built using React with a component-based architecture.

### Core Principles:
- Separation of UI and business logic
- Reusable components
- Centralized state using Context API
- Responsive design using CSS/Tailwind

---

## 7. Frontend Folder Structure

frontend/
├── src/
│ ├── components/
│ │ ├── common/
│ │ ├── layout/
│ │ └── ui/
│ ├── pages/
│ │ ├── Login.jsx
│ │ ├── Dashboard.jsx
│ │ ├── Projects.jsx
│ │ └── Tasks.jsx
│ ├── contexts/
│ │ ├── AuthContext.jsx
│ │ ├── TenantContext.jsx
│ │ └── ProjectContext.jsx
│ ├── hooks/
│ ├── services/
│ │ └── api.js
│ ├── routes/
│ │ └── ProtectedRoute.jsx
│ ├── utils/
│ ├── App.jsx
│ └── main.jsx
└── package.json

---

## 8. Frontend Responsibilities

### Authentication Handling
- Store JWT securely
- Protect private routes
- Auto logout on token expiry

### State Management
- Use React Context API
- Custom hooks for accessing context
- Avoid prop drilling

### API Communication
- Centralized API service
- Attach JWT in request headers
- Handle API errors globally

---


## Conclusion

This technical specification ensures consistency, scalability, and maintainability throughout development.

# Research Document – Multi-Tenant SaaS Platform

## 1. Multi-Tenancy Analysis

Multi-tenancy is a software architecture where a single application instance serves multiple organizations (tenants) while keeping their data isolated and secure. Choosing the correct multi-tenancy strategy is critical for scalability, security, and maintainability.

### 1.1 Multi-Tenancy Approaches Comparison

| Approach | Description | Pros | Cons |
|--------|-------------|------|------|
| Shared Database + Shared Schema | All tenants share the same database and tables, distinguished by tenant_id | Simple to implement, cost-effective, easy maintenance | Risk of data leakage if tenant filtering fails, complex query enforcement |
| Shared Database + Separate Schema | Single database but separate schema per tenant | Better isolation, moderate scalability | Schema management complexity, harder migrations |
| Separate Database per Tenant | Each tenant has its own database | Strongest isolation, high security | High operational cost, difficult to scale |

### 1.2 Chosen Approach: Shared Database + Shared Schema

This project uses a **shared database with a shared schema** and enforces isolation using a `tenant_id` column in all tenant-specific tables.

#### Justification:
- Cost-effective and scalable for SaaS platforms
- Easier database management compared to multiple schemas/databases
- Works well with proper middleware-based tenant isolation
- Industry-proven approach (used by many SaaS platforms)

Strict API-level enforcement and middleware-based filtering ensure that tenant data cannot be accessed across organizations.

---

## 2. Technology Stack Justification

### Backend Framework – Node.js with Express.js
Node.js is chosen for its non-blocking I/O model and high scalability. Express.js provides a lightweight and flexible framework for building RESTful APIs.

**Alternatives Considered:** Django, Spring Boot  
**Reason for Rejection:** Heavier frameworks with slower iteration speed

### Frontend Framework – React
React enables component-based architecture, state management, and high UI responsiveness.

**Alternatives Considered:** Angular, Vue  
**Reason for Rejection:** Angular is complex; Vue has a smaller ecosystem

### Database – PostgreSQL
PostgreSQL offers strong relational integrity, indexing, transactions, and JSON support.

**Alternatives Considered:** MySQL, MongoDB  
**Reason for Rejection:** MongoDB lacks relational constraints required for RBAC and auditing

### Authentication – JWT (JSON Web Tokens)
JWT enables stateless authentication, improves scalability, and works well with microservices.

**Alternatives Considered:** Session-based auth  
**Reason for Rejection:** Sessions require server-side storage and reduce scalability

### Containerization – Docker & Docker Compose
Docker ensures consistent environments across development and deployment.

**Alternatives Considered:** Manual setup  
**Reason for Rejection:** Error-prone and not production-ready

---

## 3. Security Considerations

### 3.1 Data Isolation
- Every tenant-specific table includes a `tenant_id`
- Middleware enforces tenant filtering for all API queries
- Client-provided tenant_id is never trusted

### 3.2 Authentication & Authorization
- JWT tokens include userId, tenantId, and role
- Role-Based Access Control (RBAC) enforced at API level
- Super admins are handled separately with tenant_id = NULL

### 3.3 Password Security
- Passwords are hashed using bcrypt
- Plain-text passwords are never stored
- Minimum password length enforced

### 3.4 API Security
- Input validation using middleware
- Proper HTTP status codes
- Centralized error handling

### 3.5 Audit Logging
- All critical actions are logged
- Enables traceability and security audits

---

## Conclusion

This architecture balances scalability, security, and maintainability. By using shared schema multi-tenancy with strict isolation, JWT-based authentication, and Dockerized deployment, the system meets enterprise-grade SaaS requirements.

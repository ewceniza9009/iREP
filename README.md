# iREP - Comprehensive Real Estate Management Platform

## Core Requirements

### 1. Architecture Alignment
- **Multi-tenant Design**: Implement a `tenant_id` discriminator pattern for strict data isolation across all services and databases, enforced via database-level mechanisms (e.g., PostgreSQL RLS) and application logic.
- **Microservices Architecture**: Use NestJS (TypeScript) for backend services, ensuring modularity and independent scalability.
- **Real-time Capabilities**: Leverage ASP.NET Core SignalR for live updates (e.g., Gantt charts, notifications) with Redis-backed pub/sub for scalability.
- **JWT Authentication**: Implement JWT-based authentication with tenant-scoped tokens, refresh/revocation mechanisms, and secure storage in Redis. Tokens must include `tenant_id` and `roles` claims.
- **Role-Based Authorization (RBAC)**: Enforce dynamic, tenant-scoped roles (e.g., admin, project_manager, tenant) using CASL, applied to all GraphQL resolvers, REST endpoints, SignalR hubs, and frontend UI components.
- **GraphQL API Gateway**: Use Apollo Federation for schema stitching across services, with authentication and authorization guards on all resolvers.
- **Databases**:
  - **PostgreSQL** with PostGIS for relational data and geospatial queries.
  - **MongoDB** for flexible document storage (e.g., audit logs, virtual tours, search embeddings).
  - **Redis** for caching, pub/sub messaging, job queues, and token blacklisting.
- **Frontend**: Build a React PWA using **TypeScript**, **Tailwind CSS** for responsive styling, and **Vite** for fast development and optimized production builds. Integrate Apollo Client for GraphQL, supporting offline functionality and mobile-first design.
- **Configuration Management**: Store all sensitive data (e.g., JWT secrets, database credentials, API keys) in `.env` files, with `.env.example` for reference. Support `dev` and `prod` environments.

### 2. Required Services & Components

#### Backend Services (NestJS, TypeScript)
1. **API Gateway Service** (Port 4040)
   - Apollo Federation gateway for federated GraphQL queries.
   - JWT authentication middleware using `@nestjs/jwt` and `passport-jwt`.
   - RBAC enforcement with CASL for all routed requests.
   - Rate limiting (`@nestjs/throttler`) and request throttling.
   - Health check endpoint (`/health`).
   - Logging with Winston, integrated with ELK stack for production.

2. **Listings Service** (Port 4001)
   - CRUD for property listings with geospatial search (PostGIS).
   - Management of 3D/AR virtual tours stored in MongoDB.
   - Advanced search with filters (e.g., price, location, bedrooms).
   - Marketplace features (e.g., public listings, favorites).
   - JWT and RBAC guards on all endpoints (e.g., only admins create listings).

3. **Projects Service** (Port 4002)
   - Gantt chart and Kanban board data handling for project management.
   - Task tracking, resource allocation, and scheduling.
   - Budget forecasting with real-time updates via SignalR.
   - RBAC: Project managers can edit tasks; users can view assigned tasks.

4. **Accounting Service** (Port 4003)
   - Double-entry accounting ledger with multi-currency support.
   - Integration with Stripe for payment processing (via webhooks).
   - Financial reporting (e.g., balance sheets, income statements).
   - RBAC: Only accountants and admins access financial data.

5. **Tenants Service** (Port 4004)
   - Lease agreement management and rent payment tracking.
   - Tenant screening (background checks) and maintenance requests.
   - RBAC: Tenants can submit requests; admins approve leases.

6. **Real-time Gateway** (ASP.NET Core SignalR, Port 5010)
   - WebSocket-based bidirectional communication for real-time updates.
   - Event broadcasting (e.g., task updates, notifications) using Redis pub/sub.
   - JWT authentication for WebSocket connections; RBAC for hub methods.
   - Heartbeat mechanism for connection reliability.

#### Frontend Application
- **React PWA** (Port 3010)
  - Built with **TypeScript** for type safety.
  - Styled using **Tailwind CSS** for responsive, utility-first design.
  - Use **Vite** for fast development server, hot module replacement (HMR), and optimized production builds.
  - Real-time dashboard with Gantt charts, Kanban boards, and property listings.
  - Mobile-first, responsive design with offline support via PWA features (service workers, manifest).
  - Apollo Client for GraphQL queries/mutations with JWT token management.
  - Context API or Redux for state management, including auth state (JWT and roles).
  - RBAC: Conditionally render UI components based on user roles (e.g., hide admin features for non-admins).

#### Infrastructure Services
- **PostgreSQL** (Port 5432): With PostGIS for geospatial queries.
- **MongoDB** (Port 27017): For audit logs, tours, and embeddings.
- **Redis** (Port 6379): For caching, queues, and pub/sub.

### 3. Specific Implementation Requirements

#### Authentication System
- **JWT Authentication**:
  - Use `@nestjs/jwt` for token generation/verification.
  - Include `tenant_id`, `user_id`, and `roles` in token payload.
  - Store refresh tokens in Redis with expiration (e.g., 7 days).
  - Implement token revocation (blacklist in Redis).
  - Secure endpoints with `@nestjs/passport` guards.
  - Configure JWT secrets via `.env` (`JWT_SECRET`, `JWT_EXPIRATION`, `JWT_REFRESH_EXPIRATION`).
- **RBAC**:
  - Use CASL for fine-grained permission checks (e.g., `can('update', 'Property')`).
  - Store roles in `users` table (JSONB) and validate in all services and frontend.
  - Example roles: `admin` (full access), `project_manager` (project/task edits), `tenant` (view leases, submit requests).
  - Enforce RBAC in GraphQL resolvers, REST endpoints, SignalR hubs, and frontend component rendering.

#### Database Design
- **PostgreSQL**:
  - Use Row-Level Security (RLS) with `tenant_id` for data isolation.
  - Include `tenant_id` in all tenant-scoped tables.
  - Optimize with indexes (e.g., GIST for geospatial, B-tree for IDs).
  - Use TypeORM or Flyway for migrations; include seed scripts.
  - Enable PostGIS for location-based queries.
- **MongoDB**:
  - Collections for audit logs, virtual tours, search embeddings, notifications.
  - Indexes for performance (e.g., `{ tenantId: 1, timestamp: -1 }`).
- **Redis**:
  - Cache frequently accessed data (e.g., property details, user profiles).
  - Pub/sub channels for real-time events (e.g., `tenant:{tenantId}:updates`).
  - Job queues (e.g., BullMQ for rent reminders, search indexing).
  - Store blacklisted JWTs and refresh tokens.

#### Real-time Features
- Use SignalR for live updates (e.g., task progress, payment confirmations).
- Redis pub/sub for scalable event broadcasting.
- Implement WebSocket heartbeats to maintain connections.
- Secure SignalR hubs with JWT and RBAC (e.g., only project managers receive task updates).

#### Development Tools
- **Single-command Deployment**: Use `docker-compose up` for production; `npm run dev` for local development with hot reloading (leveraging Vite HMR for frontend).
- **Environment Configurations**:
  - `.env.dev` and `.env.prod` for environment-specific settings.
  - `.env.example` with all required variables (e.g., `POSTGRES_PASSWORD`, `STRIPE_SECRET_KEY`, `VITE_API_URL`).
- **CLI Script**: `scripts/dev.sh` to start all services locally with Vite dev server.
- **Logging**: Use Winston for structured logging; integrate ELK stack in production.

## Deliverables Required

### 1. Project Structure
```
iREP/
├── services/
│   ├── api-gateway/ (Apollo Federation, JWT, RBAC)
│   ├── listings-service/ (Properties, geospatial search)
│   ├── projects-service/ (Gantt, Kanban, tasks)
│   ├── accounting-service/ (Ledger, Stripe integration)
│   ├── tenants-service/ (Leases, maintenance requests)
│   └── realtime-gateway/ (SignalR, Redis pub/sub)
├── frontend/ (React PWA, TypeScript, Tailwind CSS, Vite)
│   ├── src/
│   │   ├── App.tsx
│   │   ├── index.tsx
│   │   ├── components/
│   │   ├── apollo-client.ts
│   │   ├── auth-context.ts
│   │   └── serviceWorker.ts
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── package.json
│   ├── tsconfig.json
│   └── index.html
├── infrastructure/
│   ├── postgres/ (Schema, RLS, seed data)
│   ├── mongodb/ (Collections, indexes)
│   └── redis/ (Cache, queues, pub/sub)
├── docker-compose.yml
├── .env.example
├── .env.dev
├── .env.prod
├── package.json (root scripts)
└── scripts/
    └── dev.sh
```

### 2. Complete File Implementation
- **Dockerfile** for each service and infrastructure component.
- **package.json** (root and per-service) with dependencies (e.g., `@nestjs/*`, `apollo-server`, `react`, `tailwindcss`, `vite`).
- **Environment Files**:
  - `.env.example`: Template with all variables (e.g., `VITE_API_URL=http://localhost:4040/graphql`).
  - `.env.dev` and `.env.prod`: Environment-specific configs.
- **Database Scripts**:
  - PostgreSQL: Schema, RLS policies, seed data (from prompt).
  - MongoDB: Collection setup, indexes (from prompt).
- **GraphQL Schemas**:
  - Federated schemas for each service (e.g., `type Property @key(fields: "id") { id: ID!, tenantId: ID!, title: String! }`).
- **Authentication Middleware**:
  - JWT validation with `passport-jwt`.
  - RBAC with CASL for all resolvers/endpoints.
- **SignalR Hubs**:
  - Real-time event handlers (e.g., `onTaskUpdate`, `onNotification`).
  - JWT authentication for hub connections.
- **Frontend**:
  - React components (TypeScript) for dashboard, listings, login.
  - Styled with **Tailwind CSS** (e.g., `className="flex flex-col md:grid md:grid-cols-2 gap-4"`).
  - Built with **Vite** (configure in `vite.config.ts` for PWA and TypeScript).
  - Apollo Client with JWT token refresh.
  - RBAC-driven UI rendering (e.g., hide admin features for non-admins).

### 3. Database Setup
- **PostgreSQL**: Full schema (from prompt) with RLS, PostGIS, indexes, seed data.
- **MongoDB**: Collections for audits, tours, embeddings, notifications (from prompt).
- **Redis**: Configured for caching, pub/sub, queues, token blacklisting (from prompt).
- **Seed Data**: Pre-populate with demo tenants, users, properties, etc.

### 4. Development Workflow
- **Docker Compose**: Orchestrate all services with health checks.
- **Environment Switching**: Conditional builds for `dev` (Vite HMR, hot-reload) and `prod` (optimized Vite build).
- **CLI Script**: `npm run dev` runs `scripts/dev.sh` to start all services and Vite dev server.
- **Health Checks**: `/health` endpoints for each service.
- **Logging**: Winston for structured logs; ELK integration for production.

### 5. Key Features Implementation
- **JWT Authentication**:
  - Login endpoint (`/auth/login`) returns access/refresh tokens.
  - Refresh endpoint (`/auth/refresh`) uses Redis-stored refresh tokens.
  - Logout revokes tokens (blacklist in Redis).
- **RBAC**:
  - Enforce permissions with CASL (e.g., `admin` creates organizations, `tenant` views leases).
  - Frontend: Conditionally render components based on roles (e.g., `roles.includes('admin') && <AdminPanel />`).
- **Multi-tenant Isolation**:
  - RLS policies in PostgreSQL (`tenant_id = get_current_tenant_id()`).
  - Query scopes in services (e.g., `where tenant_id = :tenantId`).
- **Real-time Updates**:
  - SignalR for Gantt chart updates, notifications.
  - Redis pub/sub for scalability (e.g., `tenant:{tenantId}:updates`).
- **Property Search**:
  - Filters (price, location, type) with PostGIS geospatial queries.
  - Cache results in Redis for performance.
- **Payment Processing**:
  - Stripe webhooks for rent payments, secured with `STRIPE_WEBHOOK_SECRET`.
  - RBAC: Only accountants/admins view payment data.
- **File Uploads**:
  - Support images/documents/tours (S3 or local storage).
  - Validate uploads with size/type restrictions.

## Technical Specifications

### Technology Stack
- **Backend**: NestJS (Node.js/TypeScript).
- **Frontend**: React 18+ (TypeScript), **Tailwind CSS**, **Vite**, Apollo Client.
- **Real-time**: ASP.NET Core SignalR.
- **Databases**: PostgreSQL (PostGIS), MongoDB, Redis.
- **API**: GraphQL (Apollo Federation).
- **Authentication**: JWT with `@nestjs/jwt`, `passport-jwt`.
- **Authorization**: CASL for RBAC.
- **Containerization**: Docker, Docker Compose.
- **Package Manager**: npm.

### Performance Targets
- API response time: <200ms (p95).
- Real-time latency: <250ms end-to-end.
- WebSocket connections: Support 10,000+ concurrent users.
- Database queries: Optimized with indexes, caching, query plans.
- Frontend build time: <5s with Vite (dev), <20s (prod).

### Security Requirements
- **Multi-tenant Isolation**: Enforced via RLS, query scopes, and JWT `tenant_id` claims.
- **JWT Security**:
  - Validate signatures with secret from `.env`.
  - Blacklist revoked tokens in Redis.
- **Input Validation**: Use `class-validator` for DTOs to prevent injections.
- **Rate Limiting**: Apply `@nestjs/throttler` on API endpoints.
- **CORS**: Restrict to frontend origin (configured in `.env`, e.g., `VITE_FRONTEND_URL`).
- **Secrets Management**: All credentials in `.env` (e.g., `POSTGRES_PASSWORD`, `STRIPE_SECRET_KEY`, `VITE_API_URL`).
- **HTTPS**: Enforce in production (configure via reverse proxy).

## Deployment Instructions
1. **Initial Setup**:
   - Clone repository: `git clone <repo_url>`.
   - Install dependencies: `npm install` (root and frontend directories).
2. **Environment Configuration**:
   - Copy `.env.example` to `.env.dev` or `.env.prod`.
   - Fill in values (e.g., `JWT_SECRET`, `POSTGRES_PASSWORD`, `VITE_API_URL`).
3. **Database Initialization**:
   - Run `docker-compose up postgres mongo` to initialize databases.
   - Execute migration scripts (TypeORM/Flyway) and seed data.
4. **Start Services**:
   - Production: `docker-compose up -d` (uses Vite production build).
   - Development: `npm run dev` (runs `scripts/dev.sh` with Vite dev server and HMR).
5. **Access Application**:
   - Frontend: `http://localhost:3010`.
   - GraphQL API: `http://localhost:4040/graphql`.
6. **Test Real-time Features**:
   - Simulate events (e.g., task update, payment) via frontend.
   - Verify live updates in dashboard (e.g., Gantt chart refresh).

## Complete Database Structure & Schema
(Use the original schema from the prompt, as it’s comprehensive and correct.)

### Additional Notes
- **PostgreSQL**: Ensure RLS policies use `get_current_tenant_id()` (set via JWT `tenant_id` claim).
- **MongoDB**: Validate `tenantId` in queries for isolation.
- **Redis**: Use prefix-based keys (e.g., `cache:tenant:{tenantId}:...`) for tenant isolation.
- **Frontend**:
  - Configure Tailwind CSS in `tailwind.config.js` for custom themes (e.g., brand colors).
  - Use Vite plugins (e.g., `@vitejs/plugin-react`, `vite-plugin-pwa`) for React and PWA support.
  - Ensure TypeScript strict mode in `tsconfig.json`.

## Success Criteria
The deliverable must:
1. Start all services with `docker-compose up` (prod) or `npm run dev` (dev, with Vite HMR).
2. Enforce multi-tenant isolation via RLS, query scopes, and JWT claims.
3. Demonstrate real-time updates (e.g., Gantt charts, notifications) via SignalR.
4. Secure all endpoints/hubs with JWT authentication and RBAC (CASL).
5. Support core features: property listings, project management, tenant management.
6. Include complete database setup with seed data, indexes, and extensions.
7. Be production-ready with:
   - Structured logging (Winston, ELK).
   - Error handling (global exception filters).
   - Security best practices (input validation, rate limiting, CORS).
8. Store all sensitive configurations in `.env` files, with `.env.example` for guidance.
9. Use **TypeScript**, **Tailwind CSS**, and **Vite** for the frontend, ensuring type-safe, responsive, and optimized builds.

---

### Improvements Made
1. **Frontend Technology**:
   - Explicitly specified **TypeScript**, **Tailwind CSS**, and **Vite** for the React PWA.
   - Added Tailwind configuration (`tailwind.config.js`) and Vite setup (`vite.config.ts`) for fast builds and HMR.
   - Included TypeScript strict mode and PWA plugins for frontend robustness.
2. **Previous Enhancements Retained**:
   - JWT authentication with tenant-scoped tokens and Redis blacklisting.
   - RBAC with CASL across services and frontend (UI rendering based on roles).
   - `.env` for all secrets, with `.env.example`, `.env.dev`, `.env.prod`.
   - Security (input validation, rate limiting, CORS, HTTPS).
   - Scalability (Redis pub/sub, 10,000+ WebSocket connections).
3. **Developer Experience**:
   - Clarified Vite’s role in dev (HMR) and prod (optimized builds).
   - Added `VITE_API_URL` and `VITE_FRONTEND_URL` to `.env` for frontend config.
4. **Clarity and Specificity**:
   - Structured frontend requirements to highlight Tailwind CSS and Vite integration.
   - Ensured RBAC applies to frontend component rendering.

## Complete Database Structure & Schema

### PostgreSQL Database Schema
Assume the database requires extensions for UUID and geospatial support. Include these at the top:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;
```

#### Core Multi-Tenant Tables

```sql
-- =============================================
-- iREP PostgreSQL Database Schema with Seed Data
-- =============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- =============================================
-- CORE TENANT & USER MANAGEMENT
-- =============================================

-- Organizations (Tenants)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(100) UNIQUE,
    billing_status VARCHAR(20) NOT NULL DEFAULT 'active',
    subscription_plan VARCHAR(50) NOT NULL DEFAULT 'basic',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    settings JSONB
);

CREATE INDEX ix_organizations_billing_status ON organizations (billing_status);
CREATE INDEX ix_organizations_domain ON organizations (domain);

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    roles JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    FOREIGN KEY (tenant_id) REFERENCES organizations(id) ON DELETE CASCADE,
    UNIQUE (tenant_id, email)
);

CREATE INDEX ix_users_tenant_id ON users (tenant_id);
CREATE INDEX ix_users_email ON users (email);

-- =============================================
-- PROPERTY & LISTINGS MANAGEMENT
-- =============================================

-- Properties
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    property_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'available',
    price NUMERIC(19,4),
    currency VARCHAR(3) DEFAULT 'USD',
    bedrooms INT,
    bathrooms NUMERIC(3,1),
    square_feet NUMERIC(10,2),
    lot_size NUMERIC(10,2),
    year_built INT,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'USA',
    latitude NUMERIC(10,8),
    longitude NUMERIC(11,8),
    location GEOGRAPHY(POINT, 4326),
    images JSONB,
    documents JSONB,
    features JSONB,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    FOREIGN KEY (tenant_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX ix_properties_tenant_id ON properties (tenant_id);
CREATE INDEX ix_properties_status ON properties (status);
CREATE INDEX ix_properties_property_type ON properties (property_type);
CREATE INDEX ix_properties_price ON properties (price);
CREATE INDEX ix_properties_location ON properties USING GIST (location);

-- Property Tours (3D/AR)
CREATE TABLE property_tours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    property_id UUID NOT NULL,
    tour_type VARCHAR(20) NOT NULL,
    tour_url VARCHAR(500),
    thumbnail_url VARCHAR(500),
    metadata JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    FOREIGN KEY (tenant_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

CREATE INDEX ix_property_tours_tenant_id ON property_tours (tenant_id);
CREATE INDEX ix_property_tours_property_id ON property_tours (property_id);

-- =============================================
-- PROJECT MANAGEMENT
-- =============================================

-- Projects
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    property_id UUID,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'planning',
    start_date DATE,
    end_date DATE,
    budget NUMERIC(19,4),
    currency VARCHAR(3) DEFAULT 'USD',
    project_manager_id UUID,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    FOREIGN KEY (tenant_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id),
    FOREIGN KEY (project_manager_id) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX ix_projects_tenant_id ON projects (tenant_id);
CREATE INDEX ix_projects_status ON projects (status);
CREATE INDEX ix_projects_property_id ON projects (property_id);

-- Project Tasks (Gantt Chart & Kanban)
CREATE TABLE project_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    project_id UUID NOT NULL,
    parent_id UUID,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'todo',
    priority VARCHAR(10) DEFAULT 'medium',
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    estimated_hours NUMERIC(8,2),
    actual_hours NUMERIC(8,2),
    progress NUMERIC(5,2) DEFAULT 0,
    assigned_to UUID,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    FOREIGN KEY (tenant_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES project_tasks(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX ix_project_tasks_tenant_id ON project_tasks (tenant_id);
CREATE INDEX ix_project_tasks_project_id ON project_tasks (project_id);
CREATE INDEX ix_project_tasks_status ON project_tasks (status);
CREATE INDEX ix_project_tasks_assigned_to ON project_tasks (assigned_to);

-- Resources (Materials, Labor, Equipment)
CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    unit_cost NUMERIC(19,4),
    currency VARCHAR(3) DEFAULT 'USD',
    unit_measure VARCHAR(20),
    supplier VARCHAR(255),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    FOREIGN KEY (tenant_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE INDEX ix_resources_tenant_id ON resources (tenant_id);
CREATE INDEX ix_resources_type ON resources (resource_type);

-- Task Resource Allocation
CREATE TABLE task_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    task_id UUID NOT NULL,
    resource_id UUID NOT NULL,
    quantity NUMERIC(10,2) NOT NULL,
    allocated_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    notes TEXT,
    FOREIGN KEY (tenant_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES project_tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (resource_id) REFERENCES resources(id)
);

CREATE INDEX ix_task_resources_tenant_id ON task_resources (tenant_id);
CREATE INDEX ix_task_resources_task_id ON task_resources (task_id);

-- =============================================
-- ACCOUNTING & FINANCIAL MANAGEMENT
-- =============================================

-- Chart of Accounts
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    account_code VARCHAR(20) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_type VARCHAR(20) NOT NULL,
    parent_account_id UUID,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    FOREIGN KEY (tenant_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_account_id) REFERENCES accounts(id),
    UNIQUE (tenant_id, account_code)
);

CREATE INDEX ix_accounts_tenant_id ON accounts (tenant_id);
CREATE INDEX ix_accounts_type ON accounts (account_type);

-- Double-Entry Transactions
CREATE TABLE transactions (
    id BIGSERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL,
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW() AT TIME ZONE 'UTC',
    reference_number VARCHAR(50),
    description VARCHAR(255) NOT NULL,
    total_amount NUMERIC(19,4) NOT NULL CHECK (total_amount > 0),
    currency VARCHAR(3) DEFAULT 'USD',
    project_id UUID,
    property_id UUID,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    FOREIGN KEY (tenant_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (property_id) REFERENCES properties(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX ix_transactions_tenant_id ON transactions (tenant_id);
CREATE INDEX ix_transactions_date ON transactions (transaction_date);

-- Transaction Lines (Double-Entry)
CREATE TABLE transaction_lines (
    id BIGSERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL,
    transaction_id BIGINT NOT NULL,
    account_id UUID NOT NULL,
    debit_amount NUMERIC(19,4) DEFAULT 0,
    credit_amount NUMERIC(19,4) DEFAULT 0,
    description VARCHAR(255),
    FOREIGN KEY (tenant_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES accounts(id),
    CHECK ((debit_amount > 0 AND credit_amount = 0) OR (credit_amount > 0 AND debit_amount = 0))
);

CREATE INDEX ix_transaction_lines_tenant_id ON transaction_lines (tenant_id);
CREATE INDEX ix_transaction_lines_transaction_id ON transaction_lines (transaction_id);

-- =============================================
-- TENANT & LEASE MANAGEMENT
-- =============================================

-- Tenants (Property Renters)
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    ssn_last_four VARCHAR(4),
    credit_score INT,
    income NUMERIC(19,4),
    employment_status VARCHAR(50),
    screening_status VARCHAR(20) DEFAULT 'pending',
    screening_score NUMERIC(5,2),
    emergency_contact JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    FOREIGN KEY (tenant_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE INDEX ix_tenants_tenant_id ON tenants (tenant_id);
CREATE INDEX ix_tenants_email ON tenants (email);
CREATE INDEX ix_tenants_screening_status ON tenants (screening_status);

-- Leases
CREATE TABLE leases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    property_id UUID NOT NULL,
    renter_id UUID NOT NULL,
    lease_start DATE NOT NULL,
    lease_end DATE NOT NULL,
    rent_amount NUMERIC(19,4) NOT NULL,
    security_deposit NUMERIC(19,4),
    currency VARCHAR(3) DEFAULT 'USD',
    payment_due_day INT DEFAULT 1,
    lease_terms TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    FOREIGN KEY (tenant_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id),
    FOREIGN KEY (renter_id) REFERENCES tenants(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX ix_leases_tenant_id ON leases (tenant_id);
CREATE INDEX ix_leases_property_id ON leases (property_id);
CREATE INDEX ix_leases_status ON leases (status);

-- Rent Payments
CREATE TABLE rent_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    lease_id UUID NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    amount NUMERIC(19,4) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_method VARCHAR(20),
    payment_reference VARCHAR(100),
    late_fee NUMERIC(19,4) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending',
    due_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    FOREIGN KEY (tenant_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (lease_id) REFERENCES leases(id)
);

CREATE INDEX ix_rent_payments_tenant_id ON rent_payments (tenant_id);
CREATE INDEX ix_rent_payments_lease_id ON rent_payments (lease_id);
CREATE INDEX ix_rent_payments_status ON rent_payments (status);
CREATE INDEX ix_rent_payments_due_date ON rent_payments (due_date);

-- Maintenance Requests
CREATE TABLE maintenance_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    property_id UUID NOT NULL,
    lease_id UUID,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(10) DEFAULT 'medium',
    category VARCHAR(50),
    status VARCHAR(20) DEFAULT 'open',
    assigned_to UUID,
    requested_by UUID NOT NULL,
    images JSONB,
    estimated_cost NUMERIC(19,4),
    actual_cost NUMERIC(19,4),
    scheduled_date TIMESTAMP WITH TIME ZONE,
    completed_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    FOREIGN KEY (tenant_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id),
    FOREIGN KEY (lease_id) REFERENCES leases(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    FOREIGN KEY (requested_by) REFERENCES tenants(id)
);

CREATE INDEX ix_maintenance_requests_tenant_id ON maintenance_requests (tenant_id);
CREATE INDEX ix_maintenance_requests_status ON maintenance_requests (status);
CREATE INDEX ix_maintenance_requests_priority ON maintenance_requests (priority);

-- Permits
CREATE TABLE permits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    project_id UUID,
    property_id UUID,
    permit_number VARCHAR(100) NOT NULL,
    permit_type VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    application_date DATE,
    approval_date DATE,
    expiration_date DATE,
    issuing_authority VARCHAR(255),
    cost NUMERIC(19,4),
    currency VARCHAR(3) DEFAULT 'USD',
    documents JSONB,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() AT TIME ZONE 'UTC',
    FOREIGN KEY (tenant_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (property_id) REFERENCES properties(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX ix_permits_tenant_id ON permits (tenant_id);
CREATE INDEX ix_permits_status ON permits (status);
CREATE INDEX ix_permits_expiration_date ON permits (expiration_date);

-- =============================================
-- ROW-LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tenant-scoped tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE rent_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE permits ENABLE ROW LEVEL SECURITY;

-- Create function for current tenant_id
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
SELECT NULLIF(current_setting('app.tenant_id', TRUE), '')::UUID;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Apply RLS policies
CREATE POLICY tenant_isolation_policy ON organizations
    USING (id = get_current_tenant_id());
CREATE POLICY tenant_isolation_policy ON users
    USING (tenant_id = get_current_tenant_id());
CREATE POLICY tenant_isolation_policy ON properties
    USING (tenant_id = get_current_tenant_id());
CREATE POLICY tenant_isolation_policy ON property_tours
    USING (tenant_id = get_current_tenant_id());
CREATE POLICY tenant_isolation_policy ON projects
    USING (tenant_id = get_current_tenant_id());
CREATE POLICY tenant_isolation_policy ON project_tasks
    USING (tenant_id = get_current_tenant_id());
CREATE POLICY tenant_isolation_policy ON resources
    USING (tenant_id = get_current_tenant_id());
CREATE POLICY tenant_isolation_policy ON task_resources
    USING (tenant_id = get_current_tenant_id());
CREATE POLICY tenant_isolation_policy ON accounts
    USING (tenant_id = get_current_tenant_id());
CREATE POLICY tenant_isolation_policy ON transactions
    USING (tenant_id = get_current_tenant_id());
CREATE POLICY tenant_isolation_policy ON transaction_lines
    USING (tenant_id = get_current_tenant_id());
CREATE POLICY tenant_isolation_policy ON tenants
    USING (tenant_id = get_current_tenant_id());
CREATE POLICY tenant_isolation_policy ON leases
    USING (tenant_id = get_current_tenant_id());
CREATE POLICY tenant_isolation_policy ON rent_payments
    USING (tenant_id = get_current_tenant_id());
CREATE POLICY tenant_isolation_policy ON maintenance_requests
    USING (tenant_id = get_current_tenant_id());
CREATE POLICY tenant_isolation_policy ON permits
    USING (tenant_id = get_current_tenant_id());

-- Grant necessary permissions to application user (adjust as needed)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'irep_app') THEN
        CREATE ROLE irep_app;
    END IF;
END $$;

GRANT CONNECT ON DATABASE irep TO irep_app;
GRANT USAGE ON SCHEMA public TO irep_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO irep_app;
GRANT EXECUTE ON FUNCTION get_current_tenant_id TO irep_app;

-- =============================================
-- SEED DATA
-- =============================================

-- Organizations
INSERT INTO organizations (id, name, domain, billing_status, subscription_plan, settings)
VALUES
    ('550e8400-e29b-41d4-a716-446655440000', 'Acme Realty', 'acme.realty.com', 'active', 'premium', '{"timezone": "America/New_York"}'),
    ('550e8400-e29b-41d4-a716-446655440001', 'Beta Properties', 'beta.properties.com', 'active', 'basic', '{"timezone": "America/Los_Angeles"}');

-- Users (password_hash is a placeholder; use proper hashing in production)
INSERT INTO users (id, tenant_id, email, password_hash, first_name, last_name, phone, roles, is_active)
VALUES
    ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'admin@acme.realty.com', '$2b$10$examplehash', 'John', 'Doe', '555-0100', '["admin"]', TRUE),
    ('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'manager@acme.realty.com', '$2b$10$examplehash', 'Jane', 'Smith', '555-0101', '["project_manager"]', TRUE),
    ('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'admin@beta.properties.com', '$2b$10$examplehash', 'Alice', 'Brown', '555-0102', '["admin"]', TRUE);

-- Properties
INSERT INTO properties (id, tenant_id, title, description, property_type, status, price, currency, bedrooms, bathrooms, square_feet, lot_size, year_built, address_line1, city, state, zip_code, country, latitude, longitude, location, images, documents, features, created_by)
VALUES
    ('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', 'Downtown Condo', 'Luxurious 2-bedroom condo in the city center', 'residential', 'available', 275000.0000, 'USD', 2, 2.0, 1200.00, 0.00, 2018, '123 Main St', 'San Francisco', 'CA', '94105', 'USA', 37.7749, -122.4194, ST_SetSRID(ST_MakePoint(-122.4194, 37.7749), 4326), '["https://cdn.example.com/images/condo1.jpg"]', '["https://cdn.example.com/docs/condo1.pdf"]', '["pool", "gym"]', '550e8400-e29b-41d4-a716-446655440002'),
    ('550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440001', 'Suburban House', 'Spacious family home with large backyard', 'residential', 'pending', 450000.0000, 'USD', 4, 3.0, 2500.00, 0.25, 2005, '456 Oak Ave', 'Los Angeles', 'CA', '90001', 'USA', 34.0522, -118.2437, ST_SetSRID(ST_MakePoint(-118.2437, 34.0522), 4326), '["https://cdn.example.com/images/house1.jpg"]', '[]', '["garden", "garage"]', '550e8400-e29b-41d4-a716-446655440004');

-- Property Tours
INSERT INTO property_tours (id, tenant_id, property_id, tour_type, tour_url, thumbnail_url, metadata, is_active)
VALUES
    ('550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440005', '3d', 'https://cdn.example.com/tours/condo1_3d', 'https://cdn.example.com/tours/condo1_thumb.jpg', '{"scenes": [{"id": "scene_1", "name": "Living Room"}]}', TRUE);

-- Projects
INSERT INTO projects (id, tenant_id, property_id, name, description, status, start_date, end_date, budget, currency, project_manager_id, created_by)
VALUES
    ('550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440005', 'Condo Renovation', 'Kitchen and bathroom upgrades', 'active', '2025-09-01', '2025-12-31', 50000.0000, 'USD', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002');

-- Project Tasks
INSERT INTO project_tasks (id, tenant_id, project_id, name, description, status, priority, start_date, end_date, estimated_hours, progress, assigned_to, created_by)
VALUES
    ('550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440008', 'Install New Cabinets', 'Install kitchen cabinets', 'todo', 'high', '2025-09-01 09:00:00+00', '2025-09-07 17:00:00+00', 40.00, 0, '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002');

-- Resources
INSERT INTO resources (id, tenant_id, name, resource_type, unit_cost, currency, unit_measure, supplier, description, is_active)
VALUES
    ('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', 'Kitchen Cabinets', 'material', 2000.0000, 'USD', 'pieces', 'Home Depot', 'Premium oak cabinets', TRUE);

-- Task Resources
INSERT INTO task_resources (id, tenant_id, task_id, resource_id, quantity, notes)
VALUES
    ('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440010', 5.00, 'For kitchen remodel');

-- Accounts
INSERT INTO accounts (id, tenant_id, account_code, account_name, account_type, is_active)
VALUES
    ('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440000', '1001', 'Cash', 'asset', TRUE),
    ('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440000', '4001', 'Rental Income', 'revenue', TRUE);

-- Transactions
INSERT INTO transactions (tenant_id, transaction_date, reference_number, description, total_amount, currency, project_id, created_by)
VALUES
    ('550e8400-e29b-41d4-a716-446655440000', '2025-08-01 00:00:00+00', 'TXN001', 'Rent payment received', 2000.0000, 'USD', NULL, '550e8400-e29b-41d4-a716-446655440002');

-- Transaction Lines
INSERT INTO transaction_lines (tenant_id, transaction_id, account_id, debit_amount, credit_amount, description)
VALUES
    ('550e8400-e29b-41d4-a716-446655440000', 1, '550e8400-e29b-41d4-a716-446655440012', 2000.0000, 0, 'Cash debit for rent'),
    ('550e8400-e29b-41d4-a716-446655440000', 1, '550e8400-e29b-41d4-a716-446655440013', 0, 2000.0000, 'Rental income credit');

-- Tenants
INSERT INTO tenants (id, tenant_id, first_name, last_name, email, phone, date_of_birth, ssn_last_four, credit_score, income, employment_status, screening_status, screening_score, emergency_contact)
VALUES
    ('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440000', 'Bob', 'Wilson', 'bob.wilson@example.com', '555-0103', '1990-01-15', '6789', 720, 60000.0000, 'full_time', 'approved', 85.50, '{"name": "Mary Wilson", "phone": "555-0104"}');

-- Leases
INSERT INTO leases (id, tenant_id, property_id, renter_id, lease_start, lease_end, rent_amount, security_deposit, currency, payment_due_day, lease_terms, status, created_by)
VALUES
    ('550e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440014', '2025-07-01', '2026-06-30', 2000.0000, 4000.0000, 'USD', 1, 'Standard 1-year lease', 'active', '550e8400-e29b-41d4-a716-446655440002');

-- Rent Payments
INSERT INTO rent_payments (id, tenant_id, lease_id, payment_date, amount, currency, payment_method, payment_reference, late_fee, status, due_date)
VALUES
    ('550e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440015', '2025-08-01 00:00:00+00', 2000.0000, 'USD', 'credit_card', 'pi_123456789', 0, 'completed', '2025-08-01');

-- Maintenance Requests
INSERT INTO maintenance_requests (id, tenant_id, property_id, lease_id, title, description, priority, category, status, requested_by, images, estimated_cost, created_at)
VALUES
    ('550e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440015', 'Leaky Faucet', 'Kitchen faucet leaking', 'medium', 'plumbing', 'open', '550e8400-e29b-41d4-a716-446655440014', '["https://cdn.example.com/images/leak.jpg"]', 150.0000, '2025-08-20 00:00:00+00');

-- Permits
INSERT INTO permits (id, tenant_id, project_id, property_id, permit_number, permit_type, description, status, application_date, issuing_authority, cost, currency, documents, created_by)
VALUES
    ('550e8400-e29b-41d4-a716-446655440018', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440005', 'PERM001', 'construction', 'Permit for kitchen remodel', 'pending', '2025-08-15', 'City of San Francisco', 500.0000, 'USD', '["https://cdn.example.com/docs/permit.pdf"]', '550e8400-e29b-41d4-a716-446655440002');

-- Ensure RLS policies are enforced
ALTER TABLE organizations FORCE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;
ALTER TABLE properties FORCE ROW LEVEL SECURITY;
ALTER TABLE property_tours FORCE ROW LEVEL SECURITY;
ALTER TABLE projects FORCE ROW LEVEL SECURITY;
ALTER TABLE project_tasks FORCE ROW LEVEL SECURITY;
ALTER TABLE resources FORCE ROW LEVEL SECURITY;
ALTER TABLE task_resources FORCE ROW LEVEL SECURITY;
ALTER TABLE accounts FORCE ROW LEVEL SECURITY;
ALTER TABLE transactions FORCE ROW LEVEL SECURITY;
ALTER TABLE transaction_lines FORCE ROW LEVEL SECURITY;
ALTER TABLE tenants FORCE ROW LEVEL SECURITY;
ALTER TABLE leases FORCE ROW LEVEL SECURITY;
ALTER TABLE rent_payments FORCE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests FORCE ROW LEVEL SECURITY;
ALTER TABLE permits FORCE ROW LEVEL SECURITY;
```

### MongoDB Collections Schema

```javascript
// =============================================
// MONGODB COLLECTIONS
// =============================================

// audit_events collection
{
  "_id": ObjectId("..."),
  "eventId": "evt_...",
  "tenantId": "org_...",
  "userId": "user_...",
  "timestamp": ISODate("2024-01-01T00:00:00.000Z"),
  "action": "property.created", // Event type
  "entity": {
    "type": "Property",
    "id": "prop_...",
    "name": "Downtown Condo"
  },
  "changes": {
    "price": { "old": 250000, "new": 275000 },
    "status": { "old": "available", "new": "pending" }
  },
  "metadata": {
    "clientIp": "192.168.1.100",
    "userAgent": "Mozilla/5.0...",
    "source": "web_app"
  }
}

// Create indexes for audit_events
db.audit_events.createIndex({ "tenantId": 1, "timestamp": -1 })
db.audit_events.createIndex({ "action": 1 })
db.audit_events.createIndex({ "entity.type": 1, "entity.id": 1 })

// property_tours collection (3D/AR tour data)
{
  "_id": ObjectId("..."),
  "tenantId": "org_...",
  "propertyId": "prop_...",
  "tourType": "3d", // "3d", "ar", "virtual"
  "scenes": [
    {
      "id": "scene_1",
      "name": "Living Room",
      "panoramaUrl": "https://cdn.example.com/tours/scene1.jpg",
      "hotspots": [
        {
          "id": "hotspot_1",
          "type": "navigation",
          "position": { "x": 0.5, "y": 0.3 },
          "targetScene": "scene_2",
          "title": "Go to Kitchen"
        },
        {
          "id": "hotspot_2",
          "type": "info",
          "position": { "x": 0.7, "y": 0.6 },
          "content": "Hardwood floors installed in 2023"
        }
      ]
    }
  ],
  "settings": {
    "autoRotate": true,
    "showNavigation": true,
    "allowFullscreen": true,
    "startingScene": "scene_1"
  },
  "analytics": {
    "views": 156,
    "avgViewTime": 180, // seconds
    "popularScenes": ["scene_1", "scene_3"]
  },
  "createdAt": ISODate("2024-01-01T00:00:00.000Z"),
  "updatedAt": ISODate("2024-01-01T00:00:00.000Z")
}

// Create indexes for property_tours
db.property_tours.createIndex({ "tenantId": 1, "propertyId": 1 })
db.property_tours.createIndex({ "tourType": 1 })

// search_embeddings collection (for AI-powered search)
{
  "_id": ObjectId("..."),
  "tenantId": "org_...",
  "entityType": "property", // "property", "project", "tenant"
  "entityId": "prop_...",
  "content": "Luxurious downtown condo with modern amenities...",
  "embedding": [0.1, -0.3, 0.8, ...], // 768-dimensional vector
  "metadata": {
    "propertyType": "residential",
    "bedrooms": 2,
    "price": 275000,
    "location": {
      "city": "San Francisco",
      "state": "CA"
    }
  },
  "createdAt": ISODate("2024-01-01T00:00:00.000Z"),
  "updatedAt": ISODate("2024-01-01T00:00:00.000Z")
}

// Create indexes for search_embeddings
db.search_embeddings.createIndex({ "tenantId": 1, "entityType": 1 })
db.search_embeddings.createIndex({ "entityId": 1 })

// notifications collection
{
  "_id": ObjectId("..."),
  "tenantId": "org_...",
  "userId": "user_...",
  "type": "maintenance_request", // "payment_due", "task_overdue", etc.
  "title": "New Maintenance Request",
  "message": "Plumbing issue reported at 123 Main St",
  "data": {
    "maintenanceRequestId": "maint_...",
    "propertyId": "prop_...",
    "priority": "high"
  },
  "channels": ["email", "push", "in_app"],
  "status": "pending", // "pending", "sent", "failed"
  "scheduledAt": ISODate("2024-01-01T09:00:00.000Z"),
  "sentAt": ISODate("2024-01-01T09:05:00.000Z"),
  "readAt": null,
  "createdAt": ISODate("2024-01-01T09:00:00.000Z")
}

// Create indexes for notifications
db.notifications.createIndex({ "tenantId": 1, "userId": 1, "createdAt": -1 })
db.notifications.createIndex({ "status": 1, "scheduledAt": 1 })
```

### Redis Data Structures

```javascript
// =============================================
// REDIS CACHE & PUB/SUB PATTERNS
// =============================================

// Cache keys pattern
"cache:property:{propertyId}" // Property details cache
"cache:user:{userId}" // User profile cache
"cache:project:{projectId}:tasks" // Project tasks cache
"cache:search:{hash}" // Search results cache

// Pub/Sub channels
"tenant:{tenantId}:projects:updates" // Real-time project updates
"tenant:{tenantId}:notifications" // User notifications
"system:maintenance" // System-wide maintenance events

// Job queue keys (BullMQ)
"bull:rent-reminders" // Rent reminder jobs
"bull:late-fees" // Late fee calculation jobs
"bull:email-notifications" // Email sending jobs
"bull:search-indexing" // Search index updates

// Session storage
"session:{sessionId}" // JWT refresh tokens and user sessions

// Rate limiting
"rate_limit:api:{userId}:{endpoint}" // API rate limiting
"rate_limit:search:{userId}" // Search rate limiting
```

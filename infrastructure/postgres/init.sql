-- =============================================
-- iREP PostgreSQL Database Schema with Seed Data (Corrected)
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
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
    allocated_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
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
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    reference_number VARCHAR(50),
    description VARCHAR(255) NOT NULL,
    total_amount NUMERIC(19,4) NOT NULL CHECK (total_amount > 0),
    currency VARCHAR(3) DEFAULT 'USD',
    project_id UUID,
    property_id UUID,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
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
BEGIN
    RETURN (SELECT NULLIF(current_setting('app.tenant_id', TRUE), '')::UUID);
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
    
-- =============================================
-- SEED DATA
-- =============================================

-- Organizations
INSERT INTO organizations (id, name, domain, billing_status, subscription_plan, settings)
VALUES
    ('550e8400-e29b-41d4-a716-446655440000', 'Acme Realty', 'acme.realty.com', 'active', 'premium', '{"timezone": "America/New_York"}'),
    ('550e8400-e29b-41d4-a716-446655440001', 'Beta Properties', 'beta.properties.com', 'active', 'basic', '{"timezone": "America/Los_Angeles"}');

-- Users (password is 'password123' for all)
INSERT INTO users (id, tenant_id, email, password_hash, first_name, last_name, phone, roles, is_active)
VALUES
    ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'admin@acme.realty.com', '$2a$10$w4E.g.p0Z0D5Z5a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t', 'John', 'Doe', '555-0100', '["admin"]', TRUE),
    ('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'manager@acme.realty.com', '$2a$10$w4E.g.p0Z0D5Z5a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t', 'Jane', 'Smith', '555-0101', '["project_manager"]', TRUE),
    ('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'admin@beta.properties.com', '$2a$10$w4E.g.p0Z0D5Z5a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t', 'Alice', 'Brown', '555-0102', '["admin"]', TRUE);

-- Properties
INSERT INTO properties (id, tenant_id, title, description, property_type, status, price, currency, bedrooms, bathrooms, square_feet, lot_size, year_built, address_line1, city, state, zip_code, country, latitude, longitude, location, images, documents, features, created_by)
VALUES
    ('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', 'Downtown Condo', 'Luxurious 2-bedroom condo in the city center', 'residential', 'available', 275000.0000, 'USD', 2, 2.0, 1200.00, 0.00, 2018, '123 Main St', 'San Francisco', 'CA', '94105', 'USA', 37.7749, -122.4194, ST_SetSRID(ST_MakePoint(-122.4194, 37.7749), 4326), '["https://cdn.example.com/images/condo1.jpg"]', '["https://cdn.example.com/docs/condo1.pdf"]', '["pool", "gym"]', '550e8400-e29b-41d4-a716-446655440002'),
    ('550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440001', 'Suburban House', 'Spacious family home with large backyard', 'residential', 'pending', 450000.0000, 'USD', 4, 3.0, 2500.00, 0.25, 2005, '456 Oak Ave', 'Los Angeles', 'CA', '90001', 'USA', 34.0522, -118.2437, ST_SetSRID(ST_MakePoint(-118.2437, 34.0522), 4326), '["https://cdn.example.com/images/house1.jpg"]', '[]', '["garden", "garage"]', '550e8400-e29b-41d4-a716-446655440004');

-- Ensure RLS policies are enforced for the app user
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

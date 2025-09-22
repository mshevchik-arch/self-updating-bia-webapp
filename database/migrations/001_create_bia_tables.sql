-- Self-Updating BIA Web App Database Schema
-- Migration 001: Create core BIA tables

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- BIA Documents table
CREATE TABLE bia_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    function_name VARCHAR(255) NOT NULL,
    function_type VARCHAR(50) NOT NULL CHECK (function_type IN ('product', 'platform', 'support', 'infrastructure', 'compliance')),
    dri_name VARCHAR(255),
    dri_team VARCHAR(255),
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected', 'archived')),
    version VARCHAR(20) DEFAULT '1.0',
    
    -- Auto-populated data (stored as JSONB for flexibility)
    personnel_data JSONB,
    business_impact_data JSONB,
    technology_data JSONB,
    recovery_data JSONB,
    risk_compliance_data JSONB,
    iso_22301_data JSONB,
    regional_overlays JSONB,
    predictive_analysis JSONB,
    
    -- Data source tracking
    data_sources JSONB,
    confidence_scores JSONB,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by VARCHAR(255),
    approval_comments TEXT,
    
    -- Fusion integration
    fusion_record_id VARCHAR(100),
    fusion_status VARCHAR(50),
    fusion_last_sync TIMESTAMP WITH TIME ZONE,
    
    -- Indexing for performance
    CONSTRAINT unique_function_name_version UNIQUE (function_name, version)
);

-- BIA Audit Log table
CREATE TABLE bia_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bia_id UUID REFERENCES bia_documents(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    user_id VARCHAR(255),
    user_name VARCHAR(255),
    old_values JSONB,
    new_values JSONB,
    comments TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Data Source Health table
CREATE TABLE data_source_health (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_name VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('healthy', 'degraded', 'error', 'maintenance')),
    response_time_ms INTEGER,
    last_check TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    error_message TEXT,
    health_details JSONB,
    
    CONSTRAINT unique_source_name UNIQUE (source_name)
);

-- BIA Generation Jobs table (for async processing)
CREATE TABLE bia_generation_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    function_name VARCHAR(255) NOT NULL,
    function_type VARCHAR(50) NOT NULL,
    dri_name VARCHAR(255),
    dri_team VARCHAR(255),
    regional_overlays JSONB,
    
    status VARCHAR(50) DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
    progress INTEGER DEFAULT 0,
    error_message TEXT,
    
    result_bia_id UUID REFERENCES bia_documents(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Fusion Integration Log table
CREATE TABLE fusion_integration_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bia_id UUID REFERENCES bia_documents(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL CHECK (action IN ('check', 'push', 'pull', 'sync')),
    fusion_record_id VARCHAR(100),
    status VARCHAR(50) NOT NULL CHECK (status IN ('success', 'failed', 'pending')),
    request_data JSONB,
    response_data JSONB,
    error_message TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_bia_documents_function_name ON bia_documents(function_name);
CREATE INDEX idx_bia_documents_status ON bia_documents(status);
CREATE INDEX idx_bia_documents_created_at ON bia_documents(created_at);
CREATE INDEX idx_bia_documents_fusion_record_id ON bia_documents(fusion_record_id);

CREATE INDEX idx_bia_audit_log_bia_id ON bia_audit_log(bia_id);
CREATE INDEX idx_bia_audit_log_timestamp ON bia_audit_log(timestamp);

CREATE INDEX idx_data_source_health_source_name ON data_source_health(source_name);
CREATE INDEX idx_data_source_health_status ON data_source_health(status);

CREATE INDEX idx_bia_generation_jobs_status ON bia_generation_jobs(status);
CREATE INDEX idx_bia_generation_jobs_created_at ON bia_generation_jobs(created_at);

CREATE INDEX idx_fusion_integration_log_bia_id ON fusion_integration_log(bia_id);
CREATE INDEX idx_fusion_integration_log_timestamp ON fusion_integration_log(timestamp);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to bia_documents
CREATE TRIGGER update_bia_documents_updated_at 
    BEFORE UPDATE ON bia_documents 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial data source health records
INSERT INTO data_source_health (source_name, status, health_details) VALUES
('registry', 'healthy', '{"description": "Registry data from Snowflake via Goose extension"}'),
('pagerduty', 'healthy', '{"description": "PagerDuty API for escalation policies and incident data"}'),
('hr_systems', 'healthy', '{"description": "HR/LDAP systems for personnel information"}'),
('financial_systems', 'healthy', '{"description": "Financial analytics APIs for revenue impact"}'),
('monitoring_systems', 'healthy', '{"description": "Monitoring platforms for availability and performance"}'),
('rooster_engine', 'healthy', '{"description": "Rooster predictive analytics engine"}'),
('fusion_mcp', 'healthy', '{"description": "Fusion MCP for risk management integration"}')

-- Database schema for Done-Now-Next-Explore Roadmap Tool

-- Table for storing roadmap initiatives
CREATE TABLE IF NOT EXISTS initiatives (
    id SERIAL PRIMARY KEY,
    aha_id VARCHAR(255) UNIQUE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    ai_summary TEXT,
    custom_tags TEXT[], -- Array of custom tags set by PM
    timeline VARCHAR(100), -- Month/quarter display
    column_name VARCHAR(50) NOT NULL CHECK (column_name IN ('done', 'now', 'next', 'explore')),
    sort_order INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT true,
    raw_aha_data JSONB, -- Store original AHA! data for reference
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for admin configuration
CREATE TABLE IF NOT EXISTS admin_config (
    id SERIAL PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for sync logs
CREATE TABLE IF NOT EXISTS sync_logs (
    id SERIAL PRIMARY KEY,
    sync_status VARCHAR(50) NOT NULL,
    sync_message TEXT,
    initiatives_synced INTEGER DEFAULT 0,
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    synced_by VARCHAR(100)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_initiatives_column ON initiatives(column_name);
CREATE INDEX IF NOT EXISTS idx_initiatives_visible ON initiatives(is_visible);
CREATE INDEX IF NOT EXISTS idx_initiatives_aha_id ON initiatives(aha_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for initiatives table
DROP TRIGGER IF EXISTS update_initiatives_updated_at ON initiatives;
CREATE TRIGGER update_initiatives_updated_at
    BEFORE UPDATE ON initiatives
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for admin_config table
DROP TRIGGER IF EXISTS update_admin_config_updated_at ON admin_config;
CREATE TRIGGER update_admin_config_updated_at
    BEFORE UPDATE ON admin_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin configuration
INSERT INTO admin_config (config_key, config_value)
VALUES
    ('ai_provider', 'oneadvanced'),
    ('product_name', 'Our Product')
ON CONFLICT (config_key) DO NOTHING;

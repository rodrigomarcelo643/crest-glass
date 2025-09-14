-- Insert sample admin user for testing
INSERT INTO admin_users (username, password_hash, role) 
VALUES ('admin', 'admin123', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Insert another admin user
INSERT INTO admin_users (username, password_hash, role) 
VALUES ('manager', 'manager123', 'manager')
ON CONFLICT (username) DO NOTHING;
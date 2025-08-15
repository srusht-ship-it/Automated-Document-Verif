-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('issuer', 'individual', 'verifier')),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    organization VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Document types table
CREATE TABLE document_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    validation_rules JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Documents table
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    hash VARCHAR(255) UNIQUE NOT NULL,
    issuer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    individual_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    document_type_id INTEGER REFERENCES document_types(id),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
    extracted_text TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Verifications table
CREATE TABLE verifications (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
    verifier_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    result VARCHAR(50) NOT NULL CHECK (result IN ('authentic', 'fake', 'inconclusive')),
    confidence DECIMAL(5,2),
    verification_details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit logs table
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    user_id INTEGER REFERENCES users(id),
    table_name VARCHAR(50),
    record_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default document types
INSERT INTO document_types (name, description, validation_rules) VALUES
('Birth Certificate', 'Official birth certificate', '{"required_fields": ["name", "date_of_birth", "place_of_birth"]}'),
('Academic Transcript', 'Educational institution transcript', '{"required_fields": ["student_name", "institution", "grades"]}'),
('Experience Certificate', 'Employment experience certificate', '{"required_fields": ["employee_name", "company", "duration"]}');

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_documents_hash ON documents(hash);
CREATE INDEX idx_documents_issuer ON documents(issuer_id);
CREATE INDEX idx_documents_individual ON documents(individual_id);
CREATE INDEX idx_verifications_document ON verifications(document_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
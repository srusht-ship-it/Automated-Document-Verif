-- Create templates table
CREATE TABLE IF NOT EXISTS templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Educational', 'Professional', 'Government', 'Medical', 'Legal', 'Financial')),
    description TEXT,
    fields JSONB NOT NULL DEFAULT '[]',
    "issuerId" INTEGER NOT NULL REFERENCES users(id),
    usage INTEGER DEFAULT 0,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
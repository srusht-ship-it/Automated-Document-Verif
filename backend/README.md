# Document Verification Backend

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup
1. Install PostgreSQL
2. Create database: `document_verification`
3. Update `.env` file with your database credentials

### 3. Environment Variables
Copy `.env.example` to `.env` and update:
```
DB_URL=postgres://username:password@localhost:5432/document_verification
JWT_SECRET=your-secret-key
```

### 4. Run Migrations
```bash
npm run db:migrate
```

### 5. Seed Database (Optional)
```bash
npm run db:seed
```

### 6. Start Server
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register user
- POST `/api/auth/login` - Login user
- GET `/api/auth/profile` - Get user profile

### Documents
- POST `/api/documents/upload` - Upload document (Issuer only)
- GET `/api/documents` - List documents
- GET `/api/documents/:id` - Get document details
- DELETE `/api/documents/:id` - Delete document (Issuer only)
- GET `/api/documents/:id/download` - Download document
- POST `/api/documents/:id/verify` - Verify document (Verifier only)

## Demo Users
After seeding:
- issuer@demo.com / demo123
- individual@demo.com / demo123  
- verifier@demo.com / demo123
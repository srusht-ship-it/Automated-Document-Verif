# Login Error Fix - Step by Step Instructions

## Issues Fixed:

### 1. Auth Service Refresh Token Error ✅
- **Problem**: Frontend was trying to use refresh tokens that don't exist in backend
- **Fix**: Simplified auth service to work without refresh tokens
- **Files Modified**: `frontend/src/services/auth.js`

### 2. Service Worker Cache Error ✅
- **Problem**: Service worker trying to cache non-existent files
- **Fix**: Removed non-existent static files from cache list
- **Files Modified**: `frontend/public/sw.js`

### 3. Missing Demo Users ⚠️
- **Problem**: Demo users might not exist in database
- **Fix**: Created script to set up demo users

## Step-by-Step Fix Instructions:

### Step 1: Start the Backend Server
```bash
cd backend
npm install
npm start
```

### Step 2: Create Demo Users (Run this once)
```bash
cd backend
node create-demo-users.js
```

### Step 3: Start the Frontend
```bash
cd frontend
npm install
npm start
```

### Step 4: Test Login
1. Go to http://localhost:3000/login
2. Use one of these demo accounts:
   - **Issuer**: issuer@demo.com / demo123
   - **Individual**: individual@demo.com / demo123  
   - **Verifier**: verifier@demo.com / demo123

## Alternative: Manual Database Setup

If the demo user script doesn't work, you can:

1. **Check Database Connection**:
   ```bash
   cd backend
   node test-db.js
   ```

2. **Register New Users** via the registration page:
   - Go to http://localhost:3000/register
   - Create accounts with different roles

## Troubleshooting:

### If Backend Won't Start:
1. Check if PostgreSQL is running
2. Verify database credentials in `.env` file
3. Make sure database `document_verification` exists

### If Login Still Fails:
1. Open browser console (F12)
2. Check for error messages
3. Verify backend is running on port 5000
4. Check network tab for API call responses

### Database Issues:
```sql
-- Connect to PostgreSQL and create database if needed
CREATE DATABASE document_verification;
```

## Expected Behavior After Fix:

1. ✅ No more "Failed to execute 'addAll' on 'Cache'" errors
2. ✅ No more "No refresh token available" errors  
3. ✅ Login should work with demo credentials
4. ✅ Successful login redirects to appropriate dashboard
5. ✅ Upload documents button should work after login

## Quick Test:
1. Start both servers
2. Run demo user creation script
3. Login with issuer@demo.com / demo123
4. Try uploading a document

The login functionality should now work properly!
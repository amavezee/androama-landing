# Testing Guide - Authentication System

## Pre-Testing Checklist

1. ✅ Backend dependencies installed: `cd backend && pip install -r requirements.txt`
2. ✅ Frontend dependencies installed: `npm install`
3. ✅ PostgreSQL running and database created
4. ✅ Backend `.env` configured
5. ✅ Frontend `.env` configured
6. ✅ Database initialized: `python backend/init_db.py`

## Test 1: User Registration

### Steps:
1. Start backend: `cd backend && uvicorn app.main:app --reload`
2. Start frontend: `npm run dev`
3. Navigate to `/register`
4. Fill in:
   - Email: `test@example.com`
   - Username: `testuser`
   - Password: `testpassword123`
   - Confirm Password: `testpassword123`
5. Click "Create Account"

### Expected Results:
- ✅ User is created in database
- ✅ Auto-logged in after registration
- ✅ Redirected to home page
- ✅ Profile dropdown shows user info

### Verify in Database:
```sql
SELECT * FROM users WHERE email = 'test@example.com';
-- Should show: email, username, password_hash (hashed), created_at, etc.
```

## Test 2: User Login

### Steps:
1. Logout if logged in
2. Navigate to `/login`
3. Enter credentials from Test 1
4. Click "Sign In"

### Expected Results:
- ✅ Successfully logged in
- ✅ Token stored in localStorage
- ✅ User data stored in localStorage
- ✅ Redirected to home page

### Verify:
- Check browser DevTools → Application → Local Storage
- Should see `access_token` and `user` keys

## Test 3: User Persistence

### Steps:
1. Login as test user
2. Close browser completely
3. Reopen browser and navigate to site
4. Check if still logged in

### Expected Results:
- ✅ User remains logged in
- ✅ Profile dropdown shows user
- ✅ Token is still valid

## Test 4: Google OAuth (if configured)

### Prerequisites:
- Google OAuth credentials set up (see `GOOGLE_OAUTH_SETUP.md`)
- `VITE_GOOGLE_CLIENT_ID` in frontend `.env`
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in backend `.env`

### Steps:
1. Navigate to `/login` or `/register`
2. Click "Continue with Google"
3. Sign in with Google account

### Expected Results:
- ✅ Google sign-in popup appears
- ✅ After sign-in, user is created/logged in
- ✅ User has `oauth_provider: "google"` in database
- ✅ User has `avatar_url` if available
- ✅ `password_hash` is NULL (OAuth users don't need password)

### Verify in Database:
```sql
SELECT email, oauth_provider, oauth_id, avatar_url, password_hash 
FROM users 
WHERE oauth_provider = 'google';
-- password_hash should be NULL
```

## Test 5: Error Handling

### Test Invalid Login:
1. Try logging in with wrong password
2. **Expected:** Error message "Incorrect email or password"

### Test Duplicate Email:
1. Try registering with existing email
2. **Expected:** Error message "Email already registered"

### Test Weak Password:
1. Try registering with password < 8 characters
2. **Expected:** Error message "Password must be at least 8 characters long"

### Test OAuth User Trying Password Login:
1. Create user via Google OAuth
2. Try logging in with email/password
3. **Expected:** Error message "Please sign in with Google"

## Test 6: Database Connection Pooling

### Stress Test:
1. Create multiple users rapidly (10+ registrations)
2. Monitor backend logs for connection errors
3. **Expected:** No connection pool exhaustion errors

### Verify:
- Check backend logs for any SQLAlchemy pool errors
- Database should handle concurrent requests smoothly

## Test 7: Token Expiration

### Steps:
1. Login
2. Wait for token to expire (default: 30 minutes)
3. Try accessing protected route

### Expected Results:
- ✅ Token expires after set time
- ✅ User is redirected to login
- ✅ Error handled gracefully

## Test 8: Admin User

### Steps:
1. Login with `admin@androama.com`
2. Check profile dropdown

### Expected Results:
- ✅ Admin badge/indicator visible
- ✅ "Admin Panel" option in dropdown (if implemented)

## Database Verification Queries

```sql
-- Check all users
SELECT id, email, username, edition, created_at, oauth_provider 
FROM users 
ORDER BY created_at DESC;

-- Check user sessions
SELECT * FROM user_sessions 
ORDER BY created_at DESC 
LIMIT 10;

-- Check for OAuth users
SELECT email, oauth_provider, oauth_id, avatar_url 
FROM users 
WHERE oauth_provider IS NOT NULL;

-- Verify password hashing (should be bcrypt hash)
SELECT email, 
       CASE 
         WHEN password_hash IS NULL THEN 'OAuth User'
         WHEN password_hash LIKE '$2b$%' THEN 'Bcrypt Hash'
         ELSE 'Invalid'
       END as hash_type
FROM users;
```

## Performance Testing

### Load Test (Optional):
```bash
# Install Apache Bench
# Test registration endpoint
ab -n 100 -c 10 -p register.json -T application/json http://localhost:8000/api/auth/register

# Test login endpoint
ab -n 100 -c 10 -p login.json -T application/json http://localhost:8000/api/auth/login
```

### Expected:
- ✅ No database connection errors
- ✅ Response times < 500ms for most requests
- ✅ Connection pool handles load

## Common Issues & Solutions

### Issue: "Database connection failed"
**Solution:** Check PostgreSQL is running and DATABASE_URL is correct

### Issue: "Module not found" errors
**Solution:** Run `pip install -r requirements.txt` in backend directory

### Issue: Google OAuth not working
**Solution:** 
- Verify Client ID in both frontend and backend `.env`
- Check authorized origins in Google Console
- Ensure Google+ API is enabled

### Issue: Users not persisting
**Solution:**
- Check database connection
- Verify `db.commit()` is called after creating users
- Check for transaction rollbacks in logs

## Success Criteria

✅ All tests pass
✅ Users persist in database
✅ Login/logout works correctly
✅ Google OAuth works (if configured)
✅ Error handling is robust
✅ No database connection issues
✅ Token management works correctly
✅ Profile shows correct user info


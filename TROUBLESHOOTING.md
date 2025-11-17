# Troubleshooting Guide

## Issue: "The given origin is not allowed" (Even After Configuring)

### Solution 1: Wait for Propagation
Google's changes can take **5 minutes to a few hours** to propagate. The note at the bottom of Google Console says this.

**What to do:**
- Wait 5-10 minutes
- Try again
- If still not working, continue to Solution 2

### Solution 2: Clear Browser Cache
1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"
4. Or use Ctrl+Shift+Delete to clear cache

### Solution 3: Check Exact Origin
The origin must match **exactly**. Check what origin Google sees:

1. Open browser console (F12)
2. Look at the error - it will show the origin it's trying to use
3. Make sure that exact origin is in Google Console

Common issues:
- Missing `http://` or `https://`
- Wrong port number
- Trailing slash (shouldn't have one)
- Case sensitivity (should be lowercase)

### Solution 4: Try Incognito Mode
1. Open incognito/private window
2. Go to http://localhost:5173/login
3. Test Google Sign-In

This rules out browser cache/cookie issues.

## Issue: Backend Connection Refused

**Error:** `POST http://localhost:8000/api/auth/google net::ERR_CONNECTION_REFUSED`

### Solution: Start Backend Server

**Option 1: Direct (Development)**
```bash
cd backend
uvicorn app.main:app --reload
```

**Option 2: Docker**
```bash
cd backend
docker-compose up -d
```

**Option 3: Check if Already Running**
```bash
# Windows PowerShell
netstat -ano | findstr :8000

# If nothing shows, backend isn't running
```

### Verify Backend is Running
1. Open browser: http://localhost:8000/api/health
2. Should see: `{"status":"healthy"}`
3. If you see this, backend is running ✅

## Issue: React Router Warnings

These are just **warnings**, not errors. They don't affect functionality.

**Fixed:** Added future flags to BrowserRouter to silence warnings.

## Complete Checklist

- [x] Google Console configured (you've done this ✅)
- [ ] Wait 5-10 minutes for Google changes to propagate
- [ ] Backend server running on port 8000
- [ ] Clear browser cache
- [ ] Test in incognito mode
- [x] React Router warnings fixed

## Still Not Working?

1. **Check browser console** - Look for the exact error message
2. **Check backend logs** - See if requests are reaching the backend
3. **Verify .env files** - Make sure Client ID is correct
4. **Test backend directly** - `curl http://localhost:8000/api/health`

## Quick Test Commands

```bash
# Check backend
curl http://localhost:8000/api/health

# Check if port is in use
netstat -ano | findstr :8000

# Start backend
cd backend
uvicorn app.main:app --reload
```




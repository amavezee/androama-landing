# Quick Fix Guide

## Issues Found:

### 1. ✅ Fixed: Button Width Error
- Changed from `width: '100%'` to `width: 400` (pixels)
- Google Sign-In button doesn't accept percentage widths

### 2. ⚠️ Backend Not Running
**Error:** `POST http://localhost:8000/api/auth/google net::ERR_CONNECTION_REFUSED`

**Solution:**
Start your backend server:
```bash
cd backend
uvicorn app.main:app --reload
```

Or if using Docker:
```bash
cd backend
docker-compose up -d
```

### 3. ⚠️ Google Origin Not Configured
**Error:** `The given origin is not allowed for the given client ID`

**Solution:**
1. Go to: https://console.cloud.google.com/apis/credentials
2. Click your OAuth Client ID
3. Add to **Authorized JavaScript origins:**
   - `http://localhost:5173`
4. Add to **Authorized redirect URIs:**
   - `http://localhost:5173`
5. Click **SAVE**
6. Wait 1-2 minutes, then refresh browser

### 4. ℹ️ React Router Warnings (Not Critical)
These are just warnings about future React Router v7 changes. They don't affect functionality.

## Complete Setup Checklist:

- [x] Frontend `.env` has `VITE_GOOGLE_CLIENT_ID`
- [x] Backend `.env` has `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- [ ] Backend server is running on port 8000
- [ ] Google Console has authorized origins configured
- [ ] Database is initialized (`python backend/init_db.py`)

## Test Steps:

1. **Start Backend:**
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```

2. **Start Frontend** (in another terminal):
   ```bash
   npm run dev
   ```

3. **Configure Google Console** (see above)

4. **Test:**
   - Go to http://localhost:5173/login
   - Click the Google Sign-In button
   - Should work now!




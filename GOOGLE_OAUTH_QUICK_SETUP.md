# 🚀 Quick Google OAuth Setup (5 Minutes)

## ✅ Your Google Cloud Console is Already Configured!
I can see from your screenshot that you've already set up:
- Authorized JavaScript origins (localhost:5173, localhost:3000, androama.com, www.androama.com)
- OAuth client correctly configured

## 🔧 What You Need To Do Now:

### Step 1: Get Your Google Client ID
1. In your Google Cloud Console (the screen you showed me)
2. You should see your **Client ID** - it looks like: `123456789-abc...xyz.apps.googleusercontent.com`
3. Copy this Client ID

### Step 2: Create Frontend `.env` File
1. In your project root folder: `D:\projekti\bolt androama\project\`
2. Create a new file called `.env` (exactly this name)
3. Add this line (replace with your actual Client ID):
```env
VITE_GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
VITE_API_URL=http://localhost:8000
```

### Step 3: Get Your Google Client Secret
1. In Google Cloud Console, on the same OAuth client page
2. Look for **Client secret** field
3. Copy the client secret value

### Step 4: Create Backend `.env` File
1. In your backend folder: `D:\projekti\bolt androama\project\backend\`
2. Create a new file called `.env`
3. Add these lines (replace with your actual values):
```env
# Database
DATABASE_URL=postgresql://androama_user:androama_pass@localhost:5432/androama_db

# JWT Secret (generate a secure random string)
SECRET_KEY=your-secret-key-change-this-to-random-string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Google OAuth (paste your actual credentials here)
GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-client-secret

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,https://androama.com,https://www.androama.com

# Environment
ENVIRONMENT=development
```

### Step 5: Restart Everything
1. **Stop your frontend** (Ctrl+C in the terminal running `npm run dev`)
2. **Stop your backend** (Ctrl+C in the backend terminal)
3. **Start backend again**: 
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```
4. **Start frontend again** (in a new terminal):
   ```bash
   cd "D:\projekti\bolt androama\project"
   npm run dev
   ```

### Step 6: Test Google Login
1. Go to `http://localhost:5173/register`
2. You should now see the "Sign in with Google" button
3. Click it and sign in with your Google account
4. You should be redirected to the home page

## 🐛 If It Still Doesn't Work:

### Check Browser Console (F12):
```javascript
// Type this in browser console to check if Client ID is loaded:
console.log(import.meta.env.VITE_GOOGLE_CLIENT_ID);
```

If it shows `undefined`, your `.env` file wasn't loaded (restart dev server).

### Check Backend Logs:
- Look for any errors related to Google OAuth
- Check if `GOOGLE_CLIENT_ID` is loaded in backend

### Quick Test Commands:
```powershell
# Check if frontend .env exists
Get-Content .env

# Check if backend .env exists
Get-Content backend\.env
```

## 📋 Checklist:
- [ ] Copied Client ID from Google Cloud Console
- [ ] Copied Client Secret from Google Cloud Console
- [ ] Created `.env` in project root with `VITE_GOOGLE_CLIENT_ID`
- [ ] Created `backend\.env` with Google credentials
- [ ] Restarted both frontend and backend servers
- [ ] Tested Google sign-in button

## 🎉 Expected Result:
After completing these steps:
1. The "Sign in with Google" button should appear
2. Clicking it opens Google sign-in popup
3. After signing in, you're redirected to the dashboard
4. You can see your profile with Google avatar

---

**Need Help?** Check the browser console (F12) for any error messages!

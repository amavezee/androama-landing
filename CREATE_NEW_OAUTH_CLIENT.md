# 🔄 Create New OAuth Client - Last Resort Fix

## When to Use This
If you've tried everything and still get 403 errors, sometimes creating a fresh OAuth client resolves the issue. Old clients can get into a bad state.

## Step-by-Step: Create New OAuth Client

### Step 1: Create New OAuth Client
1. Go to: https://console.cloud.google.com/apis/credentials
2. **IMPORTANT**: Make sure you're in the **SAME project** as your OAuth Consent Screen
3. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
4. If prompted, configure OAuth consent screen first (skip if already done)

### Step 2: Configure OAuth Client
1. **Application type**: Select **"Web application"**
2. **Name**: Enter "Androama webclient" (or any name you prefer)
3. **Authorized JavaScript origins**:
   - Click **"+ ADD URI"**
   - Enter: `http://localhost:5173`
   - **IMPORTANT**: No trailing slash!
4. **Authorized redirect URIs**:
   - Click **"+ ADD URI"**
   - Enter: `http://localhost:5173/login`
5. Click **"CREATE"**

### Step 3: Copy New Client ID
1. A popup will show your new Client ID
2. **Copy the Client ID** (it will look like: `123456789-abcdefghijklmnop.apps.googleusercontent.com`)
3. Click **"OK"**

### Step 4: Update Your .env File
1. Open: `D:\projekti\bolt androama\project\.env`
2. Update the line:
   ```
   VITE_GOOGLE_CLIENT_ID=YOUR_NEW_CLIENT_ID_HERE
   ```
3. Replace `YOUR_NEW_CLIENT_ID_HERE` with the new Client ID you copied
4. Save the file

### Step 5: Restart Dev Server
1. Stop your current dev server (Ctrl+C)
2. Restart it:
   ```bash
   npm run dev
   ```
   or
   ```bash
   vite
   ```

### Step 6: Wait and Test
1. **Wait 5-10 minutes** for Google to propagate the new client
2. Clear browser cache: `Ctrl+Shift+R`
3. Try the Google Sign-In button again

## Verify Everything is Correct

### Check OAuth Client
- ✅ Application type: "Web application"
- ✅ Authorized JavaScript origins: `http://localhost:5173` (exactly, no trailing slash)
- ✅ Authorized redirect URIs: `http://localhost:5173/login`
- ✅ Same project as Consent Screen

### Check Consent Screen
- ✅ Status: "In production" or "Published"
- ✅ Same project as OAuth Client

### Check .env File
- ✅ `VITE_GOOGLE_CLIENT_ID` matches new Client ID
- ✅ No extra spaces or quotes
- ✅ Dev server restarted after change

## Troubleshooting

### Still Getting 403?
1. **Double-check project match**: OAuth client and consent screen must be in same project
2. **Verify origin**: Must be exactly `http://localhost:5173` (no trailing slash, no path)
3. **Wait longer**: Sometimes takes 15-20 minutes for new clients
4. **Clear cache**: Hard refresh or Incognito window
5. **Check Network tab**: Look at the failed request's Response tab for Google's error message

### Old Client ID Still Being Used?
1. Make sure you saved the `.env` file
2. Restart the dev server (Vite only reads `.env` on startup)
3. Check browser console - it should show the new Client ID

## Why This Works

Sometimes OAuth clients get into a bad state where:
- Google's servers have cached invalid configuration
- There's a mismatch that's hard to detect
- The client needs to be recreated from scratch

Creating a new client gives you a fresh start with clean configuration.


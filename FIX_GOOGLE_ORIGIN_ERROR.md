# 🔴 Fix "Origin Not Allowed" Error

## The Problem
Google is rejecting your origin because it doesn't match what's configured in Google Cloud Console.

## ⚠️ Common Causes:

1. **Using `127.0.0.1` instead of `localhost`**
   - Google sees `http://127.0.0.1:5173` and `http://localhost:5173` as **different origins**
   - You need to add BOTH to Google Cloud Console

2. **Origin doesn't match exactly**
   - Must be exactly: `http://localhost:5173` (no trailing slash!)
   - Must be exactly: `http://127.0.0.1:5173` (if you use this)

3. **Changes haven't propagated**
   - Google can take 2-5 minutes to update after saving

## ✅ Fix Steps:

### Step 1: Check Your Current Origin
Open your browser console and run:
```javascript
console.log(window.location.origin);
```

This will show you the exact origin Google sees (e.g., `http://localhost:5173` or `http://127.0.0.1:5173`)

### Step 2: Add ALL Origins to Google Cloud Console

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on your OAuth 2.0 Client ID: `545048780620-oen09v389mvqikcts5u57vug6hga9oif`
3. Scroll to **"Authorized JavaScript origins"**
4. Make sure you have **ALL** of these (add any that are missing):
   ```
   http://localhost:5173
   http://127.0.0.1:5173
   http://localhost:3000
   http://127.0.0.1:3000
   https://androama.com
   https://www.androama.com
   ```
   ⚠️ **NO trailing slashes!** (e.g., NOT `http://localhost:5173/`)

5. Scroll to **"Authorized redirect URIs"**
6. Add the same origins:
   ```
   http://localhost:5173
   http://127.0.0.1:5173
   http://localhost:3000
   http://127.0.0.1:3000
   https://androama.com
   https://www.androama.com
   ```

7. Click **SAVE** at the bottom

### Step 3: Wait and Clear Cache

1. **Wait 2-3 minutes** for Google to update
2. **Clear your browser cache**:
   - Chrome/Edge: `Ctrl+Shift+Delete` → Clear cached images and files
   - Or use Incognito/Private mode
3. **Hard refresh**: `Ctrl+F5` or `Ctrl+Shift+R`

### Step 4: Always Use `localhost` (Recommended)

To avoid confusion, always access your site via:
```
http://localhost:5173
```

NOT:
```
http://127.0.0.1:5173
```

## 🧪 Test It

After making changes:
1. Wait 2-3 minutes
2. Clear browser cache
3. Open in Incognito/Private window
4. Go to: `http://localhost:5173/login`
5. Try Google Sign-In

## Still Not Working?

If it still doesn't work after 5 minutes:
1. Double-check the origin in browser console: `console.log(window.location.origin)`
2. Make sure it matches EXACTLY in Google Cloud Console (case-sensitive, no trailing slash)
3. Try a different browser
4. Check if you have any browser extensions blocking Google scripts


# 🔴 Fix Google OAuth "Origin Not Allowed" Error

## ✅ Your Regular Login is Working!
Great news - the email/password login is now working! 🎉

## 🔧 Fix Google OAuth Origin Error

The error "The given origin is not allowed for the given client ID" means Google doesn't recognize your current origin.

### Step 1: Check Your Actual Origin

Open your browser console (F12) on the login page and run:
```javascript
console.log('Your origin:', window.location.origin);
console.log('Full URL:', window.location.href);
```

**Note the exact origin** - it might be:
- `http://localhost:5173` ✅
- `http://127.0.0.1:5173` ❌ (needs to be added)
- `http://[::1]:5173` ❌ (IPv6, needs to be added)

### Step 2: Add ALL Possible Origins to Google Cloud Console

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click your OAuth Client ID: `545048780620-oen09v389mvqikcts5u57vug6hga9oif`
3. Scroll to **"Authorized JavaScript origins"**
4. Make sure you have **ALL** of these (add any missing ones):
   ```
   http://localhost:5173
   http://127.0.0.1:5173
   http://localhost:3000
   http://127.0.0.1:3000
   https://androama.com
   https://www.androama.com
   ```
   ⚠️ **NO trailing slashes!** (NOT `http://localhost:5173/`)

5. Scroll to **"Authorized redirect URIs"**
6. Add the **EXACT SAME** origins:
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

1. **Wait 3-5 minutes** for Google to propagate changes
2. **Clear browser cache**:
   - `Ctrl+Shift+Delete` → Clear cached images and files
   - Or use **Incognito/Private mode** (recommended for testing)
3. **Hard refresh**: `Ctrl+F5`

### Step 4: Always Use `localhost` (Recommended)

To avoid confusion, **always access your site via**:
```
http://localhost:5173
```

**NOT**:
```
http://127.0.0.1:5173
```

If your dev server is running on `127.0.0.1`, you can configure Vite to use `localhost` instead.

### Step 5: Test Again

1. Open in **Incognito/Private window**
2. Go to: `http://localhost:5173/login`
3. Check browser console - you should see: `Google OAuth - Current origin: http://localhost:5173`
4. Try Google Sign-In button

## 🐛 If Still Not Working

1. **Check the console** - it will show your exact origin
2. **Verify in Google Cloud Console** - make sure the origin matches EXACTLY (case-sensitive, no trailing slash)
3. **Try a different browser** - to rule out browser-specific issues
4. **Wait longer** - Google can take up to 10 minutes to update

## 💡 Quick Test

Run this in your browser console on the login page:
```javascript
console.log('Origin:', window.location.origin);
console.log('Should be in Google Console:', window.location.origin);
```

Then verify that EXACT string is in Google Cloud Console!


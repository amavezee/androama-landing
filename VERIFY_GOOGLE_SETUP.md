# 🔍 Verify Google OAuth Setup

## Your Current Setup:
- ✅ Origin: `http://localhost:5173` (correct!)
- ❌ Google still rejecting it

## ⚠️ Common Issues:

### 1. Changes Haven't Propagated
Google can take **5-10 minutes** to update. If you just saved changes, **wait 5 more minutes** and try again.

### 2. Client ID Mismatch
Your Client ID should be: `545048780620-oen09v389mvqikcts5u57vug6hga9oif.apps.googleusercontent.com`

**Verify in Google Cloud Console:**
1. Go to: https://console.cloud.google.com/apis/credentials
2. Check the Client ID matches EXACTLY
3. Make sure it's the **Web application** type (not iOS/Android)

### 3. Missing in Redirect URIs
You need `http://localhost:5173` in **BOTH** sections:
- ✅ Authorized JavaScript origins
- ✅ Authorized redirect URIs ← **Check this one!**

### 4. Typo or Extra Characters
In Google Cloud Console, make sure:
- NO trailing slash: `http://localhost:5173` ✅ (NOT `http://localhost:5173/` ❌)
- NO extra spaces
- Exact match: `http://localhost:5173` (lowercase, no www)

### 5. Browser Cache
Even with correct setup, browser cache can cause issues:
1. **Use Incognito/Private window** (recommended)
2. Or clear cache: `Ctrl+Shift+Delete` → Clear cached images and files
3. Hard refresh: `Ctrl+F5`

## 🔧 Step-by-Step Fix:

### Step 1: Double-Check Google Cloud Console
1. Go to: https://console.cloud.google.com/apis/credentials
2. Click: `545048780620-oen09v389mvqikcts5u57vug6hga9oif`
3. **Authorized JavaScript origins** - Should have:
   ```
   http://localhost:5173
   ```
4. **Authorized redirect URIs** - Should have:
   ```
   http://localhost:5173
   ```
5. If missing, click "+ ADD URI" and add it
6. Click **SAVE** (bottom of page)
7. Wait for confirmation message

### Step 2: Verify Client ID in .env
Your `.env` file should have:
```env
VITE_GOOGLE_CLIENT_ID=545048780620-oen09v389mvqikcts5u57vug6hga9oif.apps.googleusercontent.com
```

### Step 3: Restart Dev Server
After changing `.env`, restart your dev server:
1. Stop: `Ctrl+C` in the terminal running `npm run dev`
2. Start: `npm run dev`

### Step 4: Test in Incognito
1. Open **Incognito/Private window**
2. Go to: `http://localhost:5173/login`
3. Open console (F12)
4. Check for: `Google OAuth - Current origin: http://localhost:5173`
5. Try Google Sign-In button

### Step 5: Wait and Retry
If still not working:
1. **Wait 10 minutes** after saving in Google Cloud Console
2. **Clear all browser data** for localhost
3. Try again in **Incognito mode**

## 🐛 Still Not Working?

If it's still not working after 10 minutes:
1. **Double-check the Client ID** in Google Cloud Console matches your `.env` file
2. **Verify the origin** in console matches exactly what's in Google Cloud Console
3. **Try a different browser** (Chrome, Firefox, Edge)
4. **Check if you have multiple OAuth clients** - make sure you're editing the right one

## 📝 Quick Checklist:
- [ ] Client ID matches in `.env` and Google Cloud Console
- [ ] `http://localhost:5173` in "Authorized JavaScript origins"
- [ ] `http://localhost:5173` in "Authorized redirect URIs"
- [ ] Clicked SAVE in Google Cloud Console
- [ ] Waited 5-10 minutes after saving
- [ ] Restarted dev server after `.env` changes
- [ ] Testing in Incognito/Private window
- [ ] Cleared browser cache


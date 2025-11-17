# 🔍 Deep Fix for Google OAuth 403 Error

## ✅ What We Know is Correct:
- Client ID: `545048780620-oen09v389mvqikcts5u57vug6hga9oif.apps.googleusercontent.com` ✅
- Origin: `http://localhost:5173` ✅
- Both sections in Google Cloud Console have the origin ✅

## 🔴 The Problem:
Google is still returning 403 "Origin not allowed" even though everything looks correct.

## 🔧 Possible Causes & Fixes:

### 1. **OAuth Consent Screen Domain** (Most Likely!)
Even though you added the origin to the OAuth client, you might also need to add the domain to the **OAuth Consent Screen**:

1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Scroll to **"Authorized domains"**
3. Add: `localhost` (without http:// or port)
4. Click **SAVE**
5. Wait 5-10 minutes

### 2. **Dev Server Cache**
Vite might be caching the old environment variables:

1. **Stop your dev server** (Ctrl+C)
2. **Delete Vite cache**:
   ```bash
   rm -rf node_modules/.vite
   # Or on Windows:
   rmdir /s /q node_modules\.vite
   ```
3. **Restart dev server**: `npm run dev`

### 3. **Browser Cache**
The browser might be caching the Google OAuth script:

1. **Hard refresh**: `Ctrl+Shift+R` or `Ctrl+F5`
2. **Or use Incognito/Private window**
3. **Or clear site data**:
   - F12 → Application tab → Clear storage → Clear site data

### 4. **Check OAuth Consent Screen Status**
Make sure your OAuth consent screen is published:

1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Check if it says "Testing" or "In production"
3. If "Testing", add your email to "Test users"
4. Or publish it (if ready for production)

### 5. **Verify the Exact Client ID**
Double-check the Client ID is being used correctly:

1. Open browser console (F12)
2. Run: `console.log(import.meta.env.VITE_GOOGLE_CLIENT_ID)`
3. Should output: `545048780620-oen09v389mvqikcts5u57vug6hga9oif.apps.googleusercontent.com`

### 6. **Try Different Browser**
Sometimes browser extensions or settings can interfere:
- Try Chrome (if using Firefox)
- Try Firefox (if using Chrome)
- Try Edge
- Disable browser extensions

### 7. **Check for Multiple OAuth Clients**
Make sure you're not accidentally using a different OAuth client:
- Go to: https://console.cloud.google.com/apis/credentials
- Check if you have multiple "Web application" clients
- Make sure you're editing the right one

## 🎯 Most Likely Fix:

**Add `localhost` to OAuth Consent Screen Authorized Domains:**

1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Scroll down to **"Authorized domains"**
3. Click **"+ ADD DOMAIN"**
4. Enter: `localhost` (just the domain, no http://, no port)
5. Click **SAVE**
6. Wait 5-10 minutes
7. Test in Incognito window

## 🧪 Test After Each Fix:

1. Open **Incognito/Private window**
2. Go to: `http://localhost:5173/login`
3. Open console (F12)
4. Check for errors
5. Try Google Sign-In button

## 📝 Checklist:
- [ ] Added `localhost` to OAuth Consent Screen → Authorized domains
- [ ] Restarted dev server after .env changes
- [ ] Cleared Vite cache (`node_modules/.vite`)
- [ ] Cleared browser cache / Using Incognito
- [ ] Verified Client ID in console matches exactly
- [ ] OAuth Consent Screen is published or has test users
- [ ] Waited 10 minutes after making changes
- [ ] Tried different browser


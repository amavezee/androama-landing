# 🔧 Fix Google OAuth 403 Error - "Origin not allowed"

## Current Status
✅ Client ID: Correct (`545048780620-dtjvdi1q3gbeemeiutjki18mgr1st64k`)
✅ Origin: Correct (`http://localhost:5173`)
✅ JavaScript Origins: Configured in Google Console
❌ **403 Error**: Google's button iframe is being rejected

## Root Cause
The 403 error typically means:
1. **OAuth Consent Screen is not configured** or not published
2. **Your email is not added as a test user** (if in Testing mode)
3. **OAuth Consent Screen needs to be republished** after changes

## Step-by-Step Fix

### Step 1: Verify OAuth Consent Screen
1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Check if you see:
   - App name: "Androama" (or your app name)
   - Publishing status: Either "Testing" or "In production"

### Step 2: If in "Testing" Mode
**You MUST add your Google email as a test user:**

1. In the OAuth Consent Screen page, scroll to **"Test users"**
2. Click **"+ ADD USERS"**
3. Add **your Google account email** (the one you'll use to sign in)
4. Click **"ADD"**
5. Click **"SAVE AND CONTINUE"**

**⚠️ CRITICAL**: Only test users can sign in when the app is in Testing mode!

### Step 3: If You Want to Publish (Recommended for Development)
1. In the OAuth Consent Screen page
2. Click **"PUBLISH APP"** button
3. Confirm the publication
4. **Wait 5-10 minutes** for changes to propagate

### Step 4: Verify Authorized Domains (Optional)
Even though localhost doesn't need to be in "Authorized domains", check:
1. In OAuth Consent Screen, scroll to "App domain"
2. Leave it empty OR add your production domain (e.g., `androama.com`)
3. **DO NOT** add `localhost` here - it's not needed

### Step 5: Double-Check OAuth Client Settings
1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on your OAuth 2.0 Client ID
3. Verify:
   - **Authorized JavaScript origins**:
     - `http://localhost:5173` (exactly, no trailing slash)
     - `https://androama.com` (if you have production)
   - **Authorized redirect URIs**:
     - `http://localhost:5173/login` (exactly)
4. Click **"SAVE"** (even if nothing changed - this forces a refresh)

### Step 6: Wait and Test
1. **Wait 5-10 minutes** after making changes
2. **Clear browser cache**: `Ctrl+Shift+R` (hard refresh)
3. **Try in Incognito window** to avoid cache issues
4. Test the Google Sign-In button

## Common Issues

### Issue: "Access blocked: This app's request is invalid"
**Solution**: Your email is not in the test users list. Add it in Step 2.

### Issue: Still getting 403 after all steps
**Solution**: 
1. Try a different Google account (one that's added as test user)
2. Wait longer (up to 1 hour for propagation)
3. Check if you're using the correct Google account

### Issue: Button doesn't appear at all
**Solution**: Check browser console for JavaScript errors. The button should render even if there's a 403.

## Verification Checklist

- [ ] OAuth Consent Screen is configured
- [ ] Your Google email is added as a test user (if in Testing mode)
- [ ] OAuth Client has `http://localhost:5173` in JavaScript origins
- [ ] OAuth Client has `http://localhost:5173/login` in redirect URIs
- [ ] Waited 5-10 minutes after last change
- [ ] Cleared browser cache
- [ ] Tried in Incognito window

## Still Not Working?

If you've completed all steps and still get 403:

1. **Check the exact error in Network tab**:
   - Open DevTools > Network tab
   - Look for the failed request to `accounts.google.com/gsi/button`
   - Check the response headers for more details

2. **Try creating a new OAuth Client**:
   - Sometimes old clients get into a bad state
   - Create a new one and update your `.env` file

3. **Verify you're using the correct Google account**:
   - The account must match the test user email (if in Testing mode)

4. **Check Google Cloud Project settings**:
   - Ensure the project is active
   - Check for any restrictions or quotas


# ✅ Verify OAuth Configuration - Step by Step

## Current Status
- ✅ New Client ID: `545048780620-7os2ae8pfi4bu5etsfih2a9d0rnnq2ms`
- ✅ Origin: `http://localhost:5173`
- ✅ Not in iframe
- ❌ Still getting 403: "The given origin is not allowed for the given client ID"

## Critical Verification Steps

### Step 1: Verify Project Match (MOST IMPORTANT)

**OAuth Client and Consent Screen MUST be in the SAME project!**

1. **Check OAuth Client Project**:
   - Go to: https://console.cloud.google.com/apis/credentials
   - Look at the **project dropdown** at the very top (next to "Google Cloud")
   - Note the project name (e.g., "ANDROAMA")

2. **Check Consent Screen Project**:
   - Go to: https://console.cloud.google.com/apis/credentials/consent
   - Look at the **project dropdown** at the very top
   - **MUST be the EXACT same project!**

3. **If Different**:
   - This is your problem!
   - Switch to the same project in both places
   - Or create OAuth client in the same project as consent screen

### Step 2: Verify OAuth Client Settings

Go to: https://console.cloud.google.com/apis/credentials

1. Click on your OAuth Client ID: `545048780620-7os2ae8pfi4bu5etsfih2a9d0rnnq2ms`
2. Verify:
   - **Application type**: "Web application" (NOT Desktop/Mobile)
   - **Authorized JavaScript origins**: 
     - Must have exactly: `http://localhost:5173`
     - NO trailing slash
     - NO `https://`
     - Just: `http://localhost:5173`
   - **Authorized redirect URIs**:
     - Must have: `http://localhost:5173/login`
3. Click **"SAVE"** (even if nothing changed - forces refresh)
4. Wait 5 minutes

### Step 3: Verify Consent Screen is Published

Go to: https://console.cloud.google.com/apis/credentials/consent

1. Look at the **very top** of the page
2. Should say: **"In production"** or **"Published"**
3. Should **NOT** say: "Testing" or "Unpublished"
4. If it says "Testing":
   - Click **"PUBLISH APP"**
   - Wait 10-15 minutes

### Step 4: Check if Consent Screen Has Required Fields

In Consent Screen:
1. **App name**: Should be filled (e.g., "Androama")
2. **User support email**: Should be filled
3. **Developer contact**: Should be filled
4. All required fields should be completed

### Step 5: Re-Save Everything

Sometimes Google needs a "refresh":

1. **OAuth Client**:
   - Go to OAuth Client settings
   - Click **"SAVE"** (no changes needed)
   - Wait 5 minutes

2. **Consent Screen**:
   - Go to Consent Screen
   - If there's a "SAVE" button, click it
   - Wait 5 minutes

## What to Check in Network Tab

1. Open DevTools → Network tab
2. Reload the login page
3. Find the failed request to `accounts.google.com/gsi/button`
4. Click on it
5. Go to **"Response"** tab
6. Look for Google's error message - it might give more details

## Common Issues

### Issue 1: Project Mismatch
**Symptom**: Everything looks correct but 403 persists
**Solution**: Ensure OAuth client and consent screen are in SAME project

### Issue 2: Not Actually Published
**Symptom**: Consent screen shows "Testing" status
**Solution**: Click "PUBLISH APP" and wait 15 minutes

### Issue 3: Propagation Delay
**Symptom**: Just created/updated, 403 still happening
**Solution**: Wait 15-20 minutes, then clear cache and try again

### Issue 4: Wrong Application Type
**Symptom**: OAuth client is "Desktop" or "Mobile" type
**Solution**: Change to "Web application"

## After Making Changes

1. **Wait 15 minutes** (Google needs time to propagate)
2. **Clear browser cache**: `Ctrl+Shift+R`
3. **Try in Incognito window** (avoids cache issues)
4. **Check console** for any new errors

## If Still Not Working

1. **Double-check project match** (most common issue)
2. **Verify all settings are exactly as shown above**
3. **Check Network tab Response** for Google's error details
4. **Wait longer** (sometimes takes 20-30 minutes)


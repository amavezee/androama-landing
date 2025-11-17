# ✅ Verify OAuth Setup - Debugging 403 Error

## Request Analysis
Your network request shows:
- ✅ **Client ID**: Correct (`545048780620-dtjvdi1q3gbeemeiutjki18mgr1st64k`)
- ✅ **Referer**: `http://localhost:5173/` (Google sees this as the origin)
- ✅ **Request URL**: Correct format
- ❌ **Status**: 403 Forbidden

## Critical Checks

### 1. Verify OAuth Client and Consent Screen are in SAME Project
**This is often the issue!**

1. **Check OAuth Client Project**:
   - Go to: https://console.cloud.google.com/apis/credentials
   - Look at the **project dropdown** at the top (should show project name)
   - Note the project name/ID

2. **Check Consent Screen Project**:
   - Go to: https://console.cloud.google.com/apis/credentials/consent
   - Look at the **project dropdown** at the top
   - **MUST be the same project!**

3. **If Different**:
   - Switch to the correct project in both places
   - Re-configure if needed

### 2. Verify OAuth Client Settings
Go to: https://console.cloud.google.com/apis/credentials

1. Click on your OAuth 2.0 Client ID
2. **Authorized JavaScript origins** MUST have:
   - `http://localhost:5173` (exactly, no trailing slash)
3. **Authorized redirect URIs** MUST have:
   - `http://localhost:5173/login` (exactly)
4. Click **"SAVE"** (even if nothing changed - forces refresh)
5. Wait 5 minutes

### 3. Verify Consent Screen Status
Go to: https://console.cloud.google.com/apis/credentials/consent

1. Check the **top of the page**:
   - Should say **"In production"** or **"Published"**
   - Should NOT say "Testing"
2. If it says "Testing":
   - Click **"PUBLISH APP"**
   - Wait 10-15 minutes

### 4. Check Application Type
In OAuth Client settings, verify:
- **Application type**: Should be "Web application"
- **NOT** "Desktop app" or "Mobile app"

## Step-by-Step Fix

### Step 1: Verify Project Match (CRITICAL)
```
OAuth Client Project = Consent Screen Project
```
If they don't match, that's your problem!

### Step 2: Re-Save Everything
1. Go to OAuth Client → Click "SAVE"
2. Go to Consent Screen → Verify published → Click "SAVE" if needed
3. Wait 10 minutes

### Step 3: Clear and Test
1. Hard refresh: `Ctrl+Shift+R`
2. Try in Incognito window
3. Check Network tab again

## Common Issues

### Issue: Projects Don't Match
**Symptom**: Everything looks correct but 403 persists
**Solution**: Ensure OAuth client and consent screen are in the same Google Cloud project

### Issue: Still in Testing Mode
**Symptom**: Consent screen shows "Testing" status
**Solution**: Click "PUBLISH APP" and wait

### Issue: Propagation Delay
**Symptom**: Just published/changed settings, 403 still happening
**Solution**: Wait 15-20 minutes, then clear cache and try again

### Issue: Wrong Application Type
**Symptom**: OAuth client is set as "Desktop" or "Mobile"
**Solution**: Change to "Web application"

## Debug Checklist

- [ ] OAuth Client and Consent Screen are in **same project**
- [ ] OAuth Client type is **"Web application"**
- [ ] Authorized JavaScript origins: `http://localhost:5173` (no trailing slash)
- [ ] Authorized redirect URIs: `http://localhost:5173/login`
- [ ] Consent Screen status: **"In production"** (not "Testing")
- [ ] Re-saved OAuth Client after publishing
- [ ] Waited 10-15 minutes after last change
- [ ] Cleared browser cache
- [ ] Tried in Incognito window

## If Still Not Working

1. **Create a NEW OAuth Client**:
   - Sometimes old clients get into a bad state
   - Create new one with same settings
   - Update `.env` with new Client ID
   - Wait 10 minutes

2. **Check Google Cloud Console for Errors**:
   - Look for any warnings or errors in the project
   - Check API quotas/limits

3. **Try Different Browser**:
   - Test in Chrome, Firefox, Edge
   - Use Incognito/Private mode


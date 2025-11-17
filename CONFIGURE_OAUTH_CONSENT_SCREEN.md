# ✅ Configure OAuth Consent Screen (Without Adding localhost)

## ⚠️ Important:
**You CANNOT add `localhost` to "Authorized domains"** - that's only for production domains like `androama.com`.

For localhost development, you only need:
- ✅ Origins in OAuth Client (you already have this)
- ✅ OAuth Consent Screen configured (do this now)

## Step-by-Step Setup:

### Step 1: Configure OAuth Consent Screen
1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Click **"Get started"** or **"CONFIGURE CONSENT SCREEN"**

### Step 2: Choose User Type
- Select **"External"** (unless you have Google Workspace)
- Click **"CREATE"**

### Step 3: Fill App Information
- **App name**: `Androama` (or your app name)
- **User support email**: Your email address
- **App logo**: (Optional - can skip)
- **App domain**: Leave empty (or add `androama.com` if you have it)
- **Application home page**: `http://localhost:5173` (for now)
- **Authorized domains**: **SKIP THIS** - don't add localhost here
- **Developer contact**: Your email address
- Click **"SAVE AND CONTINUE"**

### Step 4: Scopes (Optional)
- Click **"SAVE AND CONTINUE"** (you can add scopes later)

### Step 5: Test Users (IMPORTANT!)
If the consent screen is in "Testing" mode:
- Click **"+ ADD USERS"**
- Add your email address (the one you use for Google)
- Click **"ADD"**
- Click **"SAVE AND CONTINUE"**

### Step 6: Summary
- Review the information
- Click **"BACK TO DASHBOARD"**

### Step 7: Publish (If Ready)
- If you want to make it available to all users, click **"PUBLISH APP"**
- Or keep it in "Testing" mode with test users

## ✅ What You Should Have:

1. **OAuth Client** (already done):
   - ✅ Client ID: `545048780620-oen09v389mvqikcts5u57vug6hga9oif`
   - ✅ Authorized JavaScript origins: `http://localhost:5173`
   - ✅ Authorized redirect URIs: `http://localhost:5173`

2. **OAuth Consent Screen** (do this now):
   - ✅ App name configured
   - ✅ Your email as support/developer contact
   - ✅ Test users added (if in Testing mode)
   - ✅ Published or in Testing mode

## 🧪 After Configuration:

1. **Wait 5-10 minutes** for changes to propagate
2. **Test in Incognito window**:
   - Go to: `http://localhost:5173/login`
   - Try Google Sign-In button
   - You should see the consent screen asking for permission

## 📝 Notes:

- **Authorized domains** is ONLY for production domains (like `androama.com`)
- **localhost** works automatically if:
  - It's in OAuth Client origins ✅ (you have this)
  - OAuth Consent Screen is configured ✅ (do this now)
  - You're a test user (if in Testing mode) ✅ (add yourself)


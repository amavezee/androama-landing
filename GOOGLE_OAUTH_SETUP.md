# Google OAuth Setup Guide

## Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable **Google+ API** (or **Google Identity Services**)
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen:
   - User Type: External (or Internal for G Suite)
   - App name: ANDROAMA
   - Support email: your-email@example.com
   - Authorized domains: yourdomain.com
6. Create OAuth 2.0 Client ID:
   - Application type: **Web application**
   - Name: ANDROAMA Web Client
   - **Authorized JavaScript origins:**
     - `http://localhost:5173` (development)
     - `http://localhost:3000` (development)
     - `https://yourdomain.com` (production)
   - **Authorized redirect URIs:**
     - `http://localhost:5173` (development)
     - `https://yourdomain.com` (production)

## Step 2: Get Your Credentials

After creating, you'll get:
- **Client ID** (public, safe for frontend)
- **Client Secret** (private, backend only)

## Step 3: Configure Backend

Add to `backend/.env`:
```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

## Step 4: Configure Frontend

Add to `.env` (project root):
```env
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

**Note:** The Client ID is safe to expose in frontend code. Never expose the Client Secret!

## Step 5: Test

1. Start backend: `cd backend && uvicorn app.main:app --reload`
2. Start frontend: `npm run dev`
3. Go to login/register page
4. Click "Continue with Google"
5. Sign in with your Google account

## Troubleshooting

### "Failed to initialize Google Sign-In"
- Check that `VITE_GOOGLE_CLIENT_ID` is set in `.env`
- Verify the Client ID is correct
- Check browser console for errors

### "Invalid Google token"
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in backend `.env`
- Check that authorized origins match your domain
- Ensure Google+ API is enabled

### Redirect URI mismatch
- Add your exact domain to Authorized redirect URIs
- Include both `http://` and `https://` if needed
- Include port numbers for development

## Security Notes

- ✅ Client ID can be public (frontend)
- ❌ Client Secret must be private (backend only)
- ✅ Use HTTPS in production
- ✅ Verify authorized domains
- ✅ Regularly rotate secrets


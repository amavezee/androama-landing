# Troubleshooting Google OAuth

## Common Error: "Failed to initialize Google Sign-In"

### 1. Check Environment Variables

**Most Common Issue:** `VITE_GOOGLE_CLIENT_ID` is not set or not loaded.

#### Solution:
1. Create `.env` file in project root (if it doesn't exist)
2. Add your Google Client ID:
   ```env
   VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   ```
3. **Restart your dev server** after adding/changing `.env`:
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

### 2. Verify Google Client ID Format

Your Client ID should look like:
```
123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
```

**Common mistakes:**
- ❌ Missing `.apps.googleusercontent.com` suffix
- ❌ Extra spaces or quotes
- ❌ Using Client Secret instead of Client ID

### 3. Check Browser Console

Open browser DevTools (F12) → Console tab and look for:
- `Google Sign-In error: ...` - This will show the exact error
- Network errors when loading `accounts.google.com/gsi/client`
- CORS errors

### 4. Verify Google Cloud Console Settings

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Check **Authorized JavaScript origins**:
   - `http://localhost:5173` (for development)
   - `http://localhost:3000` (if using different port)
   - Your production domain (for production)
5. Check **Authorized redirect URIs**:
   - Same as above

### 5. Test Script Loading

Open browser console and run:
```javascript
// Check if Google script is loaded
console.log(window.google);

// Check environment variable
console.log(import.meta.env.VITE_GOOGLE_CLIENT_ID);
```

**Expected:**
- `window.google` should be an object (after clicking Google button)
- `VITE_GOOGLE_CLIENT_ID` should show your Client ID

### 6. Network Issues

If you see timeout errors:
- Check internet connection
- Check if `accounts.google.com` is accessible
- Try disabling ad blockers or VPN
- Check firewall settings

### 7. Development vs Production

**Development:**
- Use `http://localhost:5173` in authorized origins
- Client ID can be exposed (it's public)

**Production:**
- Use your actual domain in authorized origins
- Make sure `.env` file has production Client ID
- Rebuild after changing `.env`: `npm run build`

## Quick Fix Checklist

- [ ] `.env` file exists in project root
- [ ] `VITE_GOOGLE_CLIENT_ID` is set in `.env`
- [ ] Dev server restarted after adding `.env`
- [ ] Google Client ID format is correct
- [ ] Authorized origins include your domain/port
- [ ] No ad blockers blocking Google scripts
- [ ] Internet connection is working
- [ ] Browser console shows no errors

## Alternative: Disable Google Sign-In Temporarily

If you don't have Google OAuth set up yet, you can:

1. **Hide the Google button** (comment it out in Login.tsx and Register.tsx)
2. **Or** set a dummy Client ID to prevent errors:
   ```env
   VITE_GOOGLE_CLIENT_ID=disabled
   ```
   (The code will show a helpful error message)

## Still Having Issues?

1. Check browser console for detailed error messages
2. Verify your Google OAuth setup in Google Cloud Console
3. Make sure you've enabled Google+ API or Google Identity Services
4. Check that your OAuth consent screen is configured

## Testing Without Google OAuth

You can still use the application with email/password authentication. Google OAuth is optional.


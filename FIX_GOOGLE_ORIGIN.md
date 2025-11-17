# Fix: "The given origin is not allowed for the given client ID"

## Quick Fix Steps

### 1. Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### 2. Navigate to Your OAuth Client
1. Click on **APIs & Services** → **Credentials**
2. Find your OAuth 2.0 Client ID: `545048780620-oen09v389mvqikcts5u57vug6hga9oif.apps.googleusercontent.com`
3. Click on it to edit

### 3. Add Authorized Origins
In the **Authorized JavaScript origins** section, click **+ ADD URI** and add:

```
http://localhost:5173
http://localhost:3000
```

**Important:** 
- Include the `http://` protocol
- Include the port number (`:5173` or `:3000`)
- No trailing slash

### 4. Add Authorized Redirect URIs
In the **Authorized redirect URIs** section, click **+ ADD URI** and add:

```
http://localhost:5173
http://localhost:3000
```

### 5. Save
Click **SAVE** at the bottom

### 6. Wait a Few Seconds
Google's changes can take 1-2 minutes to propagate

### 7. Test Again
- Refresh your browser page
- Clear browser cache if needed (Ctrl+Shift+Delete)
- Try the Google Sign-In button again

## For Production

When you deploy to production, add your production domain:

**Authorized JavaScript origins:**
```
https://yourdomain.com
https://www.yourdomain.com
```

**Authorized redirect URIs:**
```
https://yourdomain.com
https://www.yourdomain.com
```

## Still Not Working?

1. **Check the exact URL in your browser** - Make sure it matches exactly what you added
2. **Check browser console** - Look for any other errors
3. **Try incognito mode** - Rules out cache issues
4. **Verify Client ID** - Make sure you're using the correct one in `.env`

## Common Mistakes

❌ **Wrong format:**
- `localhost:5173` (missing http://)
- `http://localhost` (missing port)
- `http://localhost:5173/` (trailing slash)

✅ **Correct format:**
- `http://localhost:5173`
- `http://localhost:3000`


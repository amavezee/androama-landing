# 🚨 URGENT: Fix Google OAuth - Complete Solution

## Problem 1: "Origin not allowed" (403 Error)

**This is the MAIN issue!** Your Google Cloud Console doesn't have `http://localhost:5173` in authorized origins.

### ✅ Fix This First:

1. **Go to**: https://console.cloud.google.com/apis/credentials
2. **Click** on your OAuth 2.0 Client ID: `545048780620-oen09v389mvqikcts5u57vug6hga9oif`
3. **Scroll to "Authorized JavaScript origins"**
4. **Click "+ ADD URI"** if `http://localhost:5173` is NOT there
5. **Add exactly**: `http://localhost:5173` (no trailing slash!)
6. **Scroll to "Authorized redirect URIs"**
7. **Click "+ ADD URI"** if `http://localhost:5173` is NOT there  
8. **Add exactly**: `http://localhost:5173` (no trailing slash!)
9. **Click SAVE** (bottom of page)
10. **Wait 2-3 minutes** for Google to update

### ⚠️ Common Mistakes:
- ❌ Adding `http://localhost:5173/` (with trailing slash)
- ❌ Adding `https://localhost:5173` (wrong protocol)
- ❌ Forgetting to click SAVE
- ❌ Not waiting for changes to propagate

---

## Problem 2: 404 Error on `/api/auth/google`

The backend route exists but needs restart.

### ✅ Fix:

1. **Stop backend** (Ctrl+C in backend terminal)
2. **Start backend**:
   ```bash
   cd "D:\projekti\bolt androama\project\backend"
   uvicorn app.main:app --reload
   ```
3. **Verify route exists**:
   - Go to: http://localhost:8000/docs
   - Look for `/api/auth/google` in the list

---

## Problem 3: Frontend Not Loading Client ID

### ✅ Fix:

1. **Stop frontend** (Ctrl+C)
2. **Verify `.env` file exists** in project root:
   ```env
   VITE_GOOGLE_CLIENT_ID=545048780620-oen09v389mvqikcts5u57vug6hga9oif.apps.googleusercontent.com
   VITE_API_URL=http://localhost:8000
   ```
3. **Restart frontend**:
   ```bash
   cd "D:\projekti\bolt androama\project"
   npm run dev
   ```

---

## Complete Restart Sequence:

```bash
# 1. Stop everything (Ctrl+C in both terminals)

# 2. Start Backend (Terminal 1)
cd "D:\projekti\bolt androama\project\backend"
uvicorn app.main:app --reload

# 3. Start Frontend (Terminal 2 - NEW terminal)
cd "D:\projekti\bolt androama\project"
npm run dev
```

---

## Test After Fixes:

1. Open: http://localhost:5173/register
2. Open DevTools (F12) → Console
3. Check for errors
4. Click "Sign in with Google"
5. Should see Google sign-in popup

---

## Still Not Working?

**Check these in order:**

1. ✅ Is `http://localhost:5173` in Google Cloud Console authorized origins?
2. ✅ Did you click SAVE in Google Cloud Console?
3. ✅ Did you wait 2-3 minutes after saving?
4. ✅ Is backend running on port 8000?
5. ✅ Is frontend running on port 5173?
6. ✅ Did you restart BOTH servers after changing `.env`?
7. ✅ Check browser console for exact error message

**Share the exact error message from browser console!**


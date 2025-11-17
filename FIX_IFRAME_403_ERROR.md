# 🔧 Fix 403 Error: App Running Inside Iframe

## The Problem

**Google Identity Services (GIS) does NOT work when your app is running inside an iframe.**

Even though:
- ✅ Your OAuth configuration is correct
- ✅ Client ID is correct
- ✅ Origins are configured properly
- ✅ Consent screen is published

You'll still get **403 errors** if the app itself is inside an iframe.

## Why This Happens

Google's security policy prevents the Google Sign-In button from working in nested iframes. The button creates its own iframe, and Google blocks nested iframe scenarios.

## How to Check

The code now automatically detects if you're in an iframe. Check your browser console - you'll see:

```
❌ CRITICAL: App is running inside an iframe!
```

Or check manually:
1. Open browser console (F12)
2. Run: `window.self !== window.top`
3. If `true`, you're in an iframe

## Solutions

### Solution 1: Open App Directly (Recommended)
**Don't embed the app in an iframe.**

1. Open the app directly: `http://localhost:5173/login`
2. Do NOT embed it in another page using `<iframe>`
3. If you have a parent app, open the login page in a **new window/tab** instead

### Solution 2: Check Browser Extensions
Some browser extensions wrap pages in iframes:
1. Disable browser extensions temporarily
2. Try in Incognito/Private mode (extensions usually disabled)
3. If it works in Incognito, an extension is causing the issue

### Solution 3: Check Your Setup
If you're embedding the app:

**❌ Don't do this:**
```html
<!-- Parent page -->
<iframe src="http://localhost:5173/login"></iframe>
```

**✅ Do this instead:**
```html
<!-- Parent page -->
<a href="http://localhost:5173/login" target="_blank">Open Login</a>
<!-- Opens in new tab -->
```

Or use `window.open()`:
```javascript
window.open('http://localhost:5173/login', '_blank');
```

### Solution 4: Use Popup Window for OAuth
If you must embed, handle OAuth in a popup:

1. Don't embed the login page
2. Open login in a popup window
3. Handle OAuth callback in the popup
4. Communicate back to parent window when done

## Common Scenarios

### Scenario 1: Development Server
If you're running the app normally:
- ✅ Should work fine
- ✅ Not in an iframe
- If you get iframe error, check browser extensions

### Scenario 2: Embedded in Another App
If you're embedding this app:
- ❌ Won't work in iframe
- ✅ Open in new window/tab instead
- ✅ Or use popup for OAuth flow

### Scenario 3: Browser Extension
Some extensions wrap pages:
- Check if extensions are active
- Try Incognito mode
- Disable extensions one by one to find the culprit

## Verification

After fixing, the console should show:
```
🔍 Google OAuth Debug Info:
  - Running in iframe: false ✅ (Good - not in iframe)
```

If you see `true`, you're still in an iframe and need to fix it.

## Technical Details

Google Identity Services checks:
1. `window.self !== window.top` - detects iframe
2. If true, it blocks the request with 403
3. This is a security feature, not a bug

The error message you see:
```
[GSI_LOGGER]: The given origin is not allowed for the given client ID.
```

This is misleading - the real issue is the iframe, not the origin configuration.

## Quick Test

1. Open: `http://localhost:5173/login` **directly** (not embedded)
2. Open browser console
3. Check for iframe detection message
4. If no iframe error, the 403 should be gone (assuming OAuth is configured correctly)

## Summary

**The 403 error is caused by the app running in an iframe, not by OAuth configuration issues.**

Fix: **Open the app directly, not embedded in an iframe.**


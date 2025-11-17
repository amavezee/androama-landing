# Production Setup for androama.com

## Google Cloud Console Configuration

### Add Production Origins

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click your OAuth 2.0 Client ID: `545048780620-oen09v389mvqikcts5u57vug6hga9oif`
3. Under **Authorized JavaScript origins**, add:
   ```
   https://androama.com
   https://www.androama.com
   ```
4. Under **Authorized redirect URIs**, add:
   ```
   https://androama.com
   https://www.androama.com
   ```
5. Click **SAVE**

### Your Complete Authorized Origins Should Be:

**Authorized JavaScript origins:**
- `http://localhost:5173` (development)
- `http://localhost:3000` (development)
- `https://androama.com` (production)
- `https://www.androama.com` (production)

**Authorized redirect URIs:**
- `http://localhost:5173` (development)
- `http://localhost:3000` (development)
- `https://androama.com` (production)
- `https://www.androama.com` (production)

## Environment Variables

### Frontend (.env) - Already Updated
```env
VITE_API_URL=http://localhost:8000
# For production, uncomment and use:
# VITE_API_URL=https://api.androama.com
```

### Backend (backend/.env) - Already Updated
```env
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,https://androama.com,https://www.androama.com
```

## Production Deployment Checklist

- [ ] Google Console has production origins configured
- [ ] Frontend `.env` has production API URL (or use build-time env vars)
- [ ] Backend `.env` has production CORS origins
- [ ] Backend has production `DATABASE_URL`
- [ ] Backend has strong `SECRET_KEY` (generate with `openssl rand -hex 32`)
- [ ] SSL certificates configured (HTTPS)
- [ ] Database is accessible from production server
- [ ] Nginx configured to proxy `/api` to backend

## Build for Production

### Frontend:
```bash
npm run build
# Output in dist/ folder
```

### Backend:
```bash
cd backend
# Use Docker or systemd service
docker-compose up -d
```

## Testing Production Setup

1. After deploying, test Google Sign-In on:
   - https://androama.com/login
   - https://www.androama.com/login

2. Verify:
   - Google Sign-In button appears
   - No origin errors in console
   - Login works correctly
   - User is created in database

## Notes

- Google OAuth requires HTTPS in production
- Make sure your domain has valid SSL certificate
- CORS origins must match exactly (including www subdomain)
- Changes in Google Console can take 1-2 minutes to propagate




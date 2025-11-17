# 🚀 Quick Start - ANDROAMA Deployment

## ✅ What's Ready

- ✅ **PostgreSQL Support**: Code automatically detects and uses PostgreSQL when `DATABASE_URL` starts with `postgresql://`
- ✅ **Google OAuth**: Fully configured, just needs credentials in `.env` files
- ✅ **Environment Templates**: `env.example` files created for both frontend and backend
- ✅ **Complete Setup Guide**: See `SETUP_COMPLETE.md` for detailed instructions

## 📋 Before You Deploy

### 1. Push Everything to GitHub

```bash
cd "D:\projekti\bolt androama\project"
git add .
git commit -m "Production setup: PostgreSQL support, env examples, complete deployment guide"
git push origin main
```

### 2. On Your VPS - Clone Repository

```bash
cd /var/www  # or your preferred directory
git clone https://github.com/amavezee/androama-landing.git androama
cd androama
```

### 3. Setup PostgreSQL

```bash
# Install PostgreSQL
sudo apt update
sudo apt install -y postgresql postgresql-contrib

# Create database
sudo -u postgres psql
CREATE DATABASE androama_db;
CREATE USER androama_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE androama_db TO androama_user;
\q
```

### 4. Configure Environment Files

**Backend (`backend/.env`):**
```env
DATABASE_URL=postgresql://androama_user:your_password@localhost:5432/androama_db
SECRET_KEY=generate-with: python3 -c "import secrets; print(secrets.token_urlsafe(32))"
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
CORS_ORIGINS=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

**Frontend (`.env`):**
```env
VITE_API_URL=https://api.yourdomain.com
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
VITE_BETA_ACCESS_PASSWORD=androama2025beta
```

### 5. Get Google OAuth Credentials

1. Go to https://console.cloud.google.com/
2. APIs & Services > Credentials
3. Create OAuth 2.0 Client ID
4. Add authorized origins: `https://yourdomain.com`
5. Add redirect URI: `https://yourdomain.com/login`
6. Copy Client ID and Secret

### 6. Deploy

Follow the complete guide in `SETUP_COMPLETE.md` for:
- Backend setup with systemd
- Frontend build
- Nginx configuration
- SSL setup
- Testing

## 🔑 Key Points

1. **Database**: The code automatically uses PostgreSQL when `DATABASE_URL` starts with `postgresql://`
2. **OAuth Secrets**: Go in `.env` files (NOT in git - already in .gitignore)
3. **Persistence**: PostgreSQL ensures all data persists across restarts
4. **Security**: `.env` files are excluded from git automatically

## 📚 Full Documentation

- **Complete Setup**: `SETUP_COMPLETE.md` - Step-by-step deployment guide
- **Deployment**: `DEPLOYMENT.md` - Original deployment guide
- **Backend README**: `backend/README.md` - Backend-specific setup

## ⚠️ Important Notes

- Never commit `.env` files (already in .gitignore)
- Always use PostgreSQL in production (not SQLite)
- Generate strong passwords for database and SECRET_KEY
- Keep Google OAuth secrets secure
- Test everything after deployment

## 🆘 Need Help?

Check `SETUP_COMPLETE.md` for detailed troubleshooting section.


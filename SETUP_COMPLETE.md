# 🚀 ANDROAMA Complete Setup Guide

This guide will help you set up everything from scratch, including PostgreSQL database and Google OAuth.

## ✅ Pre-Deployment Checklist

Before deploying, make sure you have:

- [ ] VPS with Ubuntu 20.04+ (or similar Linux)
- [ ] Domain name pointing to your VPS (optional but recommended)
- [ ] Google Cloud Console account (for OAuth)
- [ ] SSH access to your VPS
- [ ] All code pushed to GitHub

---

## 📦 Step 1: Verify Everything is Pushed to GitHub

```bash
# On your local machine
cd "D:\projekti\bolt androama\project"

# Check git status
git status

# If there are uncommitted changes, commit them
git add .
git commit -m "Final setup: PostgreSQL support, OAuth config, env examples"

# Push to GitHub
git push origin main
```

**Verify on GitHub:**
- ✅ `backend/` folder exists
- ✅ `src/` folder exists  
- ✅ `backend/env.example` exists
- ✅ `env.example` exists
- ✅ `.gitignore` excludes `.env` files
- ✅ `requirements.txt` includes `psycopg2-binary`

---

## 🗄️ Step 2: PostgreSQL Setup (VPS)

### 2.1 Install PostgreSQL

```bash
# SSH into your VPS
ssh user@your-vps-ip

# Update system
sudo apt update

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Check PostgreSQL is running
sudo systemctl status postgresql
```

### 2.2 Create Database and User

```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL prompt, run these commands:
CREATE DATABASE androama_db;
CREATE USER androama_user WITH PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE androama_db TO androama_user;
ALTER USER androama_user CREATEDB;  # Allow creating databases (for migrations)
\q
```

**⚠️ IMPORTANT:** Replace `your_secure_password_here` with a strong password!

### 2.3 Test Database Connection

```bash
# Test connection
sudo -u postgres psql -d androama_db -U androama_user -h localhost

# If prompted for password, enter the password you set
# Type \q to exit
```

---

## 🔐 Step 3: Google OAuth Setup

### 3.1 Create OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Go to **APIs & Services** > **Credentials**
4. Click **+ CREATE CREDENTIALS** > **OAuth client ID**
5. If prompted, configure OAuth consent screen first:
   - User Type: **External** (or Internal if using Google Workspace)
   - App name: **ANDROAMA**
   - User support email: Your email
   - Developer contact: Your email
   - Click **Save and Continue**
   - Scopes: Click **Save and Continue** (default is fine)
   - Test users: Add your email (for testing)
   - Click **Save and Continue**
6. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: **ANDROAMA Web Client**
   - **Authorized JavaScript origins:**
     - `http://localhost:5173` (for development)
     - `https://yourdomain.com` (for production)
     - `https://www.yourdomain.com` (if using www)
   - **Authorized redirect URIs:**
     - `http://localhost:5173/login` (for development)
     - `https://yourdomain.com/login` (for production)
     - `https://www.yourdomain.com/login` (if using www)
   - Click **Create**
7. **Copy the Client ID and Client Secret** - you'll need these!

### 3.2 Save OAuth Credentials

You'll add these to your `.env` files in the next step.

---

## 📝 Step 4: Configure Environment Variables

### 4.1 Backend `.env` File

On your VPS:

```bash
# Navigate to project directory
cd /var/www/androama  # or wherever you cloned the repo

# Go to backend
cd backend

# Copy example file
cp env.example .env

# Edit .env file
nano .env
```

**Fill in these values:**

```env
# Database - Use PostgreSQL!
DATABASE_URL=postgresql://androama_user:your_secure_password@localhost:5432/androama_db

# Generate secret key: python3 -c "import secrets; print(secrets.token_urlsafe(32))"
SECRET_KEY=your-generated-secret-key-here

# JWT Token Expiry
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Google OAuth (from Step 3)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here

# CORS Origins (your domain)
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Frontend URL
FRONTEND_URL=https://yourdomain.com

# Environment
ENVIRONMENT=production
```

**Generate SECRET_KEY:**
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 4.2 Frontend `.env` File

```bash
# Go back to project root
cd /var/www/androama

# Copy example file
cp env.example .env

# Edit .env file
nano .env
```

**Fill in these values:**

```env
# API URL (your backend)
VITE_API_URL=https://api.yourdomain.com
# OR if same domain:
# VITE_API_URL=https://yourdomain.com

# Google OAuth Client ID (same as backend)
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com

# Beta Access Password
VITE_BETA_ACCESS_PASSWORD=androama2025beta

# Beta Gate Enabled
VITE_BETA_GATE_ENABLED=true
```

---

## 🚀 Step 5: Deploy Backend

### 5.1 Install Python Dependencies

```bash
cd /var/www/androama/backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt
```

### 5.2 Initialize Database

```bash
# Make sure venv is activated
source venv/bin/activate

# Run database initialization
python init_db.py
```

**Expected output:**
```
Creating database tables...
[OK] Database tables created
[OK] Admin user created: admin@androama.com
  Password: admin123
[OK] Welcome post created successfully
[OK] Beta password created: androama2025beta

[OK] Database initialization complete!
```

### 5.3 Test Backend

```bash
# Run backend server
uvicorn app.main:app --host 0.0.0.0 --port 8000

# In another terminal, test:
curl http://localhost:8000/api/health
```

**Expected:** `{"status":"healthy"}`

Press `Ctrl+C` to stop.

### 5.4 Setup Systemd Service

```bash
sudo nano /etc/systemd/system/androama-backend.service
```

**Add this content:**

```ini
[Unit]
Description=ANDROAMA Backend API
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/androama/backend
Environment="PATH=/var/www/androama/backend/venv/bin"
ExecStart=/var/www/androama/backend/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Enable and start:**

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service (starts on boot)
sudo systemctl enable androama-backend

# Start service
sudo systemctl start androama-backend

# Check status
sudo systemctl status androama-backend

# View logs
sudo journalctl -u androama-backend -f
```

---

## 🎨 Step 6: Deploy Frontend

### 6.1 Install Node Dependencies

```bash
cd /var/www/androama

# Install dependencies
npm install
```

### 6.2 Build Frontend

```bash
# Build for production
npm run build

# This creates a 'dist' folder
ls -la dist
```

---

## 🌐 Step 7: Setup Nginx

### 7.1 Install Nginx

```bash
sudo apt install -y nginx
```

### 7.2 Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/androama
```

**Add this configuration:**

```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;  # OR yourdomain.com

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/androama/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # Frontend routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy (if using same domain)
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**⚠️ Replace `yourdomain.com` with your actual domain!**

### 7.3 Enable Site

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/androama /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

---

## 🔒 Step 8: Setup SSL (Let's Encrypt)

```bash
# Install certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# Follow prompts:
# - Enter your email
# - Agree to terms
# - Choose whether to redirect HTTP to HTTPS (recommended: Yes)

# Test auto-renewal
sudo certbot renew --dry-run
```

**After SSL is set up, update your `.env` files to use `https://` URLs!**

---

## ✅ Step 9: Verify Everything Works

### 9.1 Test Backend

```bash
# Check service
sudo systemctl status androama-backend

# Test API
curl https://api.yourdomain.com/api/health
# Should return: {"status":"healthy"}
```

### 9.2 Test Frontend

Visit: `https://yourdomain.com`

### 9.3 Test Database Persistence

1. Create a test account
2. Add email to beta waitlist
3. Create a community post
4. Restart backend: `sudo systemctl restart androama-backend`
5. Verify all data is still there

### 9.4 Test Google OAuth

1. Go to login page
2. Click "Sign in with Google"
3. Complete OAuth flow
4. Verify you're logged in

---

## 🔄 Step 10: Update from GitHub

When you push new changes:

```bash
# SSH into VPS
cd /var/www/androama

# Pull latest changes
git pull origin main

# Backend: Update dependencies if needed
cd backend
source venv/bin/activate
pip install -r requirements.txt

# Run database migrations (safe to run multiple times)
python init_db.py

# Restart backend
sudo systemctl restart androama-backend

# Frontend: Rebuild
cd ..
npm install  # if package.json changed
npm run build

# Restart nginx
sudo systemctl restart nginx
```

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check logs
sudo journalctl -u androama-backend -n 100

# Check if port is in use
sudo netstat -tulpn | grep 8000

# Check database connection
cd /var/www/androama/backend
source venv/bin/activate
python -c "from app.database import engine; engine.connect()"
```

### Database connection errors
- Verify PostgreSQL is running: `sudo systemctl status postgresql`
- Check `.env` file has correct `DATABASE_URL`
- Verify database user permissions: `sudo -u postgres psql -d androama_db -U androama_user`

### Google OAuth not working
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in backend `.env`
- Verify `VITE_GOOGLE_CLIENT_ID` in frontend `.env`
- Check Google Console: Authorized origins and redirect URIs match your domain
- Check backend logs: `sudo journalctl -u androama-backend -f`

### Frontend not loading
- Check nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Verify `dist` folder exists: `ls -la /var/www/androama/dist`
- Check nginx config: `sudo nginx -t`
- Rebuild frontend: `npm run build`

### CORS errors
- Update `CORS_ORIGINS` in backend `.env` with your actual domain
- Restart backend: `sudo systemctl restart androama-backend`

---

## 📋 Final Checklist

- [ ] PostgreSQL installed and database created
- [ ] Backend `.env` file configured with PostgreSQL URL
- [ ] Google OAuth credentials added to both `.env` files
- [ ] Backend service running: `sudo systemctl status androama-backend`
- [ ] Frontend built: `ls -la dist`
- [ ] Nginx configured and running
- [ ] SSL certificate installed
- [ ] Website accessible at `https://yourdomain.com`
- [ ] API accessible at `https://api.yourdomain.com/api/health`
- [ ] Can register/login
- [ ] Google OAuth works
- [ ] Database persists data (test by restarting backend)
- [ ] Admin panel accessible (login as `admin@androama.com` / `admin123`)

---

## 🎉 You're Done!

Your ANDROAMA website should now be fully functional with:
- ✅ PostgreSQL database (persistent)
- ✅ Google OAuth login
- ✅ All features working
- ✅ SSL/HTTPS enabled
- ✅ Production-ready deployment

**Next Steps:**
- Change admin password after first login
- Set up regular database backups
- Monitor logs for any issues
- Update Google OAuth consent screen to "Production" when ready


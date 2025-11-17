# ANDROAMA VPS Deployment Guide

This guide will help you deploy the ANDROAMA web platform (frontend + backend) to your VPS with persistent database and proper configuration.

## Prerequisites

- VPS with Ubuntu 20.04+ or similar Linux distribution
- Domain name pointing to your VPS (optional but recommended)
- SSH access to your VPS
- Python 3.9+ installed
- Node.js 18+ and npm installed
- PostgreSQL (recommended) or SQLite (for testing)
- Nginx (for reverse proxy)
- SSL certificate (Let's Encrypt recommended)

## Step 1: Clone Repository on VPS

```bash
# SSH into your VPS
ssh user@your-vps-ip

# Navigate to your web directory (e.g., /var/www or /home/user)
cd /var/www  # or your preferred directory

# Clone the repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git androama
cd androama
```

## Step 2: Backend Setup

### 2.1 Install Python Dependencies

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

### 2.2 Configure Environment Variables

```bash
# Create .env file
nano .env
```

Add the following (update with your actual values):

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/androama_db
# OR for SQLite (not recommended for production):
# DATABASE_URL=sqlite:///./androama.db

# JWT Secret (generate a strong random string)
SECRET_KEY=your-super-secret-jwt-key-here-generate-random-string

# CORS Origins (your domain)
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Google OAuth (if using)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Frontend URL
FRONTEND_URL=https://yourdomain.com

# Access Token Expiry
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

**Generate SECRET_KEY:**
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 2.3 Setup PostgreSQL Database (Recommended)

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql

# In PostgreSQL prompt:
CREATE DATABASE androama_db;
CREATE USER androama_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE androama_db TO androama_user;
\q
```

Update `DATABASE_URL` in `.env`:
```
DATABASE_URL=postgresql://androama_user:your_secure_password@localhost:5432/androama_db
```

### 2.4 Initialize Database

```bash
# Make sure you're in backend directory with venv activated
cd backend
source venv/bin/activate

# Run database initialization
python init_db.py
```

### 2.5 Test Backend

```bash
# Run backend server
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Test in another terminal
curl http://localhost:8000/api/health
```

If successful, you should see: `{"status":"healthy"}`

Press `Ctrl+C` to stop the server.

## Step 3: Frontend Setup

### 3.1 Install Node Dependencies

```bash
# Go to project root
cd /var/www/androama

# Install dependencies
npm install
```

### 3.2 Configure Frontend Environment

```bash
# Create .env file
nano .env
```

Add:

```env
# API URL (your backend)
VITE_API_URL=https://api.yourdomain.com
# OR if same domain:
# VITE_API_URL=https://yourdomain.com/api

# Google OAuth Client ID
VITE_GOOGLE_CLIENT_ID=your-google-client-id

# Beta Access Password
VITE_BETA_ACCESS_PASSWORD=your-beta-password
```

### 3.3 Build Frontend

```bash
# Build for production
npm run build

# This creates a 'dist' folder with production-ready files
```

## Step 4: Setup Systemd Service for Backend

### 4.1 Create Service File

```bash
sudo nano /etc/systemd/system/androama-backend.service
```

Add:

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

### 4.2 Enable and Start Service

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

## Step 5: Setup Nginx Reverse Proxy

### 5.1 Install Nginx

```bash
sudo apt install nginx
```

### 5.2 Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/androama
```

Add:

```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;  # OR yourdomain.com/api

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

### 5.3 Enable Site and Test

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

## Step 6: Setup SSL with Let's Encrypt

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# Certbot will automatically update nginx config
# Test auto-renewal
sudo certbot renew --dry-run
```

## Step 7: Update Frontend Environment for Production

After SSL is set up, update frontend `.env`:

```env
VITE_API_URL=https://api.yourdomain.com
# OR if same domain:
# VITE_API_URL=https://yourdomain.com
```

Rebuild frontend:
```bash
cd /var/www/androama
npm run build
sudo systemctl restart nginx
```

## Step 8: Database Backup Setup (Important!)

### 8.1 Create Backup Script

```bash
sudo nano /usr/local/bin/androama-backup.sh
```

Add:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/androama"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# PostgreSQL backup
pg_dump -U androama_user androama_db > $BACKUP_DIR/db_backup_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "db_backup_*.sql" -mtime +7 -delete

echo "Backup completed: db_backup_$DATE.sql"
```

```bash
sudo chmod +x /usr/local/bin/androama-backup.sh
```

### 8.2 Setup Cron Job for Daily Backups

```bash
sudo crontab -e
```

Add:

```
0 2 * * * /usr/local/bin/androama-backup.sh
```

## Step 9: Verify Everything Works

### 9.1 Check Backend

```bash
# Check service status
sudo systemctl status androama-backend

# Check logs
sudo journalctl -u androama-backend -n 50

# Test API
curl https://api.yourdomain.com/api/health
```

### 9.2 Check Frontend

Visit: `https://yourdomain.com`

### 9.3 Test Database Persistence

1. Create a test account
2. Add email to beta waitlist
3. Create a community post
4. Restart backend service
5. Verify all data is still there

## Step 10: Monitoring (Optional but Recommended)

### 10.1 Setup Log Rotation

```bash
sudo nano /etc/logrotate.d/androama-backend
```

Add:

```
/var/log/androama-backend/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
}
```

## Troubleshooting

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
- Verify database user permissions

### Frontend not loading
- Check nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Verify `dist` folder exists: `ls -la /var/www/androama/dist`
- Check nginx config: `sudo nginx -t`

### CORS errors
- Update `CORS_ORIGINS` in backend `.env` with your actual domain
- Restart backend: `sudo systemctl restart androama-backend`

## Updating the Application

When you push new changes to GitHub:

```bash
# SSH into VPS
cd /var/www/androama

# Pull latest changes
git pull origin main  # or your branch name

# Backend: Update dependencies if needed
cd backend
source venv/bin/activate
pip install -r requirements.txt

# Run database migrations if any
python init_db.py  # This is safe to run multiple times

# Restart backend
sudo systemctl restart androama-backend

# Frontend: Rebuild
cd ..
npm install  # if package.json changed
npm run build

# Restart nginx
sudo systemctl restart nginx
```

## Security Checklist

- [ ] Strong SECRET_KEY in backend `.env`
- [ ] Strong database password
- [ ] SSL certificate installed
- [ ] Firewall configured (only ports 80, 443 open)
- [ ] Regular database backups
- [ ] `.env` files not in git (already in .gitignore)
- [ ] Database files not in git (already in .gitignore)
- [ ] Nginx security headers configured
- [ ] Regular system updates: `sudo apt update && sudo apt upgrade`

## Support

If you encounter issues:
1. Check backend logs: `sudo journalctl -u androama-backend -f`
2. Check nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify all environment variables are set correctly
4. Ensure all services are running: `sudo systemctl status androama-backend nginx postgresql`

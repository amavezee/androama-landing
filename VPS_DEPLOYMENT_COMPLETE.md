# Complete VPS Deployment Guide - ANDROAMA

## ✅ Repository Status

Your code is committed and ready to push to GitHub. Follow these steps:

## Step 1: Push to GitHub

### 1.1 Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `androama-web` (or your choice)
3. Description: "ANDROAMA Web Platform"
4. Choose **Private** (recommended)
5. **DO NOT** initialize with README (we have one)
6. Click "Create repository"

### 1.2 Connect and Push

```bash
cd "D:\projekti\bolt androama\project"

# Add remote (replace YOUR_USERNAME and YOUR_REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Rename branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

You'll be prompted for GitHub credentials. Use a Personal Access Token if 2FA is enabled.

## Step 2: VPS Deployment

### 2.1 Initial VPS Setup (One-time)

SSH into your VPS and run:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required software
sudo apt install -y python3 python3-pip python3-venv postgresql postgresql-contrib nginx certbot python3-certbot-nginx git

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installations
python3 --version  # Should be 3.9+
node --version     # Should be 18+
npm --version
```

### 2.2 Clone Repository

```bash
# Navigate to web directory
cd /var/www

# Clone repository
sudo git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git androama

# Set ownership
sudo chown -R $USER:$USER /var/www/androama
cd androama
```

### 2.3 Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file
nano .env
```

**Backend .env Configuration:**
```env
# Database (PostgreSQL recommended for production)
DATABASE_URL=postgresql://androama_user:YOUR_SECURE_PASSWORD@localhost:5432/androama_db

# JWT Secret (generate random string)
SECRET_KEY=GENERATE_THIS_WITH_COMMAND_BELOW

# CORS (your domain)
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Frontend URL
FRONTEND_URL=https://yourdomain.com

# Token expiry
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

**Generate SECRET_KEY:**
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

**Setup PostgreSQL Database:**
```bash
# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
```

In PostgreSQL prompt:
```sql
CREATE DATABASE androama_db;
CREATE USER androama_user WITH PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE androama_db TO androama_user;
ALTER USER androama_user CREATEDB;
\q
```

**Initialize Database:**
```bash
cd /var/www/androama/backend
source venv/bin/activate
python init_db.py
```

You should see:
```
[OK] Database tables created
[OK] Admin user created: admin@androama.com
[OK] Welcome post created successfully
[OK] Beta password created: androama2025beta
```

### 2.4 Create Systemd Service for Backend

```bash
sudo nano /etc/systemd/system/androama-backend.service
```

Paste this (update paths if different):
```ini
[Unit]
Description=ANDROAMA Backend API
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/androama/backend
Environment="PATH=/var/www/androama/backend/venv/bin"
ExecStart=/var/www/androama/backend/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

**Enable and Start Service:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable androama-backend
sudo systemctl start androama-backend

# Check status
sudo systemctl status androama-backend

# View logs
sudo journalctl -u androama-backend -f
```

**Verify Backend is Running:**
```bash
curl http://localhost:8000/api/health
```

Should return: `{"status":"healthy"}`

### 2.5 Frontend Setup

```bash
cd /var/www/androama

# Install dependencies
npm install

# Create .env file
nano .env
```

**Frontend .env Configuration:**
```env
# API URL (use your domain)
VITE_API_URL=https://api.yourdomain.com
# OR if same domain:
# VITE_API_URL=https://yourdomain.com

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your-google-client-id

# Beta Access Password
VITE_BETA_ACCESS_PASSWORD=your-beta-password
```

**Build Frontend:**
```bash
npm run build
```

This creates a `dist` folder with production files.

### 2.6 Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/androama
```

**For Separate API Subdomain (Recommended):**
```nginx
# Backend API - api.yourdomain.com
server {
    listen 80;
    server_name api.yourdomain.com;

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
        
        # Increase timeouts for long requests
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}

# Frontend - yourdomain.com
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/androama/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # Frontend routes (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static files caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**OR For Same Domain (Simpler):**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/androama/dist;
    index index.html;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # Frontend
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
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

    # Static files
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Enable Site:**
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/androama /etc/nginx/sites-enabled/

# Remove default (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

### 2.7 Setup SSL with Let's Encrypt

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
# For separate subdomain:
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# OR for same domain:
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Certbot will automatically update nginx config

# Test auto-renewal
sudo certbot renew --dry-run
```

### 2.8 Update Frontend Environment After SSL

After SSL is installed, update frontend `.env`:

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

## Step 3: Database Backup Setup (CRITICAL!)

```bash
# Create backup directory
sudo mkdir -p /var/backups/androama
sudo chown $USER:$USER /var/backups/androama

# Create backup script
sudo nano /usr/local/bin/androama-backup.sh
```

Paste:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/androama"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# PostgreSQL backup
export PGPASSWORD='your_database_password_here'
pg_dump -U androama_user -h localhost androama_db > $BACKUP_DIR/db_backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/db_backup_$DATE.sql

# Keep only last 30 days of backups
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: db_backup_$DATE.sql.gz"
```

```bash
sudo chmod +x /usr/local/bin/androama-backup.sh

# Setup daily backup at 2 AM
sudo crontab -e
```

Add this line:
```
0 2 * * * /usr/local/bin/androama-backup.sh >> /var/log/androama-backup.log 2>&1
```

## Step 4: Verify Everything Works

### 4.1 Test Backend
```bash
# Check service
sudo systemctl status androama-backend

# Test API
curl https://api.yourdomain.com/api/health
# OR if same domain:
curl https://yourdomain.com/api/health

# Should return: {"status":"healthy"}
```

### 4.2 Test Frontend
- Visit: `https://yourdomain.com`
- Should load the landing page
- Try logging in with: `admin@androama.com` / `admin123`

### 4.3 Test Database Persistence
1. Create a test account
2. Add email to beta waitlist
3. Create a community post
4. Restart backend: `sudo systemctl restart androama-backend`
5. Verify all data is still there

### 4.4 Check Logs
```bash
# Backend logs
sudo journalctl -u androama-backend -n 50

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

## Step 5: Updating After Code Changes

When you push new code to GitHub:

```bash
cd /var/www/androama

# Pull latest changes
git pull origin main

# Backend: Update if needed
cd backend
source venv/bin/activate
pip install -r requirements.txt  # If requirements changed
python init_db.py  # Safe to run multiple times (won't duplicate data)
sudo systemctl restart androama-backend

# Frontend: Rebuild
cd ..
npm install  # If package.json changed
npm run build
sudo systemctl restart nginx
```

## Troubleshooting

### Backend Not Starting
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

### Database Connection Errors
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -U androama_user -d androama_db -h localhost

# Check .env file
cat /var/www/androama/backend/.env | grep DATABASE_URL
```

### Frontend Not Loading
```bash
# Check nginx
sudo nginx -t
sudo systemctl status nginx

# Check dist folder exists
ls -la /var/www/androama/dist

# Check nginx error log
sudo tail -f /var/log/nginx/error.log
```

### CORS Errors
- Update `CORS_ORIGINS` in backend `.env` with your actual domain
- Restart backend: `sudo systemctl restart androama-backend`

### 502 Bad Gateway
- Backend might not be running: `sudo systemctl status androama-backend`
- Check backend logs: `sudo journalctl -u androama-backend -n 50`

## Security Checklist

- [ ] Strong SECRET_KEY in backend `.env`
- [ ] Strong database password
- [ ] SSL certificate installed
- [ ] Firewall configured (UFW recommended)
- [ ] `.env` files not accessible via web
- [ ] Database backups scheduled
- [ ] Regular system updates

### Setup Firewall
```bash
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp # HTTPS
sudo ufw enable
```

## Important Notes

1. **Database Persistence**: PostgreSQL data is stored in `/var/lib/postgresql/` - this persists across reboots
2. **Backend Service**: Runs automatically on boot via systemd
3. **Backups**: Run daily at 2 AM automatically
4. **Environment Variables**: Never commit `.env` files to git
5. **Updates**: Always test locally before deploying to production

## Support

If something doesn't work:
1. Check service status: `sudo systemctl status androama-backend nginx postgresql`
2. Check logs: `sudo journalctl -u androama-backend -f`
3. Verify environment variables are correct
4. Test database connection manually
5. Check nginx configuration: `sudo nginx -t`

## Next Steps After Deployment

1. Test all features:
   - User registration/login
   - Google OAuth
   - Profile editing
   - Community posts
   - Admin panel
   - Beta waitlist

2. Monitor logs for first few days:
   ```bash
   sudo journalctl -u androama-backend -f
   ```

3. Set up monitoring (optional):
   - Uptime monitoring (UptimeRobot, etc.)
   - Error tracking (Sentry, etc.)

4. Ready for Stripe integration!


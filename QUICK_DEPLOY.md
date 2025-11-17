# Quick VPS Deployment Checklist

## Pre-Deployment Checklist

- [ ] GitHub repository created and code pushed
- [ ] VPS with Ubuntu 20.04+ ready
- [ ] Domain name configured (optional)
- [ ] SSH access to VPS working

## Step-by-Step Deployment

### 1. Initial VPS Setup (One-time)

```bash
# SSH into VPS
ssh user@your-vps-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install required software
sudo apt install -y python3 python3-pip python3-venv postgresql postgresql-contrib nginx certbot python3-certbot-nginx git nodejs npm

# Install Node.js 18+ if needed
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### 2. Clone Repository

```bash
cd /var/www
sudo git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git androama
sudo chown -R $USER:$USER /var/www/androama
cd androama
```

### 3. Backend Setup

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

**Backend .env content:**
```env
DATABASE_URL=postgresql://androama_user:YOUR_PASSWORD@localhost:5432/androama_db
SECRET_KEY=GENERATE_RANDOM_STRING_HERE
CORS_ORIGINS=https://yourdomain.com
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FRONTEND_URL=https://yourdomain.com
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

**Generate SECRET_KEY:**
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

**Setup PostgreSQL:**
```bash
sudo -u postgres psql
```

In PostgreSQL:
```sql
CREATE DATABASE androama_db;
CREATE USER androama_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE androama_db TO androama_user;
\q
```

**Initialize database:**
```bash
cd /var/www/androama/backend
source venv/bin/activate
python init_db.py
```

### 4. Create Systemd Service

```bash
sudo nano /etc/systemd/system/androama-backend.service
```

Paste:
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

```bash
sudo systemctl daemon-reload
sudo systemctl enable androama-backend
sudo systemctl start androama-backend
sudo systemctl status androama-backend
```

### 5. Frontend Setup

```bash
cd /var/www/androama

# Install dependencies
npm install

# Create .env file
nano .env
```

**Frontend .env content:**
```env
VITE_API_URL=https://api.yourdomain.com
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_BETA_ACCESS_PASSWORD=your-beta-password
```

**Build frontend:**
```bash
npm run build
```

### 6. Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/androama
```

Paste (update domain names):
```nginx
# Backend API
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
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/androama/dist;
    index index.html;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    location / {
        try_files $uri $uri/ /index.html;
    }

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

    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/androama /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### 7. SSL Certificate

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

### 8. Verify Everything

```bash
# Check backend
sudo systemctl status androama-backend
curl https://api.yourdomain.com/api/health

# Check frontend
# Visit: https://yourdomain.com
```

### 9. Database Backup (Important!)

```bash
sudo nano /usr/local/bin/androama-backup.sh
```

Paste:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/androama"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
pg_dump -U androama_user androama_db > $BACKUP_DIR/db_backup_$DATE.sql
find $BACKUP_DIR -name "db_backup_*.sql" -mtime +7 -delete
echo "Backup completed: db_backup_$DATE.sql"
```

```bash
sudo chmod +x /usr/local/bin/androama-backup.sh
sudo crontab -e
# Add: 0 2 * * * /usr/local/bin/androama-backup.sh
```

## Updating After Code Changes

```bash
cd /var/www/androama
git pull origin main

# Backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
python init_db.py  # Safe to run multiple times
sudo systemctl restart androama-backend

# Frontend
cd ..
npm install
npm run build
sudo systemctl restart nginx
```

## Troubleshooting

**Backend not starting:**
```bash
sudo journalctl -u androama-backend -n 50
```

**Database connection error:**
- Check PostgreSQL: `sudo systemctl status postgresql`
- Verify .env DATABASE_URL
- Test connection: `psql -U androama_user -d androama_db`

**Frontend not loading:**
- Check nginx: `sudo nginx -t`
- Check logs: `sudo tail -f /var/log/nginx/error.log`
- Verify dist folder: `ls -la /var/www/androama/dist`


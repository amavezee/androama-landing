#!/bin/bash
set -e  # Exit on any error

cd /var/www/androama-landing

# Pull latest changes from GitHub
echo "🔄 Pulling latest changes from GitHub..."
git pull origin main

# Install/update npm dependencies
echo "📦 Installing npm dependencies..."
npm install

# Backend: Restart service
echo "🔧 Restarting backend service..."
sudo systemctl restart androama-backend

# Frontend: Build
echo "🏗️  Building frontend..."
npm run build

# Reload nginx (faster than restart)
echo "🔄 Reloading nginx..."
sudo systemctl reload nginx

echo "✅ Deployment complete!"

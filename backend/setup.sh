#!/bin/bash

# ANDROAMA Backend Setup Script
# Run this script on your VPS to set up the backend

echo "🚀 Setting up ANDROAMA Backend..."

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.11 or higher."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL is not installed. Installing..."
    sudo apt update
    sudo apt install -y postgresql postgresql-contrib
fi

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Install dependencies
echo "📥 Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your database credentials and secret key!"
fi

# Create database and user
echo "🗄️  Setting up PostgreSQL database..."
sudo -u postgres psql << EOF
CREATE DATABASE androama_db;
CREATE USER androama_user WITH PASSWORD 'androama_pass';
ALTER ROLE androama_user SET client_encoding TO 'utf8';
ALTER ROLE androama_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE androama_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE androama_db TO androama_user;
\q
EOF

# Initialize database
echo "🔧 Initializing database..."
python init_db.py

echo "✅ Setup complete!"
echo ""
echo "To start the backend server:"
echo "  source venv/bin/activate"
echo "  uvicorn app.main:app --host 0.0.0.0 --port 8000"
echo ""
echo "Or use Docker Compose:"
echo "  docker-compose up -d"


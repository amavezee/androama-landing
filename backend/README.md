# ANDROAMA Backend API

FastAPI backend for ANDROAMA platform with PostgreSQL database.

## Setup Instructions

### Option 1: Docker (Recommended)

1. Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

2. Start services:
   ```bash
   docker-compose up -d
   ```

3. Initialize database:
   ```bash
   docker-compose exec backend python init_db.py
   ```

### Option 2: Manual Setup

1. Install PostgreSQL:
   ```bash
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   ```

2. Create database:
   ```bash
   sudo -u postgres psql
   CREATE DATABASE androama_db;
   CREATE USER androama_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE androama_db TO androama_user;
   \q
   ```

3. Install Python dependencies:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

4. Configure environment:
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and secret key
   ```

5. Initialize database:
   ```bash
   python init_db.py
   ```

6. Run server:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get token
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - Logout

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

## Default Admin User

- Email: `admin@androama.com`
- Password: Set via `ADMIN_PASSWORD` env var (default: `admin123`)
- **⚠️ Change the admin password after first login!**

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - JWT secret key (generate a strong random key)
- `ALGORITHM` - JWT algorithm (default: HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES` - Token expiration (default: 30)
- `CORS_ORIGINS` - Allowed CORS origins (comma-separated)
- `ADMIN_PASSWORD` - Initial admin password

## Production Deployment

1. Use a strong `SECRET_KEY` (generate with: `openssl rand -hex 32`)
2. Set proper `CORS_ORIGINS` for your domain
3. Use environment variables or secrets management
4. Enable HTTPS with reverse proxy (Nginx)
5. Set up database backups
6. Configure firewall rules


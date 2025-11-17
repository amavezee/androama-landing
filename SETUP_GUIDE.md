# ANDROAMA Setup Guide

## ✅ What's Been Created

### Backend (FastAPI + PostgreSQL)
- ✅ Complete FastAPI backend structure
- ✅ PostgreSQL database models (Users, Sessions, Apps, Devices)
- ✅ JWT authentication system
- ✅ API endpoints for auth and user management
- ✅ Database initialization script with admin user seeding
- ✅ Docker setup for easy deployment
- ✅ Professional authentication with password hashing

### Frontend (React + TypeScript)
- ✅ Login page with professional UI
- ✅ Register page with validation
- ✅ Profile dropdown showing user edition
- ✅ Protected routes
- ✅ Auth context for state management
- ✅ API integration layer
- ✅ React Router setup

## 🚀 Quick Start

### 1. Install Frontend Dependencies
```bash
cd project
npm install
```

### 2. Set Up Backend

#### Option A: Docker (Easiest)
```bash
cd backend
cp .env.example .env
# Edit .env with your settings
docker-compose up -d
docker-compose exec backend python init_db.py
```

#### Option B: Manual Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set up PostgreSQL database
sudo -u postgres psql
CREATE DATABASE androama_db;
CREATE USER androama_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE androama_db TO androama_user;
\q

# Configure environment
cp .env.example .env
# Edit .env with your database URL and secret key

# Initialize database
python init_db.py
```

### 3. Configure Frontend
Create `.env` file in project root:
```env
VITE_API_URL=http://localhost:8000
```

### 4. Run Development Servers

**Backend:**
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd project
npm run dev
```

## 👤 Default Admin User

After running `init_db.py`, you'll have:
- **Email:** `admin@androama.com`
- **Password:** Set via `ADMIN_PASSWORD` env var (default: `admin123`)
- **Edition:** Ultimate
- **⚠️ IMPORTANT:** Change the password immediately!

## 📁 Project Structure

```
project/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          # FastAPI app
│   │   ├── database.py       # DB connection
│   │   ├── models.py        # SQLAlchemy models
│   │   ├── schemas.py       # Pydantic schemas
│   │   ├── auth.py          # Authentication logic
│   │   └── routers/
│   │       ├── auth.py      # Auth endpoints
│   │       └── users.py     # User endpoints
│   ├── requirements.txt
│   ├── init_db.py           # Database initialization
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── README.md
│
├── src/
│   ├── components/
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── ProfileDropdown.tsx
│   │   └── ProtectedRoute.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── lib/
│   │   └── api.ts           # API client
│   ├── App.tsx              # Router
│   ├── Home.tsx             # Home page
│   └── main.tsx
│
└── DEPLOYMENT.md            # VPS deployment guide
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

## 🎨 Features

### Profile Dropdown
- Shows user avatar (initials)
- Displays current edition with color-coded badge
- Quick access to profile, settings, admin panel (if admin)
- Professional dropdown with smooth animations

### Authentication
- Secure JWT token-based auth
- Password hashing with bcrypt
- Auto-login after registration
- Protected routes
- Token refresh handling

### UI/UX
- Professional login/register pages
- Smooth transitions and animations
- Responsive design
- Edition-specific color themes
- Glassmorphism effects

## 🔧 Configuration

### Backend Environment Variables (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/androama_db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
ADMIN_PASSWORD=your-admin-password
```

### Frontend Environment Variables (.env)
```env
VITE_API_URL=http://localhost:8000
```

## 📝 Next Steps

1. **Deploy to VPS:** Follow `DEPLOYMENT.md`
2. **Add more features:**
   - AppCenter (App catalog)
   - Device management
   - Subscription management
   - Email verification
   - Password reset

3. **Security enhancements:**
   - Rate limiting
   - CSRF protection
   - Email verification
   - Two-factor authentication (optional)

## 🐛 Troubleshooting

### Backend won't start
- Check PostgreSQL is running: `sudo systemctl status postgresql`
- Verify database credentials in `.env`
- Check port 8000 is available

### Frontend can't connect to API
- Verify `VITE_API_URL` in frontend `.env`
- Check CORS settings in backend `.env`
- Ensure backend is running on correct port

### Database errors
- Run `python init_db.py` to initialize tables
- Check database connection string
- Verify PostgreSQL user has proper permissions

## 📚 Documentation

- Backend API: `http://localhost:8000/docs` (FastAPI auto-generated docs)
- Deployment: See `DEPLOYMENT.md`
- Enterprise Plan: See `ENTERPRISE_UPGRADE_PLAN.md`


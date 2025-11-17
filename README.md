# ANDROAMA Web Platform

Professional Android device management platform with web interface, community hub, and admin panel.

## Features

- 🔐 **Authentication**: Email/password + Google OAuth
- 👤 **User Profiles**: Customizable nicknames, avatars, password management
- 💬 **Community Hub**: Posts, replies, likes, categories, search
- 🛡️ **Admin Panel**: Statistics, user management, BetaGate settings
- 📧 **Beta Waitlist**: Email collection with database persistence
- 🔒 **Beta Access Gate**: Password-protected beta access
- 📊 **Subscription System**: Free, Pro, Lifetime tiers (aligned with desktop app)
- 🎨 **Modern UI**: Dark theme with purple/pink gradients

## Tech Stack

### Frontend
- React + TypeScript
- Vite
- React Router
- Tailwind CSS
- Lucide Icons

### Backend
- FastAPI (Python)
- SQLAlchemy (ORM)
- PostgreSQL / SQLite
- JWT Authentication
- Google OAuth 2.0

## Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL (recommended) or SQLite

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Initialize database
python init_db.py

# Run server
uvicorn app.main:app --reload
```

### Frontend Setup

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Run development server
npm run dev

# Build for production
npm run build
```

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/androama_db
SECRET_KEY=your-secret-key-here
CORS_ORIGINS=http://localhost:5173
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FRONTEND_URL=http://localhost:5173
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_BETA_ACCESS_PASSWORD=your-beta-password
```

## Database

The application uses SQLAlchemy with support for:
- PostgreSQL (production recommended)
- SQLite (development/testing)

Database is initialized automatically with:
- Admin user: `admin@androama.com` / `admin123`
- Welcome post in community hub
- Beta password setting

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive VPS deployment instructions.

## Project Structure

```
project/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI application
│   │   ├── models.py          # Database models
│   │   ├── schemas.py         # Pydantic schemas
│   │   ├── auth.py            # Authentication logic
│   │   ├── database.py        # Database configuration
│   │   ├── oauth.py           # Google OAuth
│   │   └── routers/          # API endpoints
│   │       ├── auth.py        # Authentication routes
│   │       ├── users.py       # User management
│   │       ├── community.py   # Community posts/replies
│   │       ├── admin.py       # Admin panel
│   │       └── public.py      # Public endpoints
│   ├── init_db.py            # Database initialization
│   └── requirements.txt      # Python dependencies
├── src/
│   ├── components/           # React components
│   ├── contexts/             # React contexts
│   ├── pages/                # Page components
│   ├── lib/                  # Utilities and API client
│   └── App.tsx               # Main app component
├── .env                      # Environment variables (not in git)
└── package.json             # Node dependencies
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/profile/change-password` - Change password
- `POST /api/users/profile/mark-downloaded` - Mark app downloaded

### Community
- `GET /api/community/posts` - List posts
- `POST /api/community/posts` - Create post
- `GET /api/community/posts/{id}` - Get post
- `POST /api/community/posts/{id}/like` - Like post
- `POST /api/community/posts/{id}/replies` - Add reply

### Admin
- `GET /api/admin/stats` - Get statistics
- `GET /api/admin/users` - List all users
- `GET /api/admin/waitlist` - Get beta waitlist
- `GET /api/admin/beta-password` - Get BetaGate password
- `PUT /api/admin/beta-password` - Update BetaGate password

### Public
- `POST /api/public/beta-waitlist` - Join waitlist
- `GET /api/public/beta-password` - Get BetaGate password (public)

## License

Proprietary - ANDROAMA


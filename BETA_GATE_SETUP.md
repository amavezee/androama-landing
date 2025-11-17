# Beta Gate Setup Instructions

## Password Configuration

The beta gate password is set in `src/pages/BetaGate.tsx`. You can change it in two ways:

### Option 1: Environment Variable (Recommended)
Add to your `.env` file:
```
VITE_BETA_ACCESS_PASSWORD=your-secure-password-here
```

### Option 2: Direct Code Change
Edit `src/pages/BetaGate.tsx` line 3:
```typescript
const BETA_ACCESS_PASSWORD = 'your-secure-password-here';
```

## Default Password
- Default: `androama2025beta`
- **IMPORTANT**: Change this before going live!

## How It Works

1. **First Visit**: Users see the Beta Gate page
2. **Password Entry**: Users enter the beta access password
3. **Access Granted**: Password is stored in `sessionStorage` (clears when browser closes)
4. **Email Collection**: Users without password can join the waitlist
5. **Waitlist Emails**: Saved to `beta_waitlist` table in database

## Database Setup

Run the database migration to create the waitlist table:
```bash
cd backend
python init_db.py
```

This will create:
- `beta_waitlist` table for email collection

## Accessing Waitlist Emails

You can query the waitlist from your database:
```sql
SELECT email, created_at FROM beta_waitlist ORDER BY created_at DESC;
```

Or create an admin endpoint to view them (optional).


"""
Database initialization script
Creates tables and seeds initial admin user and welcome post
"""
from app.database import engine, Base, SessionLocal
from app.models import User, CommunityPost, AppSettings
from app.auth import get_password_hash
import os
import json
from dotenv import load_dotenv

load_dotenv()

def init_db():
    """Create all database tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("[OK] Database tables created")

def seed_admin():
    """Seed initial admin user"""
    db = SessionLocal()
    try:
        # Create or update admin user
        admin_password = "admin123"  # Fixed password for admin
        admin = db.query(User).filter(User.email == "admin@androama.com").first()
        
        if admin:
            # Update existing admin password and ensure admin status
            admin.password_hash = get_password_hash(admin_password)
            admin.is_admin = True
            admin.is_active = True
            admin.email_verified = True
            admin.subscription_status = "lifetime"
            admin.subscription_tier = "lifetime"
            admin.license_key = "ADMIN-LIFETIME-2025"
            admin.subscription_end = None
            db.commit()
            print(f"[OK] Admin user updated: admin@androama.com")
            print(f"  Password: {admin_password}")
        else:
            # Create new admin user
            admin = User(
                email="admin@androama.com",
                password_hash=get_password_hash(admin_password),
                username="admin",
                edition="ultimate",
                subscription_status="lifetime",
                subscription_tier="lifetime",
                license_key="ADMIN-LIFETIME-2025",
                subscription_end=None,  # Lifetime has no end date
                is_active=True,
                email_verified=True,
                is_admin=True,
                oauth_provider=None,
                oauth_id=None,
                avatar_url=None
            )
            db.add(admin)
            db.commit()
            print(f"[OK] Admin user created: admin@androama.com")
            print(f"  Password: {admin_password}")
    except Exception as e:
        print(f"[ERROR] Error seeding admin: {e}")
        db.rollback()
    finally:
        db.close()

def seed_welcome_post():
    """Seed welcome post for beta users"""
    db = SessionLocal()
    try:
        # Get admin user
        admin = db.query(User).filter(User.email == "admin@androama.com").first()
        if not admin:
            print("[SKIP] Admin user not found, skipping welcome post")
            return
        
        # Check if welcome post already exists
        existing_post = db.query(CommunityPost).filter(
            CommunityPost.title.ilike("%Welcome%Beta%")
        ).first()
        if existing_post:
            print("[OK] Welcome post already exists")
            return
        
        # Create welcome post
        welcome_post = CommunityPost(
            user_id=admin.id,
            title="🎉 Welcome to ANDROAMA Beta! Let's Build the Future Together",
            content="""Welcome to the ANDROAMA Community Hub! 🚀

We're thrilled to have you here as part of our beta testing program. Your feedback, experiences, and insights are invaluable as we continue to improve ANDROAMA and make it the best Android device management platform possible.

## What to Expect

As a beta user, you're getting early access to ANDROAMA's features and helping shape the product's future. We're committed to listening to your feedback and implementing improvements based on your real-world usage.

## How You Can Help

**🐛 Report Bugs**
Found something that's not working as expected? Please report it in the "Bug Reports" category. Include as much detail as possible:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Your ANDROAMA version and system specs

**💡 Share Feature Requests**
Have ideas for new features or improvements? We'd love to hear them! Post in the "Feature Requests" category and let's discuss how we can make ANDROAMA even better.

**📖 Share Your Experiences**
Whether it's a success story, a use case, or tips and tricks you've discovered, share them with the community! Your experiences help other users and inspire new features.

**❓ Ask Questions**
Not sure how something works? Need help with a specific feature? The community is here to help! Don't hesitate to ask questions in the "Discussions" category.

## Community Guidelines

- Be respectful and constructive in all interactions
- Search before posting to avoid duplicates
- Provide detailed information when reporting bugs
- Help others when you can
- Follow the category guidelines

## What's Next?

We'll be posting regular updates, announcements, and responding to your feedback here. Make sure to check back regularly and engage with the community!

Thank you for being part of the ANDROAMA journey. Together, we're building something amazing! 🎯

**The ANDROAMA Team**""",
            category="Announcements",
            tags=json.dumps(["welcome", "beta", "announcement", "getting-started"]),
            is_pinned=True,
            is_announcement=True,
            views=0,
            likes_count=0,
            replies_count=0
        )
        
        db.add(welcome_post)
        db.commit()
        print("[OK] Welcome post created successfully")
    except Exception as e:
        print(f"[ERROR] Error seeding welcome post: {e}")
        db.rollback()
    finally:
        db.close()

def seed_beta_password():
    """Seed default beta password"""
    db = SessionLocal()
    try:
        # Check if beta password already exists
        setting = db.query(AppSettings).filter(AppSettings.key == "beta_access_password").first()
        if setting:
            print("[OK] Beta password already exists")
            return
        
        # Create default beta password
        default_password = os.getenv("BETA_ACCESS_PASSWORD", "androama2025beta")
        setting = AppSettings(
            key="beta_access_password",
            value=default_password,
            description="Beta access password for ANDROAMA"
        )
        db.add(setting)
        db.commit()
        print(f"[OK] Beta password created: {default_password}")
    except Exception as e:
        print(f"[ERROR] Error seeding beta password: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("Initializing ANDROAMA database...")
    init_db()
    seed_admin()
    seed_welcome_post()
    seed_beta_password()
    print("\n[OK] Database initialization complete!")


"""
Script to create the first administrator user in the system.
Run this script after starting the database.

Usage:
    python create_admin.py
"""

from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models import User, UserRole
from auth import get_password_hash

def create_admin_user():
    """Creates the first administrator user"""
    
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Check if admin already exists
        admin_exists = db.query(User).filter(User.role == UserRole.ADMIN).first()
        
        if admin_exists:
            print("An administrator user already exists in the system!")
            print(f"   Username: {admin_exists.username}")
            print(f"   Email: {admin_exists.email}")
            return
        
        # Default admin data
        admin_username = "admin"
        admin_email = "admin@compia.com.br"
        admin_password = "admin123"
        
        # Create admin user
        admin_user = User(
            username=admin_username,
            email=admin_email,
            hashed_password=get_password_hash(admin_password),
            role=UserRole.ADMIN,
            is_active=True
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print("Administrator user created successfully!")
        print(f"   Username: {admin_username}")
        print(f"   Email: {admin_email}")
        print(f"   Password: {admin_password}")
        print("\nIMPORTANT: Change this password after first login!")
        
    except Exception as e:
        print(f"Error creating administrator user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()

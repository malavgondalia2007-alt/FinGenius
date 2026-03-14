import sys
import os
sys.path.append(os.getcwd())
try:
    from app.core.database import SessionLocal
    from app.models.models import User, UserProfile
    db = SessionLocal()
    user = db.query(User).filter(User.email == "haed@example.com").first()
    if user:
        profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
        print(f"User found: {user.email} (ID: {user.id})")
        if profile:
            print(f"Profile found: ID={profile.id}, onboarding_complete={profile.onboarding_complete}")
        else:
            print("Profile MISSING!")
    else:
        print("User haed@example.com MISSING!")
    db.close()
except Exception as e:
    print(f"Error: {e}")

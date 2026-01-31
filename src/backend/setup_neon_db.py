#!/usr/bin/env python
import sys
from pathlib import Path

# Add the backend directory to sys.path
backend_path = Path(__file__).parent
sys.path.insert(0, str(backend_path))

from app.core.database import engine, Base
from app.models.models import User, UserProfile, Expense, Income, Goal, Investment, SIPScheme
from sqlalchemy import text

print("=" * 60)
print("Neon DB Setup & Migration Script")
print("=" * 60)

try:
    # Test connection
    print("\n1. Testing database connection...")
    with engine.connect() as conn:
        result = conn.execute(text("SELECT version();"))
        version = result.fetchone()[0]
        print(f"✓ Connected successfully!")
        print(f"  PostgreSQL Version: {version.split(',')[0]}")
    
    # Create all tables
    print("\n2. Creating/updating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables created/updated successfully!")
    
    # List all tables
    print("\n3. Existing tables in database:")
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        """))
        tables = result.fetchall()
        if tables:
            for table in tables:
                print(f"  ✓ {table[0]}")
        else:
            print("  No tables found")
    
    print("\n" + "=" * 60)
    print("✓ Neon DB Setup Complete!")
    print("=" * 60)
    
except Exception as e:
    print(f"\n✗ Error: {e}")
    print("\nTroubleshooting:")
    print("1. Check your DATABASE_URL in .env file")
    print("2. Verify Neon database credentials")
    print("3. Ensure network access is enabled in Neon dashboard")
    print("4. Try: pip install psycopg2-binary")
    sys.exit(1)

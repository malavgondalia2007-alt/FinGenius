#!/usr/bin/env python
import sys
from pathlib import Path
import os

# Add the backend directory to sys.path
backend_path = Path(__file__).parent
sys.path.insert(0, str(backend_path))

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

print("=" * 60)
print("Testing Neon DB Connection")
print("=" * 60)

database_url = os.getenv('DATABASE_URL')
print(f"\nDatabase URL: {database_url[:50]}...")

try:
    from sqlalchemy import create_engine, text
    
    print("\n1. Creating engine...")
    engine = create_engine(
        database_url,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
        echo=False,
    )
    print("✓ Engine created")
    
    print("\n2. Testing connection...")
    with engine.connect() as conn:
        result = conn.execute(text("SELECT version();"))
        version = result.fetchone()[0]
        print(f"✓ Connected successfully!")
        print(f"  PostgreSQL Version: {version.split(',')[0]}")
    
    print("\n✓ Neon DB Connection Successful!")
    
except Exception as e:
    print(f"\n✗ Connection Error: {e}")
    print("\nSolution:")
    print("1. Verify your DATABASE_URL in .env")
    print("2. Check Neon console for correct credentials")
    print("3. Ensure IP is allowed in Neon firewall settings")

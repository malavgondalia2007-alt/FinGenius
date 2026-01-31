#!/usr/bin/env python
import sys
from pathlib import Path
from urllib.request import Request, urlopen
import json
import time

time.sleep(3)

print("\n=== Testing FinGenius Login API ===\n")

# Test 1: Login with correct credentials
print("Test 1: Login with correct credentials")
try:
    data = b'username=test@example.com&password=test123'
    req = Request(
        'http://localhost:8000/auth/login',
        data=data,
        headers={'Content-Type': 'application/x-www-form-urlencoded'},
        method='POST'
    )
    with urlopen(req, timeout=5) as response:
        result = json.loads(response.read().decode())
        print(f"Status: {response.status}")
        print(f"Response: {json.dumps(result, indent=2)}")
        access_token = result.get('access_token')
        print(f"✓ Login successful! Access token: {access_token[:20]}...")
except Exception as e:
    print(f"✗ Error: {e}")

# Test 2: Login with incorrect password
print("\n\nTest 2: Login with incorrect password")
try:
    data = b'username=test@example.com&password=wrongpassword'
    req = Request(
        'http://localhost:8000/auth/login',
        data=data,
        headers={'Content-Type': 'application/x-www-form-urlencoded'},
        method='POST'
    )
    with urlopen(req, timeout=5) as response:
        result = json.loads(response.read().decode())
        print(f"Status: {response.status}")
        print(f"Response: {result}")
except Exception as e:
    print(f"Expected error: {e}")

# Test 3: Health check
print("\n\nTest 3: Health check endpoint")
try:
    req = Request('http://localhost:8000/health', method='GET')
    with urlopen(req, timeout=5) as response:
        result = json.loads(response.read().decode())
        print(f"Status: {response.status}")
        print(f"Response: {result}")
        print("✓ Health check passed!")
except Exception as e:
    print(f"✗ Error: {e}")

print("\n=== All tests completed ===\n")

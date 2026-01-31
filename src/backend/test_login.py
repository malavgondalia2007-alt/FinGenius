import requests
import time
import json

time.sleep(3)
print("Testing login API...")

try:
    response = requests.post('http://localhost:8000/auth/login', data={'username': 'test@example.com', 'password': 'test123'})
    print(f'Status: {response.status_code}')
    print(f'Response: {response.text}')
except Exception as e:
    print(f'Error: {e}')
    import traceback
    traceback.print_exc()

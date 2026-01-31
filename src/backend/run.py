#!/usr/bin/env python
import sys
from pathlib import Path

# Add the backend directory to sys.path
backend_path = Path(__file__).parent
sys.path.insert(0, str(backend_path))

from app.main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

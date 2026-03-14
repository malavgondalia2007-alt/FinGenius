
# 🔧 Backend Troubleshooting Guide

## Common Issues & Fixes

---

### ❌ Issue: 500 Internal Server Error on API docs

**Cause:** Database not connected. All auth/CRUD endpoints need PostgreSQL.

**Quick Fix — Use SQLite (no PostgreSQL needed):**
```bash
cd backend
cp .env.example .env
# Edit .env and change DATABASE_URL to:
# DATABASE_URL=sqlite:///./fingenius.db
```

**Proper Fix — Start PostgreSQL with Docker:**
```bash
cd backend
docker compose up -d postgres   # Start only the database
cp .env.example .env
# Edit .env: DATABASE_URL=postgresql://fingenius:fingenius_password@localhost:5432/fingenius_db
python -m uvicorn app.main:app --reload --port 8000
```

**Verify:** Open http://localhost:8000/health — should show `"database": "connected"`

---

### ❌ Issue: Stock data returns empty or errors

**Cause:** Google Finance scraping can fail due to rate limiting or network issues.

**What happens now (after fix):**
- The endpoint returns `{"stocks": [], "source": "unavailable"}` instead of crashing with 500
- Frontend automatically falls back to last closing prices when backend returns empty data

**To test scraping manually:**
```bash
cd backend
python test_stocks_api.py
```

**If scraping consistently fails:**
- Google may be blocking your IP — try again in a few minutes
- Check your internet connection
- The frontend works fine with fallback data (no backend needed for stocks)

---

### ❌ Issue: Frontend doesn't connect to backend

**Checklist:**

1. **Is the backend running?**
   ```bash
   curl http://localhost:8000/health
   ```
   Should return JSON. If not, start the backend first.

2. **Is the frontend .env correct?**
   Create `.env` in the project root (NOT in backend/):
   ```
   VITE_API_URL=http://localhost:8000
   ```

3. **CORS errors in browser console?**
   The backend allows all origins by default. If you still see CORS errors, check that the backend is actually running on port 8000.

4. **Frontend falls back to localStorage automatically.**
   If the backend is unreachable, auth and data operations use browser localStorage. You'll see "Backend unavailable, using localStorage mode" in the browser console.

---

### ❌ Issue: Backend crashes on startup

**Cause:** Missing environment variables or Python packages.

**Fix:**
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Mac/Linux
# .\venv\Scripts\Activate.ps1  # Windows

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Create .env from example
cp .env.example .env

# Start (the app now has fallback defaults for all config)
python -m uvicorn app.main:app --reload --port 8000
```

The backend now starts even without a `.env` file — it uses SQLite and a dev secret key as defaults.

---

### ❌ Issue: "alembic upgrade head" fails

**Cause:** Database doesn't exist yet or connection string is wrong.

**Fix:** The backend now auto-creates tables on startup (no need to run alembic manually for development). Just start the server:
```bash
python -m uvicorn app.main:app --reload --port 8000
```

Tables are created automatically via `Base.metadata.create_all()`.

For production with PostgreSQL migrations:
```bash
# Make sure PostgreSQL is running and DATABASE_URL is correct in .env
alembic upgrade head
```

---

### ❌ Issue: Docker "port already in use"

**Fix:**
```bash
# Check what's using the port
lsof -ti:8000 | xargs kill -9   # Mac/Linux
lsof -ti:5432 | xargs kill -9   # Kill local PostgreSQL

# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

---

## 🏗️ Architecture Overview

```
Frontend (localhost:3000)
    ↓ VITE_API_URL
Backend (localhost:8000)
    ↓ DATABASE_URL
PostgreSQL (localhost:5432) or SQLite (local file)
```

**What works WITHOUT a database:**
- ✅ Stock quotes (web scraping, no DB needed)
- ✅ Stock health check
- ✅ API root endpoint
- ✅ Health check (shows "degraded" status)

**What NEEDS a database:**
- Auth (signup, login)
- Expenses CRUD
- Income CRUD
- Goals CRUD
- Profiles
- Stock screener (needs user profile)

**Frontend fallback:**
When the backend is unreachable, the frontend automatically uses localStorage for all operations. Everything works — data just stays in your browser.

---

## 🚀 Recommended Development Setup

**Easiest (no database):**
```bash
# Terminal 1 — Backend (stocks only, auth will fail gracefully)
cd backend && pip install -r requirements.txt && python -m uvicorn app.main:app --reload

# Terminal 2 — Frontend (falls back to localStorage for auth/data)
npm run dev
```

**Full stack (with database):**
```bash
# Terminal 1 — Database
cd backend && docker compose up -d postgres

# Terminal 2 — Backend
cd backend && cp .env.example .env && python -m uvicorn app.main:app --reload

# Terminal 3 — Frontend
npm run dev
```

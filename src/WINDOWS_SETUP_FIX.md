# 🔧 Windows Setup - Troubleshooting Guide

You're encountering several common Windows setup issues. Let's fix them step by step.

---

## 🚨 Issues Detected

1. ❌ Docker Compose not found
2. ❌ Rust compiler missing (needed for pydantic-core)
3. ❌ Python packages not installing correctly
4. ❌ Commands not found (alembic, uvicorn)

---

## ✅ Solution 1: Fix Docker (Recommended)

### Install Docker Desktop for Windows

1. Download Docker Desktop: https://www.docker.com/products/docker-desktop/
2. Install and restart your computer
3. Open Docker Desktop and wait for it to start
4. Verify installation:
   ```powershell
   docker --version
   docker compose version
   ```

### Use Modern Docker Compose Command

Docker Compose v2 uses `docker compose` (no hyphen) instead of `docker-compose`:

```powershell
# Old command (doesn't work):
docker-compose up -d

# New command (use this):
docker compose up -d
```

---

## ✅ Solution 2: Fix Python Environment

### Step 1: Use Virtual Environment (IMPORTANT!)

```powershell
# Navigate to backend folder
cd C:\Users\Hp\OneDrive\Desktop\FinGenius1\src\backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# If you get execution policy error, run this first:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Step 2: Install Visual C++ Build Tools

Pydantic-core requires Rust OR you can use pre-built wheels. Let's use pre-built wheels:

```powershell
# Upgrade pip first
python -m pip install --upgrade pip

# Install packages with pre-built wheels
pip install --only-binary :all: pydantic pydantic-core

# Then install other requirements
pip install -r requirements.txt
```

### Alternative: Install Rust (if above doesn't work)

1. Download Rust: https://rustup.rs/
2. Run the installer
3. Restart PowerShell
4. Try installing again:
   ```powershell
   pip install -r requirements.txt
   ```

---

## ✅ Solution 3: Complete Setup Steps (Windows)

### Backend Setup

```powershell
# 1. Navigate to backend
cd C:\Users\Hp\OneDrive\Desktop\FinGenius1\src\backend

# 2. Create and activate virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# 3. Upgrade pip
python -m pip install --upgrade pip

# 4. Install dependencies
pip install --only-binary :all: pydantic pydantic-core
pip install -r requirements.txt

# 5. Start Docker (use new command)
docker compose up -d

# 6. Create .env file
copy .env.example .env

# 7. Edit .env file - Open in notepad and add SECRET_KEY
notepad .env
# Add this line: SECRET_KEY=your-super-secret-key-change-this-in-production-12345678

# 8. Run migrations
python -m alembic upgrade head

# 9. Start backend
python -m uvicorn app.main:app --reload --port 8000
```

### Frontend Setup (New Terminal)

```powershell
# 1. Navigate to project root
cd C:\Users\Hp\OneDrive\Desktop\FinGenius1\src

# 2. Install Node dependencies
npm install

# 3. Create .env file
echo VITE_API_URL=http://localhost:8000 > .env

# 4. Start frontend
npm start
```

---

## 🐛 Alternative: Skip Docker (Use LocalStorage Mode)

If Docker is too complicated, the app can run in **LocalStorage mode** (no backend needed):

### Frontend Only Setup

```powershell
# Navigate to project root
cd C:\Users\Hp\OneDrive\Desktop\FinGenius1\src

# Install dependencies
npm install

# Start frontend
npm start
```

The app will automatically use localStorage for data storage when the backend is unavailable!

**Test credentials:**
- Email: `haed@example.com`
- Password: `password123`

---

## 🔍 Verification Steps

### Check if Docker is working:
```powershell
docker --version
docker compose version
docker ps
```

### Check if Python virtual environment is active:
```powershell
# You should see (venv) in your prompt
(venv) PS C:\Users\Hp\OneDrive\Desktop\FinGenius1\src\backend>
```

### Check if packages are installed:
```powershell
# With venv activated
python -m pip list | findstr fastapi
python -m pip list | findstr uvicorn
python -m pip list | findstr alembic
```

### Check if backend is running:
Open browser: http://localhost:8000/docs

### Check if frontend is running:
Open browser: http://localhost:3000

---

## 📝 Common PowerShell Issues

### Execution Policy Error

```powershell
# Run this to allow scripts
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Command Not Found

Always use `python -m` prefix when in virtual environment:
```powershell
# ❌ Wrong:
uvicorn app.main:app --reload

# ✅ Correct:
python -m uvicorn app.main:app --reload
```

### Path Issues

Use full paths if commands don't work:
```powershell
C:\Users\Hp\OneDrive\Desktop\FinGenius1\src\backend\venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

---

## 🎯 Recommended Approach for Windows

**Option 1: Full Stack (Backend + Frontend)**
1. Install Docker Desktop
2. Use virtual environment for Python
3. Use `python -m` prefix for all commands
4. Use `docker compose` (no hyphen)

**Option 2: Frontend Only (Easiest)**
1. Skip backend setup entirely
2. Just run `npm install` and `npm start`
3. App uses localStorage automatically
4. Perfect for development and testing

---

## 🆘 Still Having Issues?

### Quick Diagnostic

Run this in PowerShell:
```powershell
# Check Python
python --version

# Check Node
node --version
npm --version

# Check Docker
docker --version

# Check if in virtual environment
python -c "import sys; print(sys.prefix)"
```

Share the output if you need more help!

---

## 📚 Additional Resources

- Docker Desktop: https://docs.docker.com/desktop/install/windows-install/
- Python Virtual Environments: https://docs.python.org/3/tutorial/venv.html
- Rust Installation: https://rustup.rs/
- PowerShell Execution Policy: https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.security/set-executionpolicy

---

## ✨ Pro Tips

1. **Always use virtual environment** - Prevents permission issues
2. **Use `python -m` prefix** - Ensures correct package execution
3. **Use `docker compose`** (no hyphen) - Modern Docker syntax
4. **Try LocalStorage mode first** - Easiest way to test the app
5. **Keep Docker Desktop running** - Backend won't work without it

Good luck! 🚀

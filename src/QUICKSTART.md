# 🚀 FinGenius - Quick Start Guide

Follow these steps to run the project locally in VS Code.

---

## ⚡ Step 1: Start Backend & Database

Open a terminal in VS Code and run:

```bash
# Navigate to backend folder
cd backend

# Start PostgreSQL database using Docker
docker-compose up -d

# Install Python dependencies
pip install -r requirements.txt

# Create .env file (copy from example)
cp .env.example .env

# IMPORTANT: Edit .env and add your SECRET_KEY
# Generate one with: openssl rand -hex 32
# Or use any long random string

# Run database migrations
alembic upgrade head

# Start backend server
uvicorn app.main:app --reload --port 8000
```

✅ Backend will run at **http://localhost:8000**
📚 API docs available at **http://localhost:8000/docs**

---

## ⚡ Step 2: Start Frontend

Open a **NEW terminal** in VS Code and run:

```bash
# Go back to root folder
cd ..

# Install dependencies
npm install

# Create .env file for frontend
echo "VITE_API_URL=http://localhost:8000" > .env

# Start frontend (both commands work)
npm start
# OR
npm run dev
```

✅ Frontend will open at **http://localhost:3000**

---

## 🎯 Quick Test

1. Open **http://localhost:3000** in your browser
2. Click **"Sign Up"** to create an account
3. Complete the onboarding process
4. Start managing your finances!

**Default test credentials (localStorage mode):**
- Email: `haed@example.com`
- Password: `password123`

---

## 🐛 Quick Troubleshooting

### Don't have Docker?

1. Install PostgreSQL locally from [postgresql.org](https://www.postgresql.org/)
2. Create a database named `fingenius_db`:
   ```sql
   CREATE DATABASE fingenius_db;
   CREATE USER fingenius WITH PASSWORD 'fingenius_password';
   GRANT ALL PRIVILEGES ON DATABASE fingenius_db TO fingenius;
   ```
3. Update `DATABASE_URL` in `backend/.env`

### Don't have Python?

- Install Python 3.10+ from [python.org](https://www.python.org/)
- Or use `python3` instead of `python` on macOS/Linux

### Backend won't start?

- ✅ Make sure port 8000 is free
- ✅ Check PostgreSQL is running: `docker ps`
- ✅ Verify `.env` file exists in `backend/` folder
- ✅ Check database connection in `.env`

### Frontend won't connect to backend?

- ✅ Check backend is running at http://localhost:8000
- ✅ Visit http://localhost:8000/docs to see API documentation
- ✅ Make sure `.env` file exists in root with `VITE_API_URL=http://localhost:8000`
- ✅ Restart frontend server after creating `.env`

### Port conflicts?

**Backend (port 8000):**
```bash
# Change port in uvicorn command
uvicorn app.main:app --reload --port 8001
# Update VITE_API_URL in frontend .env
```

**Frontend (port 3000):**
```bash
# Edit vite.config.ts and change server.port to 3001
```

### Module not found errors?

```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 📁 Project Structure

```
fingenius/
├── backend/              # Python FastAPI backend
│   ├── app/             # API code
│   ├── alembic/         # Database migrations
│   └── .env             # Backend config (create this!)
├── components/          # React components
├── pages/              # Page components
├── services/           # API services
├── .env                # Frontend config (create this!)
├── package.json        # Node dependencies
├── vite.config.ts      # Vite configuration
└── index.html          # Entry point
```

---

## 🔄 Development Workflow

Keep **two terminals** open:

**Terminal 1 - Backend:**
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
npm start
```

Both servers will auto-reload when you make changes! 🎉

---

## 📚 Need More Help?

See the detailed **LOCAL_SETUP_GUIDE.md** for:
- Manual PostgreSQL setup
- VS Code extensions
- Debugging configuration
- Advanced troubleshooting

---

## 🎉 You're Ready!

Start building amazing financial management features! 🚀

**Pro tip:** Check out the API docs at http://localhost:8000/docs to explore all available endpoints.

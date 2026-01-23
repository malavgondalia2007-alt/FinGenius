# FinGenius - Local Development Setup Guide

Complete guide to run this project locally in VS Code.

---

## 📋 Prerequisites

Before starting, ensure you have these installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.10 or higher) - [Download](https://www.python.org/)
- **PostgreSQL** (v15 or higher) - [Download](https://www.postgresql.org/)
- **VS Code** - [Download](https://code.visualstudio.com/)
- **Git** - [Download](https://git-scm.com/)

**OR** use Docker (easier option):
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/)

---

## 🚀 Quick Start (Recommended - Using Docker)

### 1. Start Backend with Docker

```bash
cd backend
docker-compose up -d
```

This will:
- Start PostgreSQL database on port 5432
- Start FastAPI backend on port 8000
- Run database migrations automatically

### 2. Setup Frontend

```bash
# Return to project root
cd ..

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open at `http://localhost:5173`

---

## 🔧 Manual Setup (Without Docker)

### Part 1: Backend Setup

#### Step 1: Install Python Dependencies

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### Step 2: Setup PostgreSQL Database

**Option A: Using PostgreSQL CLI**

```bash
# Start PostgreSQL service
# On Windows: Start from Services
# On macOS: brew services start postgresql
# On Linux: sudo service postgresql start

# Create database and user
psql -U postgres

# In PostgreSQL shell, run:
CREATE DATABASE fingenius_db;
CREATE USER fingenius WITH PASSWORD 'fingenius_password';
GRANT ALL PRIVILEGES ON DATABASE fingenius_db TO fingenius;
\q
```

**Option B: Using pgAdmin**

1. Open pgAdmin
2. Create new database: `fingenius_db`
3. Create new user: `fingenius` with password `fingenius_password`
4. Grant all privileges to the user

#### Step 3: Configure Environment Variables

```bash
# Copy example env file
cp .env.example .env

# Edit .env file with your settings
```

Your `.env` should contain:

```env
DATABASE_URL=postgresql://fingenius:fingenius_password@localhost:5432/fingenius_db
SECRET_KEY=your-super-secret-key-change-this-in-production-make-it-long-and-random
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
FRONTEND_URL=http://localhost:5173
```

#### Step 4: Run Database Migrations

```bash
# Initialize database schema
alembic upgrade head
```

#### Step 5: Start Backend Server

```bash
# Make sure you're in the backend directory
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at:
- API: `http://localhost:8000`
- Interactive Docs: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

### Part 2: Frontend Setup

#### Step 1: Create package.json

In the **project root** directory, create `package.json`:

```json
{
  "name": "fingenius",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "lucide-react": "^0.294.0",
    "recharts": "^2.10.3",
    "xlsx": "^0.18.5",
    "pdfjs-dist": "^3.11.174"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@typescript-eslint/eslint-plugin": "^6.14.0",
    "@typescript-eslint/parser": "^6.14.0",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.55.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.6",
    "typescript": "^5.2.2",
    "vite": "^5.0.8"
  }
}
```

#### Step 2: Create vite.config.ts

In the project root, create `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
```

#### Step 3: Create tsconfig.json

In the project root, create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules", "dist", "backend"]
}
```

#### Step 4: Create index.html

In the project root, create `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>FinGenius - Smart Financial Management</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/index.tsx"></script>
  </body>
</html>
```

#### Step 5: Install Dependencies

```bash
# Make sure you're in the project root (not backend folder)
npm install
```

#### Step 6: Start Frontend Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173`

---

## 🎯 VS Code Setup

### Recommended Extensions

Install these extensions in VS Code:

1. **Python** (ms-python.python)
2. **Pylance** (ms-python.vscode-pylance)
3. **ESLint** (dbaeumer.vscode-eslint)
4. **Prettier** (esbenp.prettier-vscode)
5. **Tailwind CSS IntelliSense** (bradlc.vscode-tailwindcss)
6. **ES7+ React/Redux/React-Native snippets** (dsznajder.es7-react-js-snippets)
7. **PostgreSQL** (ckolkman.vscode-postgres) - optional

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[python]": {
    "editor.defaultFormatter": "ms-python.black-formatter",
    "editor.formatOnSave": true
  },
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": true,
  "tailwindCSS.experimental.classRegex": [
    ["className\\s*=\\s*['\"]([^'\"]*)['\"]"]
  ]
}
```

### Launch Configuration

Create `.vscode/launch.json` for debugging:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: FastAPI",
      "type": "python",
      "request": "launch",
      "module": "uvicorn",
      "args": [
        "app.main:app",
        "--reload",
        "--host",
        "0.0.0.0",
        "--port",
        "8000"
      ],
      "cwd": "${workspaceFolder}/backend",
      "env": {
        "PYTHONPATH": "${workspaceFolder}/backend"
      },
      "console": "integratedTerminal"
    },
    {
      "name": "Frontend: Chrome",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}"
    }
  ]
}
```

---

## 🧪 Testing the Setup

### 1. Test Backend

Open `http://localhost:8000/docs` in your browser. You should see the FastAPI interactive documentation.

Try the signup endpoint:

```bash
curl -X POST http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### 2. Test Frontend

1. Open `http://localhost:5173`
2. You should see the login page
3. Click "Sign Up" and create an account
4. Complete the onboarding process

### 3. Test Database Connection

```bash
# In backend directory
python -c "from app.core.database import engine; print('Database connected!' if engine else 'Connection failed')"
```

---

## 📁 Project Structure

```
fingenius/
├── backend/                 # Python FastAPI backend
│   ├── alembic/            # Database migrations
│   ├── app/
│   │   ├── api/            # API endpoints
│   │   ├── core/           # Config, database, security
│   │   ├── models/         # SQLAlchemy models
│   │   └── schemas/        # Pydantic schemas
│   ├── .env                # Environment variables
│   ├── requirements.txt    # Python dependencies
│   └── docker-compose.yml  # Docker setup
├── components/             # React components
├── pages/                  # Page components
├── services/               # API services
├── utils/                  # Utility functions
├── contexts/               # React contexts
├── hooks/                  # Custom hooks
├── types/                  # TypeScript types
├── index.tsx               # Frontend entry point
├── App.tsx                 # Main app component
├── index.css               # Global styles
├── tailwind.config.js      # Tailwind configuration
├── package.json            # Node dependencies
├── vite.config.ts          # Vite configuration
└── tsconfig.json           # TypeScript configuration
```

---

## 🔄 Development Workflow

### Running Both Servers

**Terminal 1 - Backend:**
```bash
cd backend
# If using virtual environment:
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn app.main:app --reload
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Making Changes

1. **Frontend changes**: Vite will hot-reload automatically
2. **Backend changes**: uvicorn will auto-reload with `--reload` flag
3. **Database schema changes**: Create new Alembic migration:
   ```bash
   cd backend
   alembic revision --autogenerate -m "Description of changes"
   alembic upgrade head
   ```

---

## 🐛 Troubleshooting

### Backend Issues

**Port 8000 already in use:**
```bash
# Find and kill the process
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:8000 | xargs kill -9
```

**Database connection error:**
- Verify PostgreSQL is running
- Check credentials in `.env`
- Ensure database `fingenius_db` exists

**Import errors:**
```bash
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Frontend Issues

**Port 5173 already in use:**
```bash
# Kill the process or change port in vite.config.ts
```

**Module not found errors:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Tailwind styles not working:**
```bash
# Rebuild Tailwind
npm run build
```

### Database Issues

**Reset database:**
```bash
cd backend
alembic downgrade base
alembic upgrade head
```

**View database:**
```bash
psql -U fingenius -d fingenius_db
# Or use pgAdmin GUI
```

---

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

## 🎉 You're Ready!

Your FinGenius development environment is now set up. Start coding and building amazing financial management features!

**Default Login Credentials (LocalStorage Mode):**
- Email: `haed@example.com`
- Password: `password123`

**Admin Login:**
- Email: `admin@fingenius.com`
- Password: `admin123`

Happy coding! 🚀


# FinGenius Backend API

FastAPI backend with PostgreSQL database, Alembic migrations, and JWT authentication.

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment

Create a `.env` file in the `backend/` directory:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
DATABASE_URL=postgresql://fingenius:fingenius_password@localhost:5432/fingenius_db
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
FRONTEND_URL=http://localhost:3000
```

### 3. Set Up PostgreSQL Database

Install PostgreSQL and create the database:

```bash
# On Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# On macOS with Homebrew
brew install postgresql

# Start PostgreSQL service
sudo service postgresql start  # Linux
brew services start postgresql  # macOS

# Create database and user
sudo -u postgres psql
```

In PostgreSQL shell:

```sql
CREATE DATABASE fingenius_db;
CREATE USER fingenius WITH PASSWORD 'fingenius_password';
GRANT ALL PRIVILEGES ON DATABASE fingenius_db TO fingenius;
\q
```

### 4. Initialize Alembic Migrations

```bash
# Initialize Alembic (already done, but for reference)
alembic init alembic

# Create initial migration
alembic revision --autogenerate -m "Initial migration"

# Apply migrations
alembic upgrade head
```

### 5. Run the Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: http://localhost:8000
- Interactive Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Authentication
- `POST /auth/signup` - Create new user account
- `POST /auth/login` - Login and get JWT tokens
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user info

### Profiles
- `GET /profiles/me` - Get current user's profile
- `POST /profiles/` - Create user profile
- `PATCH /profiles/me` - Update user profile

### Expenses
- `GET /expenses/` - Get all user expenses
- `POST /expenses/` - Create new expense
- `DELETE /expenses/{expense_id}` - Delete expense

### Income
- `GET /income/` - Get all user income records
- `POST /income/` - Create new income record
- `DELETE /income/{income_id}` - Delete income record

### Goals
- `GET /goals/` - Get all user goals
- `POST /goals/` - Create new goal
- `PATCH /goals/{goal_id}` - Update goal
- `DELETE /goals/{goal_id}` - Delete goal

## Database Migrations

### Create a new migration

```bash
alembic revision --autogenerate -m "Description of changes"
```

### Apply migrations

```bash
alembic upgrade head
```

### Rollback migration

```bash
alembic downgrade -1
```

### View migration history

```bash
alembic history
```

## Testing with curl

### Signup
```bash
curl -X POST http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### Login
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Get Current User (with token)
```bash
curl -X GET http://localhost:8000/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Frontend Integration

Update your frontend services to use the API:

1. Create an API client service
2. Store JWT tokens in localStorage or httpOnly cookies
3. Add Authorization header to all authenticated requests
4. Handle token refresh on 401 responses

Example API client:

```typescript
const API_BASE_URL = 'http://localhost:8000';

const api = {
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },
  
  async getExpenses(token: string) {
    const response = await fetch(`${API_BASE_URL}/expenses/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }
};
```

## Security Notes

- Change `SECRET_KEY` in production
- Use HTTPS in production
- Implement rate limiting
- Add request validation
- Enable CORS only for trusted origins
- Use environment variables for sensitive data

## Production Deployment

1. Set strong `SECRET_KEY`
2. Use production-grade PostgreSQL server
3. Enable SSL for database connections
4. Set up proper logging
5. Use a process manager (systemd, supervisor)
6. Set up reverse proxy (nginx)
7. Enable HTTPS with Let's Encrypt
8. Configure firewall rules

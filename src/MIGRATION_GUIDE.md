
# PostgreSQL Database Migration Guide

This guide explains how to migrate from localStorage to the PostgreSQL backend.

## Overview

The application now has two data access layers:
1. **OLD**: `services/database.ts` - localStorage (client-side only)
2. **NEW**: `services/api.ts` - PostgreSQL via REST API (recommended)

## Backend Setup

### 1. Configure Environment Variables

Create `backend/.env` file:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/fingenius
SECRET_KEY=your-secret-key-here-generate-with-openssl
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
FRONTEND_URL=http://localhost:3000
```

Generate a secure SECRET_KEY:
```bash
openssl rand -hex 32
```

### 2. Start PostgreSQL Database

Using Docker:
```bash
cd backend
docker-compose up -d
```

Or install PostgreSQL locally and create a database named `fingenius`.

### 3. Run Database Migrations

```bash
cd backend
pip install -r requirements.txt
alembic upgrade head
```

### 4. Start Backend Server

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

## Frontend Migration

### Step 1: Update Environment Variables

Create `.env` file in frontend root:

```env
REACT_APP_API_URL=http://localhost:8000
```

### Step 2: Migrate Component Code

Replace `services/database.ts` imports with `services/api.ts`:

#### OLD CODE (localStorage):
```typescript
import { db } from '../services/database'

// Get expenses
const expenses = db.expenses.getByUserId(user.id)

// Create expense
db.expenses.create(newExpense)

// Delete expense
db.expenses.delete(expenseId)
```

#### NEW CODE (API):
```typescript
import { api } from '../services/api'

// Get expenses (async)
const expenses = await api.expenses.getAll()

// Create expense (async)
const created = await api.expenses.create({
  amount: 1000,
  category: 'Food',
  date: '2024-01-15',
  type: 'essential',
  description: 'Groceries'
})

// Delete expense (async)
await api.expenses.delete(expenseId)
```

### Step 3: Update Components to Handle Async Operations

Components need to be updated to handle async API calls:

```typescript
// Before (synchronous)
const handleAddExpense = (e: React.FormEvent) => {
  e.preventDefault()
  db.expenses.create(newExpense)
  setExpenses(db.expenses.getByUserId(user.id))
}

// After (asynchronous)
const handleAddExpense = async (e: React.FormEvent) => {
  e.preventDefault()
  try {
    await api.expenses.create(newExpense)
    const expenses = await api.expenses.getAll()
    setExpenses(expenses)
  } catch (error) {
    console.error('Failed to create expense:', error)
    // Show error to user
  }
}
```

### Step 4: Add Loading States

```typescript
const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState<string | null>(null)

const loadExpenses = async () => {
  setIsLoading(true)
  setError(null)
  try {
    const data = await api.expenses.getAll()
    setExpenses(data)
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to load expenses')
  } finally {
    setIsLoading(false)
  }
}

useEffect(() => {
  loadExpenses()
}, [])
```

## API Reference

### Authentication

```typescript
// Signup
const { user, token } = await api.auth.signup(name, email, password)

// Login
const { user, token } = await api.auth.login(email, password)

// Get current user
const user = await api.auth.getCurrentUser()

// Logout
api.auth.logout()

// Refresh token
const newToken = await api.auth.refreshToken()
```

### Expenses

```typescript
// Get all expenses for current user
const expenses = await api.expenses.getAll()

// Create expense
const expense = await api.expenses.create({
  amount: 1000,
  category: 'Food',
  date: '2024-01-15',
  type: 'essential',
  description: 'Groceries'
})

// Delete expense
await api.expenses.delete(expenseId)
```

### Income

```typescript
// Get all income for current user
const incomes = await api.income.getAll()

// Create income
const income = await api.income.create({
  amount: 5000,
  source: 'Salary',
  date: '2024-01-01',
  description: 'Monthly salary'
})

// Delete income
await api.income.delete(incomeId)
```

### Goals

```typescript
// Get all goals
const goals = await api.goals.getAll()

// Create goal
const goal = await api.goals.create({
  name: 'Emergency Fund',
  targetAmount: 100000,
  savedAmount: 0,
  deadline: '2024-12-31',
  category: 'Savings'
})

// Update goal
const updated = await api.goals.update(goalId, {
  savedAmount: 50000
})

// Delete goal
await api.goals.delete(goalId)
```

### Profiles

```typescript
// Get current user's profile
const profile = await api.profiles.get()

// Create profile
const profile = await api.profiles.create({
  age: 25,
  type: 'employee',
  monthlyIncome: 50000,
  // ... other fields
})

// Update profile
const updated = await api.profiles.update({
  monthlyIncome: 60000
})
```

## Error Handling

All API calls can throw errors. Always wrap them in try-catch:

```typescript
try {
  const expenses = await api.expenses.getAll()
  setExpenses(expenses)
} catch (error) {
  if (error instanceof Error) {
    if (error.message.includes('401')) {
      // Unauthorized - redirect to login
      navigate('/login')
    } else {
      // Show error message
      setError(error.message)
    }
  }
}
```

## Token Refresh

The API automatically includes the auth token in requests. If a token expires, you can refresh it:

```typescript
try {
  const data = await api.expenses.getAll()
} catch (error) {
  if (error.message.includes('401')) {
    try {
      await api.auth.refreshToken()
      // Retry the request
      const data = await api.expenses.getAll()
    } catch {
      // Refresh failed, logout
      api.auth.logout()
      navigate('/login')
    }
  }
}
```

## Migration Checklist

- [ ] Backend PostgreSQL database running
- [ ] Backend migrations applied
- [ ] Backend server running on port 8000
- [ ] Frontend `.env` file configured
- [ ] Auth service updated (✅ Done)
- [ ] Update `pages/Expenses.tsx` to use API
- [ ] Update `pages/Goals.tsx` to use API
- [ ] Update `pages/Dashboard.tsx` to use API
- [ ] Update `pages/Settings.tsx` to use API
- [ ] Update `pages/Onboarding.tsx` to use API
- [ ] Update admin pages to use API
- [ ] Add loading states to all components
- [ ] Add error handling to all API calls
- [ ] Test all CRUD operations
- [ ] Remove `services/database.ts` (optional, can keep as fallback)

## Testing

1. Start backend: `cd backend && uvicorn app.main:app --reload`
2. Start frontend: `npm start`
3. Create a new account
4. Test all features:
   - Add/delete expenses
   - Add/delete income
   - Create/update/delete goals
   - Update profile
   - Logout and login again

## Rollback

If you need to rollback to localStorage:

1. Keep `services/database.ts` file
2. Import from `database.ts` instead of `api.ts`
3. Remove async/await from component code
4. Remove loading states

The old localStorage code will continue to work independently.

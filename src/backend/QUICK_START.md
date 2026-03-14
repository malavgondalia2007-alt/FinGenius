
# Quick Start Guide - Get NSE Live Data Working

This guide will help you get the backend running so you can see **real NSE stock data** instead of simulated data.

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

## Step 1: Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

**Note:** If you get any errors, try:
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

## Step 2: Create Environment File (Optional)

The backend will work without a database for stock data. Create a minimal `.env` file:

```bash
cd backend
cp .env.example .env
```

Edit `.env` and set a simple secret key:
```env
SECRET_KEY=your-secret-key-change-this
DATABASE_URL=sqlite:///./fingenius.db
FRONTEND_URL=http://localhost:5173
```

## Step 3: Start the Backend Server

From the `backend` directory:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

## Step 4: Test the Backend

Open your browser and visit:
- **API Docs:** http://localhost:8000/docs
- **Health Check:** http://localhost:8000/health
- **Stock Quotes:** http://localhost:8000/stocks/quotes

You should see JSON data with real NSE stock prices!

## Step 5: Refresh Your Frontend

1. Go back to your FinGenius app in the browser
2. Navigate to the **Investments** page
3. Click the **Refresh** button
4. The "Simulated Data" badge should disappear
5. You'll see "Live Data (8/8)" with a green indicator

## Troubleshooting

### Problem: "ModuleNotFoundError: No module named 'fastapi'"
**Solution:** Install dependencies:
```bash
pip install -r requirements.txt
```

### Problem: "Address already in use"
**Solution:** Port 8000 is already taken. Use a different port:
```bash
uvicorn app.main:app --reload --port 8001
```
Then update your frontend to use `http://localhost:8001`

### Problem: Backend starts but stocks show "Simulated Data"
**Solution:** 
1. Check backend logs for errors
2. Test the endpoint directly: http://localhost:8000/stocks/quotes
3. NSE API might be rate-limiting - wait a few minutes and try again
4. Check your internet connection

### Problem: "Could not fetch data for symbol"
**Solution:** NSE's API has rate limits. The backend will retry automatically. Wait 30 seconds and refresh.

### Problem: Database errors
**Solution:** The stocks endpoint doesn't need a database. You can ignore database errors for now. To fix properly:
```bash
# Install PostgreSQL or use SQLite
# Update DATABASE_URL in .env to:
DATABASE_URL=sqlite:///./fingenius.db
```

## How It Works

1. **Backend fetches from NSE:** The `/stocks/quotes` endpoint calls NSE India's public API
2. **Frontend calls backend:** Your React app fetches from `http://localhost:8000/stocks/quotes`
3. **Live data displayed:** Stocks are marked with `isLive: true` and show real prices
4. **Fallback on failure:** If backend is down, frontend shows simulated data

## Production Notes

- NSE API has rate limits (~3 requests per second)
- Data may be delayed by 15 minutes (NSE policy)
- Backend caches responses for 30 seconds
- For production, deploy backend to a cloud server (Heroku, Railway, AWS)

## Next Steps

Once you see live data:
1. ✅ Backend is working correctly
2. ✅ NSE API integration is functional
3. ✅ Your app shows real market data

You can now:
- Add more stocks to track
- Implement real-time updates
- Add historical data charts
- Build investment recommendations

## Support

If you're still having issues:
1. Check backend logs for error messages
2. Test the API directly in your browser
3. Verify your internet connection
4. Try again during NSE market hours (9:15 AM - 3:30 PM IST)


# 🚀 Get Live NSE Stock Data Working - Complete Guide

This guide will help you fix the "Simulated Data" issue and get real NSE stock prices showing in your app.

## 📋 What You Need

- Python 3.8 or higher
- Internet connection
- 5 minutes

## ⚡ Quick Start (3 Steps)

### Step 1: Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Start Backend

```bash
uvicorn app.main:app --reload
```

**Keep this terminal open!** You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Step 3: Refresh Frontend

1. Go to your app in the browser
2. Navigate to **Investments** page  
3. Click the **Refresh** button
4. ✅ "Live Data" indicator should appear!

---

## 🔍 Verify It's Working

### Test 1: Check Backend Health

Open in browser: http://localhost:8000/health

Should show:
```json
{"status": "healthy"}
```

### Test 2: Check Stock Data

Open in browser: http://localhost:8000/stocks/quotes

Should show JSON with real stock prices:
```json
{
  "stocks": [
    {
      "symbol": "RELIANCE",
      "price": 1441.90,
      "change": -14.90,
      "changePercent": -1.02,
      "isLive": true
    }
  ]
}
```

### Test 3: Check Frontend

In your app:
- **Simulated Data** badge should be **gone**
- **Live Data (8/8)** indicator should show (green)
- Stock prices should match NSE India website

---

## 🐛 Troubleshooting

### Problem: "pip: command not found"

**Solution:**
```bash
python -m pip install -r requirements.txt
```

### Problem: "Port 8000 already in use"

**Solution:** Use a different port:
```bash
uvicorn app.main:app --reload --port 8001
```

### Problem: Backend starts but frontend shows "Simulated Data"

**Solutions:**

1. **Check backend is reachable:**
   ```bash
   curl http://localhost:8000/stocks/quotes
   ```

2. **Clear browser cache:** Press Ctrl+Shift+R

3. **Check browser console (F12):** Look for error messages

### Problem: "Could not fetch data for symbol"

**Cause:** NSE API rate limiting

**Solution:** Wait 2-3 minutes and try again. NSE has rate limits.

---

## 📊 What Changed

### Before (Simulated Data):
- ❌ Backend not running
- ❌ Frontend uses fake prices
- ❌ Prices don't match real market
- ❌ "Simulated Data" warning shows

### After (Live Data):
- ✅ Backend fetches from NSE India
- ✅ Real stock prices displayed
- ✅ Prices match NSE website
- ✅ "Live Data" indicator shows

---

## 🎯 How It Works

```
┌─────────────┐
│   NSE India │  Real stock exchange
│   Website   │
└──────┬──────┘
       │
       │ HTTP Request
       │ (with proper headers)
       ↓
┌─────────────┐
│   Backend   │  Python FastAPI
│   (Port     │  Fetches & caches data
│   8000)     │
└──────┬──────┘
       │
       │ JSON API
       │ /stocks/quotes
       ↓
┌─────────────┐
│   Frontend  │  React App
│   (Your     │  Displays live prices
│   Browser)  │
└─────────────┘
```

---

## 📝 Files Modified

I've updated these files to fix the backend:

1. **backend/app/api/stocks.py**
   - Removed broken `nselib` dependency
   - Implemented direct NSE API calls
   - Added proper error handling
   - Added detailed logging

2. **backend/requirements.txt**
   - Removed `nselib==3.9` (was causing issues)
   - Kept only working dependencies

3. **New files created:**
   - `backend/QUICK_START.md` - Quick setup guide
   - `backend/test_stocks_api.py` - Test script
   - `BACKEND_TROUBLESHOOTING.md` - Detailed troubleshooting
   - `GET_LIVE_DATA_WORKING.md` - This file

---

## ✅ Success Indicators

You'll know it's working when you see:

1. **In Terminal (Backend):**
   ```
   INFO: 📡 Fetching stock quotes from NSE...
   INFO: ✅ Successfully fetched RELIANCE: ₹1441.90
   INFO: ✅ Successfully fetched 8/8 stocks
   ```

2. **In Browser (Frontend):**
   - Green "Live Data (8/8)" badge
   - Stock prices match NSE India
   - No "Simulated Data" warning

3. **In Browser Console (F12):**
   ```
   📡 Fetching stock data from backend...
   ✅ Fetched 8 stocks from NSE via backend
   ```

---

## 🚀 Next Steps

Once you have live data working:

1. **Add More Stocks:**
   Edit `backend/app/api/stocks.py` and add symbols to `TRACKED_SYMBOLS`

2. **Deploy to Production:**
   - Deploy backend to Heroku/Railway/AWS
   - Update `VITE_API_URL` in frontend

3. **Add Features:**
   - Real-time updates (WebSocket)
   - Historical data charts
   - Price alerts
   - Portfolio tracking

---

## 💡 Important Notes

- **Data Delay:** NSE data may be delayed by 15 minutes (normal for free APIs)
- **Rate Limits:** NSE limits requests to ~3 per second
- **Market Hours:** Best results during 9:15 AM - 3:30 PM IST
- **Fallback:** If backend fails, frontend automatically shows simulation

---

## 🆘 Still Need Help?

1. Run the test script:
   ```bash
   cd backend
   python test_stocks_api.py
   ```

2. Check detailed troubleshooting:
   - Read `BACKEND_TROUBLESHOOTING.md`
   - Check backend logs for errors
   - Verify NSE India website is accessible

3. Remember:
   - Backend must stay running
   - Port 8000 must be available
   - Internet connection required

---

## 🎉 You're Done!

If you see "Live Data" in your app, congratulations! Your backend is successfully fetching real NSE stock prices.

The "Simulated Data" issue is now fixed. 🎊

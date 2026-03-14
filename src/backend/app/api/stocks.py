"""
Stock Data API — Web Scraping Edition
=======================================
Scrapes live stock prices from Google Finance and MoneyControl.
Run this backend with: cd backend && uvicorn app.main:app --reload

WHERE TO RUN THIS SCRIPT:
- Locally: cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload
- VPS/Cloud: Deploy on Railway, Render, DigitalOcean, or any Python hosting
- Scheduled: Use cron jobs or APScheduler to auto-refresh data
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import time
import threading
import logging
import re

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("stock_scraper")

router = APIRouter(prefix="/stocks", tags=["Stocks"])

# =============================================================================
# CONFIGURATION
# =============================================================================

CACHE_TTL_SECONDS = 30
STALE_CACHE_TTL_SECONDS = 300
MIN_FETCH_INTERVAL_SECONDS = 15
REQUEST_TIMEOUT = 12

# Tracked stocks — NSE symbols
TRACKED_STOCKS: Dict[str, Dict[str, Any]] = {
    "RELIANCE": {"name": "Reliance Industries Limited", "marketCap": "₹19.8L Cr", "pe": 28.5},
    "TCS": {"name": "Tata Consultancy Services Limited", "marketCap": "₹15.2L Cr", "pe": 32.1},
    "INFY": {"name": "Infosys Limited", "marketCap": "₹7.1L Cr", "pe": 26.5},
    "HDFCBANK": {"name": "HDFC Bank Limited", "marketCap": "₹11.2L Cr", "pe": 18.2},
    "ICICIBANK": {"name": "ICICI Bank Limited", "marketCap": "₹7.8L Cr", "pe": 17.5},
    "HINDUNILVR": {"name": "Hindustan Unilever Limited", "marketCap": "₹5.8L Cr", "pe": 55.2},
    "BHARTIARTL": {"name": "Bharti Airtel Limited", "marketCap": "₹7.5L Cr", "pe": 65.2},
    "ITC": {"name": "ITC Limited", "marketCap": "₹5.4L Cr", "pe": 26.5},
    "WIPRO": {"name": "Wipro Limited", "marketCap": "₹2.7L Cr", "pe": 22.8},
    "KOTAKBANK": {"name": "Kotak Mahindra Bank Limited", "marketCap": "₹3.5L Cr", "pe": 20.5},
    "AXISBANK": {"name": "Axis Bank Limited", "marketCap": "₹3.4L Cr", "pe": 14.2},
    "MARUTI": {"name": "Maruti Suzuki India Limited", "marketCap": "₹3.9L Cr", "pe": 28.5},
    "TITAN": {"name": "Titan Company Limited", "marketCap": "₹3.2L Cr", "pe": 85.2},
    "ASIANPAINT": {"name": "Asian Paints Limited", "marketCap": "₹2.7L Cr", "pe": 52.5},
    "NESTLEIND": {"name": "Nestle India Limited", "marketCap": "₹2.4L Cr", "pe": 75.2},
    "ULTRACEMCO": {"name": "UltraTech Cement Limited", "marketCap": "₹2.9L Cr", "pe": 42.5},
    "BAJFINANCE": {"name": "Bajaj Finance Limited", "marketCap": "₹4.5L Cr", "pe": 35.2},
    "SUNPHARMA": {"name": "Sun Pharmaceutical Industries Limited", "marketCap": "₹3.9L Cr", "pe": 38.5},
    "LT": {"name": "Larsen & Toubro Limited", "marketCap": "₹5.1L Cr", "pe": 35.2},
    "TECHM": {"name": "Tech Mahindra Limited", "marketCap": "₹1.3L Cr", "pe": 45.2},
    "SBIN": {"name": "State Bank of India", "marketCap": "₹6.9L Cr", "pe": 11.5},

    "ADANIENT": {"name": "Adani Enterprises Limited", "marketCap": "₹3.6L Cr", "pe": 95.2},
    "POWERGRID": {"name": "Power Grid Corporation of India", "marketCap": "₹2.7L Cr", "pe": 18.5},
    "NTPC": {"name": "NTPC Limited", "marketCap": "₹3.5L Cr", "pe": 19.5},
    "HCLTECH": {"name": "HCL Technologies Limited", "marketCap": "₹4.2L Cr", "pe": 26.5},
    "ONGC": {"name": "Oil and Natural Gas Corporation", "marketCap": "₹3.6L Cr", "pe": 8.5},
    "COALINDIA": {"name": "Coal India Limited", "marketCap": "₹2.8L Cr", "pe": 9.5},
    "BPCL": {"name": "Bharat Petroleum Corporation Limited", "marketCap": "₹1.4L Cr", "pe": 7.5},
    "JSWSTEEL": {"name": "JSW Steel Limited", "marketCap": "₹2.1L Cr", "pe": 28.5},
    "BANKBARODA": {"name": "Bank of Baroda", "marketCap": "₹1.4L Cr", "pe": 8.5},
    "PNB": {"name": "Punjab National Bank", "marketCap": "₹1.5L Cr", "pe": 15.5},
    "INDUSINDBK": {"name": "IndusInd Bank Limited", "marketCap": "₹1.2L Cr", "pe": 14.5},
    "IDFCFIRSTB": {"name": "IDFC First Bank Limited", "marketCap": "₹0.6L Cr", "pe": 18.5},
    "AUBANK": {"name": "AU Small Finance Bank Limited", "marketCap": "₹0.5L Cr", "pe": 28.5},
    "LTIM": {"name": "LTIMindtree Limited", "marketCap": "₹1.5L Cr", "pe": 38.5},
    "COFORGE": {"name": "Coforge Limited", "marketCap": "₹0.4L Cr", "pe": 45.5},
    "PERSISTENT": {"name": "Persistent Systems Limited", "marketCap": "₹0.6L Cr", "pe": 55.5},
    "DRREDDY": {"name": "Persistent Systems Limited", "marketCap": "₹1.0L Cr", "pe": 22.5},
    "CIPLA": {"name": "Cipla Limited", "marketCap": "₹1.2L Cr", "pe": 32.5},
    "DIVISLAB": {"name": "Cipla Limited", "marketCap": "₹1.0L Cr", "pe": 58.5},
    "BAJAJ-AUTO": {"name": "Bajaj Auto Limited", "marketCap": "₹2.5L Cr", "pe": 32.5},
    "HEROMOTOCO": {"name": "Hero MotoCorp Limited", "marketCap": "₹1.0L Cr", "pe": 26.5},
    "EICHERMOT": {"name": "Eicher Motors Limited", "marketCap": "₹1.3L Cr", "pe": 35.5},
    "M&M": {"name": "Mahindra & Mahindra Limited", "marketCap": "₹2.6L Cr", "pe": 28.5},
    "TVSMOTOR": {"name": "TVS Motor Company Limited", "marketCap": "₹1.1L Cr", "pe": 55.5},
    "DABUR": {"name": "Dabur India Limited", "marketCap": "₹0.9L Cr", "pe": 52.5},
    "GODREJCP": {"name": "Godrej Consumer Products", "marketCap": "₹1.3L Cr", "pe": 65.5},
    "BRITANNIA": {"name": "Britannia Industries Limited", "marketCap": "₹1.2L Cr", "pe": 58.5},
    "MARICO": {"name": "Marico Limited", "marketCap": "₹0.7L Cr", "pe": 48.5},
    "COLPAL": {"name": "Colgate-Palmolive (India)", "marketCap": "₹0.8L Cr", "pe": 55.5},
    "TATAPOWER": {"name": "Tata Power Company Limited", "marketCap": "₹1.3L Cr", "pe": 35.5},
    "ADANIGREEN": {"name": "Adani Green Energy Limited", "marketCap": "₹2.9L Cr", "pe": 155.5},
    "IOC": {"name": "Indian Oil Corporation", "marketCap": "₹2.4L Cr", "pe": 8.5},
    "GAIL": {"name": "GAIL (India) Limited", "marketCap": "₹1.4L Cr", "pe": 12.5},
    "TATASTEEL": {"name": "Tata Steel Limited", "marketCap": "₹2.1L Cr", "pe": 45.5},
    "HINDALCO": {"name": "Hindalco Industries Limited", "marketCap": "₹1.4L Cr", "pe": 18.5},
    "VEDL": {"name": "Vedanta Limited", "marketCap": "₹1.4L Cr", "pe": 15.5},
    "HDFCLIFE": {"name": "HDFC Life Insurance", "marketCap": "₹1.3L Cr", "pe": 85.5},
    "BAJAJFINSV": {"name": "Bajaj Finserv Limited", "marketCap": "₹2.6L Cr", "pe": 40.5},
    "INDIGO": {"name": "InterGlobe Aviation Ltd", "marketCap": "₹1.6L Cr", "pe": 15.5},
    "TRENT": {"name": "Trent Limited", "marketCap": "₹3.6L Cr", "pe": 115.5},
    "SHREECEM": {"name": "Shree Cement Limited", "marketCap": "₹0.9L Cr", "pe": 45.5},
    "NAUKRI": {"name": "Info Edge (India) Limited", "marketCap": "₹0.7L Cr", "pe": 85.5},
    "HAL": {"name": "Hindustan Aeronautics Ltd", "marketCap": "₹2.8L Cr", "pe": 42.5},
    "BEL": {"name": "Bharat Electronics Limited", "marketCap": "₹2.1L Cr", "pe": 45.5},
    "IRCTC": {"name": "IRCTC Limited", "marketCap": "₹0.8L Cr", "pe": 65.5},
    "VBL": {"name": "Varun Beverages Limited", "marketCap": "₹2.0L Cr", "pe": 85.5},
    "PIDILITIND": {"name": "Pidilite Industries Limited", "marketCap": "₹1.6L Cr", "pe": 95.5},
    "HAVELLS": {"name": "Havells India Limited", "marketCap": "₹1.1L Cr", "pe": 75.5},
    "SIEMENS": {"name": "Siemens Limited", "marketCap": "₹2.4L Cr", "pe": 95.5},
    "ABB": {"name": "ABB India Limited", "marketCap": "₹1.6L Cr", "pe": 92.5},
    "DLF": {"name": "DLF Limited", "marketCap": "₹2.2L Cr", "pe": 75.5},
    "GRASIM": {"name": "Grasim Industries Limited", "marketCap": "₹1.5L Cr", "pe": 25.5},
    "APOLLOHOSP": {"name": "Apollo Hospitals Enterprise Limited", "marketCap": "₹0.9L Cr", "pe": 85.5},
    "JIOFIN": {"name": "Jio Financial Services Limited", "marketCap": "₹2.2L Cr", "pe": 120.5},
}

BROWSER_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
}


# =============================================================================
# RESPONSE MODELS
# =============================================================================

class StockQuote(BaseModel):
    symbol: str
    name: str
    price: float
    change: float
    changePercent: float
    prevClose: float = 0.0
    volume: int = 0
    marketCap: Optional[str] = None
    pe: Optional[float] = None
    externalLink: str
    isLive: bool
    lastUpdated: str


class StockResponse(BaseModel):
    stocks: List[StockQuote]
    timestamp: str
    isMarketOpen: bool
    dataAge: float
    cacheHit: bool
    source: str
    fetchedCount: int
    totalCount: int


# =============================================================================
# WEB SCRAPER — Google Finance
# =============================================================================

class StockScraper:
    """
    Scrapes stock prices from Yahoo Finance using yfinance.
    """

    def __init__(self):
        self._last_fetch_at: float = 0
        self._lock = threading.Lock()
        self._total_fetches = 0
        self._successful_fetches = 0

    def scrape_yfinance(self, symbol: str) -> Optional[Dict]:
        """Scrape a single stock price from yfinance."""
        import yfinance as yf
        # Fix for yfinance caching issue in Docker
        yf.set_tz_cache_location("/tmp/yfinance_tz_cache")
        try:
            ticker = yf.Ticker(f"{symbol}.NS")
            df = ticker.history(period="2d")
            
            if df.empty:
                logger.warning(f"⚠️ yfinance returned no data for {symbol}")
                return None
                
            current_price = float(df['Close'].iloc[-1])
            try:
                prev_price = float(ticker.fast_info.previous_close)
            except:
                try:
                    prev_price = float(ticker.info.get('previousClose', current_price))
                except:
                    if len(df) > 1:
                        prev_price = float(df['Close'].iloc[-2])
                    else:
                        prev_price = current_price
                
            change = current_price - prev_price
            change_pct = (change / prev_price * 100) if prev_price else 0
            volume = int(df['Volume'].iloc[-1]) if 'Volume' in df else 0
            
            if current_price > 0:
                return {
                    "symbol": symbol,
                    "price": round(current_price, 2),
                    "change": round(change, 2),
                    "changePercent": round(change_pct, 2),
                    "prevClose": round(prev_price, 2),
                    "volume": volume
                }
            return None

        except Exception as e:
            logger.warning(f"⚠️ yfinance scraping failed for {symbol}: {e}")
            return None

    def scrape_google_finance(self, symbol: str) -> Optional[Dict]:
        """Left for compatibility, actually uses yfinance."""
        return self.scrape_yfinance(symbol)

    def scrape_all_stocks(self) -> List[Dict]:
        """Scrape all tracked stocks using yfinance."""
        now = time.time()

        with self._lock:
            if now - self._last_fetch_at < MIN_FETCH_INTERVAL_SECONDS:
                logger.info("⏳ Rate limited — skipping scrape")
                return []
            self._last_fetch_at = now
            self._total_fetches += 1

        results = []
        symbols = list(TRACKED_STOCKS.keys())

        # Use ThreadPoolExecutor for faster yfinance downloads
        from concurrent.futures import ThreadPoolExecutor
        
        def fetch_stock(sym):
            return self.scrape_yfinance(sym)

        with ThreadPoolExecutor(max_workers=5) as executor:
            fetched_data = list(executor.map(fetch_stock, symbols))

        for data in fetched_data:
            if data:
                results.append(data)

        with self._lock:
            if results:
                self._successful_fetches += 1

        logger.info(f"📊 Scraped {len(results)}/{len(symbols)} stocks using yfinance")
        return results


# =============================================================================
# CACHE
# =============================================================================

class StockCache:
    def __init__(self):
        self._data: List[StockQuote] = []
        self._timestamp: float = 0
        self._lock = threading.Lock()

    def get(self) -> Optional[Dict]:
        with self._lock:
            if not self._data:
                return None
            age = time.time() - self._timestamp
            if age <= CACHE_TTL_SECONDS:
                return {"stocks": self._data, "age": age, "is_fresh": True}
            elif age <= STALE_CACHE_TTL_SECONDS:
                return {"stocks": self._data, "age": age, "is_fresh": False}
            return None

    def set(self, stocks: List[StockQuote]):
        with self._lock:
            self._data = stocks
            self._timestamp = time.time()

    @property
    def age(self) -> Optional[float]:
        return (time.time() - self._timestamp) if self._timestamp else None

    @property
    def count(self) -> int:
        return len(self._data)


# Singletons
scraper = StockScraper()
stock_cache = StockCache()


# =============================================================================
# HELPERS
# =============================================================================

def check_market_hours() -> bool:
    try:
        import pytz
        ist = pytz.timezone("Asia/Kolkata")
        now = datetime.now(ist)
        if now.weekday() >= 5:
            return False
        market_open = now.replace(hour=9, minute=15, second=0, microsecond=0)
        market_close = now.replace(hour=15, minute=30, second=0, microsecond=0)
        return market_open <= now <= market_close
    except Exception:
        return False


def build_quote(raw: Dict) -> StockQuote:
    symbol = raw["symbol"]
    meta = TRACKED_STOCKS.get(symbol, {"name": symbol, "marketCap": None, "pe": None})
    return StockQuote(
        symbol=symbol,
        name=meta["name"],
        price=raw["price"],
        change=raw["change"],
        changePercent=raw["changePercent"],
        prevClose=raw.get("prevClose", raw["price"]),
        volume=raw.get("volume", 0),
        marketCap=meta.get("marketCap"),
        pe=meta.get("pe"),
        externalLink=f"https://www.nseindia.com/get-quotes/equity?symbol={symbol}",
        isLive=True,
        lastUpdated=datetime.now().isoformat(),
    )


# =============================================================================
# API ENDPOINTS
# =============================================================================

@router.get("/quotes", response_model=StockResponse)
async def get_stock_quotes():
    """Get all stock quotes via web scraping."""
    try:
        is_market_open = check_market_hours()

        # Check cache
        cached = stock_cache.get()
        if cached and cached["is_fresh"]:
            return StockResponse(
                stocks=cached["stocks"],
                timestamp=datetime.now().isoformat(),
                isMarketOpen=is_market_open,
                dataAge=cached["age"],
                cacheHit=True,
                source="scraping_cached",
                fetchedCount=len(cached["stocks"]),
                totalCount=len(TRACKED_STOCKS),
            )

        # Scrape fresh data
        logger.info("📡 Scraping fresh stock data...")
        try:
            raw_stocks = scraper.scrape_all_stocks()
        except Exception as scrape_err:
            logger.error(f"Scraping error: {scrape_err}")
            raw_stocks = []

        if raw_stocks:
            quotes = [build_quote(raw) for raw in raw_stocks]
            stock_cache.set(quotes)
            return StockResponse(
                stocks=quotes,
                timestamp=datetime.now().isoformat(),
                isMarketOpen=is_market_open,
                dataAge=0,
                cacheHit=False,
                source="scraping_live",
                fetchedCount=len(quotes),
                totalCount=len(TRACKED_STOCKS),
            )

        # Stale cache fallback
        if cached:
            return StockResponse(
                stocks=cached["stocks"],
                timestamp=datetime.now().isoformat(),
                isMarketOpen=is_market_open,
                dataAge=cached["age"],
                cacheHit=True,
                source="scraping_stale",
                fetchedCount=len(cached["stocks"]),
                totalCount=len(TRACKED_STOCKS),
            )

        return StockResponse(
            stocks=[],
            timestamp=datetime.now().isoformat(),
            isMarketOpen=is_market_open,
            dataAge=-1,
            cacheHit=False,
            source="unavailable",
            fetchedCount=0,
            totalCount=len(TRACKED_STOCKS),
        )
    except Exception as e:
        logger.error(f"Stock quotes endpoint error: {e}")
        # Return empty response instead of 500
        return StockResponse(
            stocks=[],
            timestamp=datetime.now().isoformat(),
            isMarketOpen=False,
            dataAge=-1,
            cacheHit=False,
            source="error",
            fetchedCount=0,
            totalCount=len(TRACKED_STOCKS),
        )


@router.get("/quote/{symbol}", response_model=StockQuote)
async def get_stock_quote(symbol: str):
    """Get a single stock quote."""
    try:
        symbol = symbol.upper()
        cached = stock_cache.get()
        if cached:
            for stock in cached["stocks"]:
                if stock.symbol == symbol:
                    return stock

        raw = scraper.scrape_google_finance(symbol)
        if raw is None:
            raise HTTPException(status_code=404, detail=f"Could not scrape data for: {symbol}")
        return build_quote(raw)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Single stock quote error for {symbol}: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching stock data: {str(e)}")


@router.get("/health")
async def stock_health():
    """Health check."""
    return {
        "status": "healthy",
        "cacheAge": stock_cache.age,
        "cachedStocks": stock_cache.count,
        "isMarketOpen": check_market_hours(),
        "method": "web_scraping",
        "source": "Google Finance",
    }


@router.post("/refresh")
async def force_refresh():
    """Force refresh stock data."""
    try:
        scraper._last_fetch_at = 0
        raw_stocks = scraper.scrape_all_stocks()
        if raw_stocks:
            quotes = [build_quote(raw) for raw in raw_stocks]
            stock_cache.set(quotes)
            return {"status": "success", "fetched": len(quotes)}
        return {"status": "no_data", "fetched": 0, "message": "Scraping returned no results. Google Finance may be rate-limiting."}
    except Exception as e:
        logger.error(f"Force refresh error: {e}")
        return {"status": "error", "fetched": 0, "message": str(e)}
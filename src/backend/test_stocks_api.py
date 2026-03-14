
"""
Simple test script to verify NSE stock data fetching works
Run this to test the backend without starting the full server
"""
import sys
import requests
from datetime import datetime

def test_nse_direct():
    """Test direct NSE API call"""
    print("🧪 Testing direct NSE API call...")
    
    try:
        session = requests.Session()
        
        # Get cookies
        print("  📡 Getting cookies from NSE...")
        session.get(
            "https://www.nseindia.com",
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            },
            timeout=10
        )
        
        # Fetch quote
        symbol = "RELIANCE"
        print(f"  📊 Fetching quote for {symbol}...")
        response = session.get(
            f"https://www.nseindia.com/api/quote-equity?symbol={symbol}",
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Accept": "application/json",
                "Referer": f"https://www.nseindia.com/get-quotes/equity?symbol={symbol}",
            },
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            price_info = data.get("priceInfo", {})
            price = price_info.get("lastPrice", 0)
            change = price_info.get("change", 0)
            change_percent = price_info.get("pChange", 0)
            
            print(f"\n✅ SUCCESS! NSE API is working")
            print(f"  {symbol}: ₹{price}")
            print(f"  Change: {change:+.2f} ({change_percent:+.2f}%)")
            return True
        else:
            print(f"\n❌ FAILED: Status code {response.status_code}")
            return False
            
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        return False


def test_backend_api():
    """Test the backend API endpoint"""
    print("\n🧪 Testing backend API endpoint...")
    
    try:
        response = requests.get("http://localhost:8000/stocks/quotes", timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            stocks = data.get("stocks", [])
            
            print(f"\n✅ SUCCESS! Backend API is working")
            print(f"  Fetched {len(stocks)} stocks")
            
            if stocks:
                for stock in stocks[:3]:  # Show first 3
                    print(f"  {stock['symbol']}: ₹{stock['price']} ({stock['changePercent']:+.2f}%)")
            
            return True
        else:
            print(f"\n❌ FAILED: Status code {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Cannot connect to backend")
        print("  Make sure the backend is running:")
        print("  cd backend && uvicorn app.main:app --reload")
        return False
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        return False


if __name__ == "__main__":
    print("=" * 60)
    print("NSE Stock Data API Test")
    print("=" * 60)
    
    # Test 1: Direct NSE API
    nse_works = test_nse_direct()
    
    # Test 2: Backend API
    backend_works = test_backend_api()
    
    # Summary
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    print(f"  NSE API:     {'✅ Working' if nse_works else '❌ Failed'}")
    print(f"  Backend API: {'✅ Working' if backend_works else '❌ Not Running'}")
    
    if nse_works and backend_works:
        print("\n🎉 Everything is working! Your app should show live data.")
    elif nse_works and not backend_works:
        print("\n⚠️  NSE works but backend is not running.")
        print("   Start the backend with: uvicorn app.main:app --reload")
    elif not nse_works:
        print("\n⚠️  NSE API is not responding. This could be:")
        print("   - Rate limiting (wait a few minutes)")
        print("   - Network issues")
        print("   - NSE maintenance")
    
    print("=" * 60)

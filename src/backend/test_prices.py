import sys
import os
sys.path.append(os.getcwd())
from app.api.stocks import StockScraper

s = StockScraper()
test_symbols = ["RELIANCE", "TCS", "INFY", "ZOMATO", "HDFCBANK"]
for sym in test_symbols:
    try:
        data = s.scrape_yfinance(sym)
        if data:
            print(f"{sym}: Price={data['price']}, PrevClose={data['prev_close' if 'prev_close' in data else 'prevClose']}")
        else:
            print(f"{sym}: FAILED")
    except Exception as e:
        print(f"{sym}: ERROR {e}")

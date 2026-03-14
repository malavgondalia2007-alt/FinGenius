/// <reference types="vite/client" />
// Live Market Data Service
// Fetches stock data from your backend (which runs web scraping)
// Falls back to last closing prices if backend is unavailable

const CACHE_DURATION = 2 * 1000; // 2 seconds (was 60s)

// Safely get env variables
const getEnvVar = (key: string): string => {
  try {
    if (
      typeof import.meta !== 'undefined' &&
      import.meta.env &&
      import.meta.env[key]) {
      return import.meta.env[key] as string;
    }
  } catch (e) {

    // Ignore
  } return '';
};

const BACKEND_URL = getEnvVar('VITE_API_URL') || 'http://localhost:8000';

// ============================================================================
// ALL STOCK DATA FLOWS THROUGH YOUR BACKEND (Web Scraping)
// ============================================================================
// The frontend does NOT call any external stock APIs directly.
// Live prices: fetched from BACKEND_URL/stocks/quotes (your web scraper)
// Fallback: static last-close prices below (no API calls, just hardcoded data)
// To customize scraping, edit: backend/app/api/stocks.py
// ============================================================================

interface CachedData<T = unknown> {
  data: T;
  timestamp: number;
  isLive: boolean;
}

const cache: Record<string, CachedData> = {};

// Helper to check cache
const getCachedData = <T,>(
  key: string)
  : { data: T; isLive: boolean; } | null => {
  const cached = cache[key];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return { data: cached.data as T, isLive: cached.isLive };
  }
  return null;
};

// Helper to set cache
const setCachedData = <T,>(key: string, data: T, isLive: boolean): void => {
  cache[key] = { data, timestamp: Date.now(), isLive };
};

// Stock Configuration (used for fallback closing prices and metadata)
const STOCK_CONFIG = [
  {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Limited',
    basePrice: 2980.5,
    prevClose: 2975.2,
    marketCap: '₹19.8L Cr',
    pe: 28.5,
    volatility: 0.012,
    bseScripCode: '500325',
    nseSymbol: 'RELIANCE',
    exchange: 'BOTH'
  },
  {
    symbol: 'TCS',
    name: 'Tata Consultancy Services Limited',
    basePrice: 4150.2,
    prevClose: 4142.8,
    marketCap: '₹15.2L Cr',
    pe: 32.1,
    volatility: 0.01,
    bseScripCode: '532540',
    nseSymbol: 'TCS',
    exchange: 'BOTH'
  },
  {
    symbol: 'INFY',
    name: 'Infosys Limited',
    basePrice: 1680.5,
    prevClose: 1675.2,
    marketCap: '₹7.1L Cr',
    pe: 26.5,
    volatility: 0.014,
    bseScripCode: '500209',
    nseSymbol: 'INFY',
    exchange: 'BOTH'
  },
  {
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Limited',
    basePrice: 1450.8,
    prevClose: 1445.5,
    marketCap: '₹11.2L Cr',
    pe: 18.2,
    volatility: 0.008,
    bseScripCode: '500180',
    nseSymbol: 'HDFCBANK',
    exchange: 'BOTH'
  },
  {
    symbol: 'ICICIBANK',
    name: 'ICICI Bank Limited',
    basePrice: 1080.4,
    prevClose: 1075.2,
    marketCap: '₹7.8L Cr',
    pe: 17.5,
    volatility: 0.01,
    bseScripCode: '532174',
    nseSymbol: 'ICICIBANK',
    exchange: 'BOTH'
  },
  {
    symbol: 'HINDUNILVR',
    name: 'Hindustan Unilever Limited',
    basePrice: 2450.2,
    prevClose: 2445.8,
    marketCap: '₹5.8L Cr',
    pe: 55.2,
    volatility: 0.006,
    bseScripCode: '500696',
    nseSymbol: 'HINDUNILVR',
    exchange: 'BOTH'
  },
  {
    symbol: 'BHARTIARTL',
    name: 'Bharti Airtel Limited',
    basePrice: 1250.5,
    prevClose: 1245.2,
    marketCap: '₹7.5L Cr',
    pe: 65.2,
    volatility: 0.015,
    bseScripCode: '532454',
    nseSymbol: 'BHARTIARTL',
    exchange: 'BOTH'
  },
  {
    symbol: 'ITC',
    name: 'ITC Limited',
    basePrice: 435.2,
    prevClose: 432.8,
    marketCap: '₹5.4L Cr',
    pe: 26.5,
    volatility: 0.012,
    bseScripCode: '500875',
    nseSymbol: 'ITC',
    exchange: 'BOTH'
  },
  {
    symbol: 'WIPRO',
    name: 'Wipro Limited',
    basePrice: 520.5,
    prevClose: 518.2,
    marketCap: '₹2.7L Cr',
    pe: 22.8,
    volatility: 0.013,
    bseScripCode: '507685',
    nseSymbol: 'WIPRO',
    exchange: 'BOTH'
  },
  {
    symbol: 'KOTAKBANK',
    name: 'Kotak Mahindra Bank Limited',
    basePrice: 1780.4,
    prevClose: 1775.2,
    marketCap: '₹3.5L Cr',
    pe: 20.5,
    volatility: 0.011,
    bseScripCode: '500247',
    nseSymbol: 'KOTAKBANK',
    exchange: 'BOTH'
  },
  {
    symbol: 'AXISBANK',
    name: 'Axis Bank Limited',
    basePrice: 1120.5,
    prevClose: 1115.8,
    marketCap: '₹3.4L Cr',
    pe: 14.2,
    volatility: 0.012,
    bseScripCode: '532215',
    nseSymbol: 'AXISBANK',
    exchange: 'BOTH'
  },
  {
    symbol: 'MARUTI',
    name: 'Maruti Suzuki India Limited',
    basePrice: 12500.8,
    prevClose: 12450.5,
    marketCap: '₹3.9L Cr',
    pe: 28.5,
    volatility: 0.014,
    bseScripCode: '532500',
    nseSymbol: 'MARUTI',
    exchange: 'BOTH'
  },
  {
    symbol: 'TITAN',
    name: 'Titan Company Limited',
    basePrice: 3650.2,
    prevClose: 3640.5,
    marketCap: '₹3.2L Cr',
    pe: 85.2,
    volatility: 0.013,
    bseScripCode: '500114',
    nseSymbol: 'TITAN',
    exchange: 'BOTH'
  },
  {
    symbol: 'ASIANPAINT',
    name: 'Asian Paints Limited',
    basePrice: 2850.5,
    prevClose: 2845.2,
    marketCap: '₹2.7L Cr',
    pe: 52.5,
    volatility: 0.01,
    bseScripCode: '500820',
    nseSymbol: 'ASIANPAINT',
    exchange: 'BOTH'
  },
  {
    symbol: 'NESTLEIND',
    name: 'Nestle India Limited',
    basePrice: 2550.2,
    prevClose: 2545.8,
    marketCap: '₹2.4L Cr',
    pe: 75.2,
    volatility: 0.008,
    bseScripCode: '500790',
    nseSymbol: 'NESTLEIND',
    exchange: 'BOTH'
  },
  {
    symbol: 'ULTRACEMCO',
    name: 'UltraTech Cement Limited',
    basePrice: 10200.5,
    prevClose: 10150.2,
    marketCap: '₹2.9L Cr',
    pe: 42.5,
    volatility: 0.015,
    bseScripCode: '532538',
    nseSymbol: 'ULTRACEMCO',
    exchange: 'BOTH'
  },
  {
    symbol: 'BAJFINANCE',
    name: 'Bajaj Finance Limited',
    basePrice: 7250.8,
    prevClose: 7240.5,
    marketCap: '₹4.5L Cr',
    pe: 35.2,
    volatility: 0.016,
    bseScripCode: '500034',
    nseSymbol: 'BAJFINANCE',
    exchange: 'BOTH'
  },
  {
    symbol: 'SUNPHARMA',
    name: 'Sun Pharmaceutical Industries Limited',
    basePrice: 1620.5,
    prevClose: 1615.2,
    marketCap: '₹3.9L Cr',
    pe: 38.5,
    volatility: 0.011,
    bseScripCode: '524715',
    nseSymbol: 'SUNPHARMA',
    exchange: 'BOTH'
  },
  {
    symbol: 'LT',
    name: 'Larsen & Toubro Limited',
    basePrice: 3650.2,
    prevClose: 3640.8,
    marketCap: '₹5.1L Cr',
    pe: 35.2,
    volatility: 0.013,
    bseScripCode: '500510',
    nseSymbol: 'LT',
    exchange: 'BOTH'
  },
  {
    symbol: 'TECHM',
    name: 'Tech Mahindra Limited',
    basePrice: 1350.5,
    prevClose: 1345.2,
    marketCap: '₹1.3L Cr',
    pe: 45.2,
    volatility: 0.014,
    bseScripCode: '532755',
    nseSymbol: 'TECHM',
    exchange: 'BOTH'
  },
  {
    symbol: 'SBIN',
    name: 'State Bank of India',
    basePrice: 780.5,
    prevClose: 775.2,
    marketCap: '₹6.9L Cr',
    pe: 11.5,
    volatility: 0.015,
    bseScripCode: '500112',
    nseSymbol: 'SBIN',
    exchange: 'BOTH'
  },

  {
    symbol: 'ADANIENT',
    name: 'Adani Enterprises Limited',
    basePrice: 3150.2,
    prevClose: 3140.5,
    marketCap: '₹3.6L Cr',
    pe: 95.2,
    volatility: 0.025,
    bseScripCode: '512599',
    nseSymbol: 'ADANIENT',
    exchange: 'BOTH'
  },
  {
    symbol: 'POWERGRID',
    name: 'Power Grid Corporation of India',
    basePrice: 295.5,
    prevClose: 292.8,
    marketCap: '₹2.7L Cr',
    pe: 18.5,
    volatility: 0.01,
    bseScripCode: '532898',
    nseSymbol: 'POWERGRID',
    exchange: 'BOTH'
  },
  {
    symbol: 'NTPC',
    name: 'NTPC Limited',
    basePrice: 365.2,
    prevClose: 362.8,
    marketCap: '₹3.5L Cr',
    pe: 19.5,
    volatility: 0.011,
    bseScripCode: '532555',
    nseSymbol: 'NTPC',
    exchange: 'BOTH'
  },
  {
    symbol: 'HCLTECH',
    name: 'HCL Technologies Limited',
    basePrice: 1550.5,
    prevClose: 1545.2,
    marketCap: '₹4.2L Cr',
    pe: 26.5,
    volatility: 0.013,
    bseScripCode: '532281',
    nseSymbol: 'HCLTECH',
    exchange: 'BOTH'
  },
  {
    symbol: 'ONGC',
    name: 'Oil and Natural Gas Corporation',
    basePrice: 285.5,
    prevClose: 282.8,
    marketCap: '₹3.6L Cr',
    pe: 8.5,
    volatility: 0.016,
    bseScripCode: '500312',
    nseSymbol: 'ONGC',
    exchange: 'BOTH'
  },
  {
    symbol: 'COALINDIA',
    name: 'Coal India Limited',
    basePrice: 465.2,
    prevClose: 462.8,
    marketCap: '₹2.8L Cr',
    pe: 9.5,
    volatility: 0.014,
    bseScripCode: '533278',
    nseSymbol: 'COALINDIA',
    exchange: 'BOTH'
  },
  {
    symbol: 'BPCL',
    name: 'Bharat Petroleum Corporation Limited',
    basePrice: 625.5,
    prevClose: 622.8,
    marketCap: '₹1.4L Cr',
    pe: 7.5,
    volatility: 0.015,
    bseScripCode: '500547',
    nseSymbol: 'BPCL',
    exchange: 'BOTH'
  },
  {
    symbol: 'JSWSTEEL',
    name: 'JSW Steel Limited',
    basePrice: 885.5,
    prevClose: 880.2,
    marketCap: '₹2.1L Cr',
    pe: 28.5,
    volatility: 0.017,
    bseScripCode: '500228',
    nseSymbol: 'JSWSTEEL',
    exchange: 'BOTH'
  },
  {
    symbol: 'BANKBARODA',
    name: 'Bank of Baroda',
    basePrice: 275.5,
    prevClose: 272.8,
    marketCap: '₹1.4L Cr',
    pe: 8.5,
    volatility: 0.018,
    bseScripCode: '532134',
    nseSymbol: 'BANKBARODA',
    exchange: 'BOTH'
  },
  {
    symbol: 'PNB',
    name: 'Punjab National Bank',
    basePrice: 135.5,
    prevClose: 132.8,
    marketCap: '₹1.5L Cr',
    pe: 15.5,
    volatility: 0.021,
    bseScripCode: '532461',
    nseSymbol: 'PNB',
    exchange: 'BOTH'
  },
  {
    symbol: 'INDUSINDBK',
    name: 'IndusInd Bank Limited',
    basePrice: 1520.5,
    prevClose: 1515.2,
    marketCap: '₹1.2L Cr',
    pe: 14.5,
    volatility: 0.016,
    bseScripCode: '532187',
    nseSymbol: 'INDUSINDBK',
    exchange: 'BOTH'
  },
  {
    symbol: 'IDFCFIRSTB',
    name: 'IDFC First Bank Limited',
    basePrice: 82.5,
    prevClose: 81.8,
    marketCap: '₹0.6L Cr',
    pe: 18.5,
    volatility: 0.019,
    bseScripCode: '539437',
    nseSymbol: 'IDFCFIRSTB',
    exchange: 'BOTH'
  },
  {
    symbol: 'AUBANK',
    name: 'AU Small Finance Bank Limited',
    basePrice: 645.5,
    prevClose: 642.8,
    marketCap: '₹0.5L Cr',
    pe: 28.5,
    volatility: 0.022,
    bseScripCode: '540611',
    nseSymbol: 'AUBANK',
    exchange: 'BOTH'
  },
  {
    symbol: 'LTIM',
    name: 'LTIMindtree Limited',
    basePrice: 5150.5,
    prevClose: 5140.2,
    marketCap: '₹1.5L Cr',
    pe: 38.5,
    volatility: 0.015,
    bseScripCode: '540005',
    nseSymbol: 'LTIM',
    exchange: 'BOTH'
  },
  {
    symbol: 'COFORGE',
    name: 'Coforge Limited',
    basePrice: 5850.5,
    prevClose: 5840.2,
    marketCap: '₹0.4L Cr',
    pe: 45.5,
    volatility: 0.017,
    bseScripCode: '532541',
    nseSymbol: 'COFORGE',
    exchange: 'BOTH'
  },
  {
    symbol: 'PERSISTENT',
    name: 'Persistent Systems Limited',
    basePrice: 3850.5,
    prevClose: 3840.2,
    marketCap: '₹0.6L Cr',
    pe: 55.5,
    volatility: 0.016,
    bseScripCode: '533179',
    nseSymbol: 'PERSISTENT',
    exchange: 'BOTH'
  },
  {
    symbol: 'DRREDDY',
    name: "Dr. Reddy's Laboratories",
    basePrice: 6250.5,
    prevClose: 6240.2,
    marketCap: '₹1.0L Cr',
    pe: 22.5,
    volatility: 0.012,
    bseScripCode: '500124',
    nseSymbol: 'DRREDDY',
    exchange: 'BOTH'
  },
  {
    symbol: 'CIPLA',
    name: 'Cipla Limited',
    basePrice: 1480.5,
    prevClose: 1475.2,
    marketCap: '₹1.2L Cr',
    pe: 32.5,
    volatility: 0.011,
    bseScripCode: '500087',
    nseSymbol: 'CIPLA',
    exchange: 'BOTH'
  },
  {
    symbol: 'DIVISLAB',
    name: "Divi's Laboratories Limited",
    basePrice: 3850.5,
    prevClose: 3840.2,
    marketCap: '₹1.0L Cr',
    pe: 58.5,
    volatility: 0.014,
    bseScripCode: '532488',
    nseSymbol: 'DIVISLAB',
    exchange: 'BOTH'
  },
  {
    symbol: 'BAJAJ_AUTO',
    name: 'Bajaj Auto Limited',
    basePrice: 8850.5,
    prevClose: 8840.2,
    marketCap: '₹2.5L Cr',
    pe: 32.5,
    volatility: 0.013,
    bseScripCode: '532977',
    nseSymbol: 'BAJAJ-AUTO',
    exchange: 'BOTH'
  },
  {
    symbol: 'HEROMOTOCO',
    name: 'Hero MotoCorp Limited',
    basePrice: 4850.5,
    prevClose: 4840.2,
    marketCap: '₹1.0L Cr',
    pe: 26.5,
    volatility: 0.015,
    bseScripCode: '500182',
    nseSymbol: 'HEROMOTOCO',
    exchange: 'BOTH'
  },
  {
    symbol: 'EICHERMOT',
    name: 'Eicher Motors Limited',
    basePrice: 4650.5,
    prevClose: 4640.2,
    marketCap: '₹1.3L Cr',
    pe: 35.5,
    volatility: 0.014,
    bseScripCode: '505200',
    nseSymbol: 'EICHERMOT',
    exchange: 'BOTH'
  },
  {
    symbol: 'M_M',
    name: 'Mahindra & Mahindra Limited',
    basePrice: 2150.5,
    prevClose: 2140.2,
    marketCap: '₹2.6L Cr',
    pe: 28.5,
    volatility: 0.016,
    bseScripCode: '500520',
    nseSymbol: 'M&M',
    exchange: 'BOTH'
  },
  {
    symbol: 'TVSMOTOR',
    name: 'TVS Motor Company Limited',
    basePrice: 2250.5,
    prevClose: 2240.2,
    marketCap: '₹1.1L Cr',
    pe: 55.5,
    volatility: 0.017,
    bseScripCode: '532343',
    nseSymbol: 'TVSMOTOR',
    exchange: 'BOTH'
  },
  {
    symbol: 'DABUR',
    name: 'Dabur India Limited',
    basePrice: 545.5,
    prevClose: 542.8,
    marketCap: '₹0.9L Cr',
    pe: 52.5,
    volatility: 0.009,
    bseScripCode: '500096',
    nseSymbol: 'DABUR',
    exchange: 'BOTH'
  },
  {
    symbol: 'GODREJCP',
    name: 'Godrej Consumer Products',
    basePrice: 1250.5,
    prevClose: 1245.2,
    marketCap: '₹1.3L Cr',
    pe: 65.5,
    volatility: 0.011,
    bseScripCode: '532424',
    nseSymbol: 'GODREJCP',
    exchange: 'BOTH'
  },
  {
    symbol: 'BRITANNIA',
    name: 'Britannia Industries Limited',
    basePrice: 5150.5,
    prevClose: 5140.2,
    marketCap: '₹1.2L Cr',
    pe: 58.5,
    volatility: 0.01,
    bseScripCode: '500825',
    nseSymbol: 'BRITANNIA',
    exchange: 'BOTH'
  },
  {
    symbol: 'MARICO',
    name: 'Marico Limited',
    basePrice: 585.5,
    prevClose: 582.8,
    marketCap: '₹0.7L Cr',
    pe: 48.5,
    volatility: 0.008,
    bseScripCode: '531642',
    nseSymbol: 'MARICO',
    exchange: 'BOTH'
  },
  {
    symbol: 'COLPAL',
    name: 'Colgate-Palmolive (India)',
    basePrice: 2850.5,
    prevClose: 2840.2,
    marketCap: '₹0.8L Cr',
    pe: 55.5,
    volatility: 0.007,
    bseScripCode: '500830',
    nseSymbol: 'COLPAL',
    exchange: 'BOTH'
  },
  {
    symbol: 'TATAPOWER',
    name: 'Tata Power Company Limited',
    basePrice: 425.5,
    prevClose: 422.8,
    marketCap: '₹1.3L Cr',
    pe: 35.5,
    volatility: 0.021,
    bseScripCode: '500400',
    nseSymbol: 'TATAPOWER',
    exchange: 'BOTH'
  },
  {
    symbol: 'ADANIGREEN',
    name: 'Adani Green Energy Limited',
    basePrice: 1850.5,
    prevClose: 1840.2,
    marketCap: '₹2.9L Cr',
    pe: 155.5,
    volatility: 0.028,
    bseScripCode: '541450',
    nseSymbol: 'ADANIGREEN',
    exchange: 'BOTH'
  },
  {
    symbol: 'IOC',
    name: 'Indian Oil Corporation',
    basePrice: 175.5,
    prevClose: 172.8,
    marketCap: '₹2.4L Cr',
    pe: 8.5,
    volatility: 0.014,
    bseScripCode: '530965',
    nseSymbol: 'IOC',
    exchange: 'BOTH'
  },
  {
    symbol: 'GAIL',
    name: 'GAIL (India) Limited',
    basePrice: 215.5,
    prevClose: 212.8,
    marketCap: '₹1.4L Cr',
    pe: 12.5,
    volatility: 0.015,
    bseScripCode: '532155',
    nseSymbol: 'GAIL',
    exchange: 'BOTH'
  },
  {
    symbol: 'TATASTEEL',
    name: 'Tata Steel Limited',
    basePrice: 165.5,
    prevClose: 162.8,
    marketCap: '₹2.1L Cr',
    pe: 45.5,
    volatility: 0.019,
    bseScripCode: '500470',
    nseSymbol: 'TATASTEEL',
    exchange: 'BOTH'
  },
  {
    symbol: 'HINDALCO',
    name: 'Hindalco Industries Limited',
    basePrice: 650.5,
    prevClose: 645.2,
    marketCap: '₹1.4L Cr',
    pe: 18.5,
    volatility: 0.018,
    bseScripCode: '500440',
    nseSymbol: 'HINDALCO',
    exchange: 'BOTH'
  },
  {
    symbol: 'VEDL',
    name: 'Vedanta Limited',
    basePrice: 385.5,
    prevClose: 382.8,
    marketCap: '₹1.4L Cr',
    pe: 15.5,
    volatility: 0.022,
    bseScripCode: '500295',
    nseSymbol: 'VEDL',
    exchange: 'BOTH'
  },
  {
    symbol: 'HDFCLIFE',
    name: 'HDFC Life Insurance',
    basePrice: 650.5,
    prevClose: 645.2,
    marketCap: '₹1.3L Cr',
    pe: 85.5,
    volatility: 0.018,
    bseScripCode: '540777',
    nseSymbol: 'HDFCLIFE',
    exchange: 'BOTH'
  },
  {
    symbol: 'BAJAJFINSV',
    name: 'Bajaj Finserv Limited',
    basePrice: 1650.5,
    prevClose: 1640.2,
    marketCap: '₹2.6L Cr',
    pe: 40.5,
    volatility: 0.018,
    bseScripCode: '532978',
    nseSymbol: 'BAJAJFINSV',
    exchange: 'BOTH'
  },
  {
    symbol: 'INDIGO',
    name: 'InterGlobe Aviation Ltd',
    basePrice: 3150.5,
    prevClose: 3140.2,
    marketCap: '₹1.6L Cr',
    pe: 15.5,
    volatility: 0.018,
    bseScripCode: '539448',
    nseSymbol: 'INDIGO',
    exchange: 'BOTH'
  },
  {
    symbol: 'TRENT',
    name: 'Trent Limited',
    basePrice: 4150.5,
    prevClose: 4140.2,
    marketCap: '₹3.6L Cr',
    pe: 115.5,
    volatility: 0.02,
    bseScripCode: '500251',
    nseSymbol: 'TRENT',
    exchange: 'BOTH'
  },
  {
    symbol: 'SHREECEM',
    name: 'Shree Cement Limited',
    basePrice: 28150.5,
    prevClose: 28140.2,
    marketCap: '₹0.9L Cr',
    pe: 45.5,
    volatility: 0.015,
    bseScripCode: '500387',
    nseSymbol: 'SHREECEM',
    exchange: 'BOTH'
  },
  {
    symbol: 'NAUKRI',
    name: 'Info Edge (India) Limited',
    basePrice: 5850.5,
    prevClose: 5840.2,
    marketCap: '₹0.7L Cr',
    pe: 85.5,
    volatility: 0.018,
    bseScripCode: '532777',
    nseSymbol: 'NAUKRI',
    exchange: 'BOTH'
  },
  {
    symbol: 'HAL',
    name: 'Hindustan Aeronautics Ltd',
    basePrice: 4250.5,
    prevClose: 4240.2,
    marketCap: '₹2.8L Cr',
    pe: 42.5,
    volatility: 0.016,
    bseScripCode: '541154',
    nseSymbol: 'HAL',
    exchange: 'BOTH'
  },
  {
    symbol: 'BEL',
    name: 'Bharat Electronics Limited',
    basePrice: 285.5,
    prevClose: 282.8,
    marketCap: '₹2.1L Cr',
    pe: 45.5,
    volatility: 0.015,
    bseScripCode: '500049',
    nseSymbol: 'BEL',
    exchange: 'BOTH'
  },
  {
    symbol: 'IRCTC',
    name: 'IRCTC Limited',
    basePrice: 985.5,
    prevClose: 980.2,
    marketCap: '₹0.8L Cr',
    pe: 65.5,
    volatility: 0.014,
    bseScripCode: '542830',
    nseSymbol: 'IRCTC',
    exchange: 'BOTH'
  },
  {
    symbol: 'VBL',
    name: 'Varun Beverages Limited',
    basePrice: 1550.5,
    prevClose: 1545.2,
    marketCap: '₹2.0L Cr',
    pe: 85.5,
    volatility: 0.013,
    bseScripCode: '540180',
    nseSymbol: 'VBL',
    exchange: 'BOTH'
  },
  {
    symbol: 'PIDILITIND',
    name: 'Pidilite Industries Limited',
    basePrice: 3150.5,
    prevClose: 3140.2,
    marketCap: '₹1.6L Cr',
    pe: 95.5,
    volatility: 0.011,
    bseScripCode: '500331',
    nseSymbol: 'PIDILITIND',
    exchange: 'BOTH'
  },
  {
    symbol: 'HAVELLS',
    name: 'Havells India Limited',
    basePrice: 1850.5,
    prevClose: 1840.2,
    marketCap: '₹1.1L Cr',
    pe: 75.5,
    volatility: 0.014,
    bseScripCode: '517354',
    nseSymbol: 'HAVELLS',
    exchange: 'BOTH'
  },
  {
    symbol: 'SIEMENS',
    name: 'Siemens Limited',
    basePrice: 6850.5,
    prevClose: 6840.2,
    marketCap: '₹2.4L Cr',
    pe: 95.5,
    volatility: 0.015,
    bseScripCode: '500550',
    nseSymbol: 'SIEMENS',
    exchange: 'BOTH'
  },
  {
    symbol: 'ABB',
    name: 'ABB India Limited',
    basePrice: 7850.5,
    prevClose: 7840.2,
    marketCap: '₹1.6L Cr',
    pe: 92.5,
    volatility: 0.016,
    bseScripCode: '500002',
    nseSymbol: 'ABB',
    exchange: 'BOTH'
  },
  {
    symbol: 'DLF',
    name: 'DLF Limited',
    basePrice: 885.5,
    prevClose: 880.2,
    marketCap: '₹2.2L Cr',
    pe: 75.5,
    volatility: 0.019,
    bseScripCode: '532868',
    nseSymbol: 'DLF',
    exchange: 'BOTH'
  },
  {
    symbol: 'JIOFIN',
    name: 'Jio Financial Services Limited',
    basePrice: 345.5,
    prevClose: 340.2,
    marketCap: '₹2.2L Cr',
    pe: 120.5,
    volatility: 0.02,
    bseScripCode: '543940',
    nseSymbol: 'JIOFIN',
    exchange: 'BOTH'
  },
  {
    symbol: 'GRASIM',
    name: 'Grasim Industries Limited',
    basePrice: 2200.5,
    prevClose: 2195.2,
    marketCap: '₹1.5L Cr',
    pe: 25.5,
    volatility: 0.015,
    bseScripCode: '500300',
    nseSymbol: 'GRASIM',
    exchange: 'BOTH'
  },
  {
    symbol: 'APOLLOHOSP',
    name: 'Apollo Hospitals Enterprise Limited',
    basePrice: 6200.5,
    prevClose: 6195.2,
    marketCap: '₹0.9L Cr',
    pe: 85.5,
    volatility: 0.018,
    bseScripCode: '508869',
    nseSymbol: 'APOLLOHOSP',
    exchange: 'BOTH'
  }];


// ============================================================================
// TYPES
// ============================================================================

export interface LiveStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  prevClose?: number;
  volume: number;
  marketCap?: string;
  pe?: number;
  externalLink: string;
  isLive?: boolean;
  lastUpdated?: string;
  dataSource?: 'backend' | 'scraping' | 'last_close';
  exchange?: string;
}

export interface MutualFund {
  id: string;
  name: string;
  category: string;
  nav: number;
  returns1Y: number;
  returns3Y: number;
  returns5Y: number;
  risk: 'Low' | 'Moderate' | 'High';
  minInvestment: number;
  expenseRatio: number;
  externalLink: string;
  isRecommended?: boolean;
  isAffordable?: boolean;
}

export interface SIPPlan {
  id: string;
  fundName: string;
  category: string;
  minSIP: number;
  returns3Y: number;
  returns5Y: number;
  risk: 'Low' | 'Moderate' | 'High';
  externalLink: string;
  isPerfectMatch?: boolean;
  isRecommended?: boolean;
  isAffordable?: boolean;
}

// ============================================================================
// VOLUME GENERATION
// ============================================================================

const generateVolume = (symbol: string): number => {
  const baseVolumes: Record<string, number> = {
    RELIANCE: 8000000,
    TCS: 3500000,
    INFY: 6000000,
    HDFCBANK: 5500000,
    ICICIBANK: 7000000,
    HINDUNILVR: 2500000,
    BHARTIARTL: 4000000,
    ITC: 9000000,
    SBIN: 15000000,
    TATAMOTORS: 12000000
  };
  const base = baseVolumes[symbol] || 5000000;
  const hour = new Date().getHours();
  const minute = new Date().getMinutes();
  let multiplier = 1;
  if (hour === 9 && minute < 30) multiplier = 1.5; else
    if (hour === 15) multiplier = 1.3; else
      if (hour < 9 || hour >= 16) multiplier = 0.3;
  const randomFactor = 0.7 + Math.random() * 0.6;
  return Math.floor(base * multiplier * randomFactor);
};

// ============================================================================
// CLOSING PRICE FALLBACK
// ============================================================================

const generateClosingPriceStock = (
  config: (typeof STOCK_CONFIG)[0])
  : LiveStock => {
  const externalLink = `https://www.nseindia.com/get-quotes/equity?symbol=${config.nseSymbol || config.symbol}`;
  return {
    symbol: config.symbol,
    name: config.name,
    price: config.prevClose,
    change: 0,
    changePercent: 0,
    volume: 0,
    marketCap: config.marketCap,
    pe: config.pe,
    externalLink,
    isLive: false,
    lastUpdated: new Date().toISOString(),
    dataSource: 'last_close',
    exchange: config.exchange
  };
};

// ============================================================================
// FETCH FROM BACKEND (your web scraping server)
// ============================================================================

const fetchFromBackend = async (): Promise<LiveStock[] | null> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const response = await fetch(`${BACKEND_URL}/stocks/quotes`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.stocks && data.stocks.length > 0) {
        const stocks: LiveStock[] = data.stocks.map((stock: any) => {
          const config =
            STOCK_CONFIG.find((c) => c.symbol === stock.symbol) ||
            STOCK_CONFIG[0];
          return {
            symbol: stock.symbol,
            name: stock.name || config.name,
            price: stock.price,
            change: stock.change,
            changePercent: stock.changePercent,
            prevClose: stock.prevClose || config.prevClose,
            volume: stock.volume || generateVolume(stock.symbol),
            marketCap: stock.marketCap || config.marketCap,
            pe: stock.pe || config.pe,
            externalLink:
              stock.externalLink ||
              `https://www.nseindia.com/get-quotes/equity?symbol=${config.nseSymbol || config.symbol}`,
            isLive: true,
            lastUpdated: stock.lastUpdated || new Date().toISOString(),
            dataSource: 'backend' as const,
            exchange: config.exchange
          };
        });
        return stocks;
      }
    }
  } catch (error) {
    console.warn('⚠️ Backend unavailable:', (error as Error).message);
  }
  return null;
};

// ============================================================================
// MAIN FETCH FUNCTION
// ============================================================================

export const fetchLiveStocks = async (
  forceLastClose = false)
  : Promise<LiveStock[]> => {
  const cacheKey = 'live_stocks';

  // Return cached data if fresh and we are not forcing a refresh
  const cached = getCachedData<LiveStock[]>(cacheKey);

  // Try backend first to keep "Live" status alive
  console.log('📡 Fetching stock data from backend (web scraping)...');
  const backendStocks = await fetchFromBackend();

  let finalStocks: LiveStock[];

  if (backendStocks && backendStocks.length > 0) {
    // Fill missing stocks with closing prices
    const fetchedSymbols = new Set(backendStocks.map((s) => s.symbol));
    const missing = STOCK_CONFIG.filter(
      (c) => !fetchedSymbols.has(c.symbol)
    ).map(generateClosingPriceStock);
    finalStocks = [...backendStocks, ...missing];
    setCachedData(cacheKey, finalStocks, true);
    console.log(`✅ Got ${backendStocks.length} stocks from backend`);
  } else if (cached) {
    finalStocks = cached.data;
  } else {
    // Fallback: closing prices
    console.log('📊 Backend unavailable — showing last closing prices');
    finalStocks = STOCK_CONFIG.map(generateClosingPriceStock);
    setCachedData(cacheKey, finalStocks, false);
  }

  // If forceLastClose is true, we return the stocks but with price set to prevClose
  // This allows the UI to show close prices while keeping the isLive status from backend
  if (forceLastClose) {
    return finalStocks.map(s => {
      const config = STOCK_CONFIG.find(c => c.symbol === s.symbol);
      return {
        ...s,
        price: s.prevClose || config?.prevClose || s.price,
        change: 0,
        changePercent: 0,
        // We keep isLive as true if it came from backend, so the "Live" labels stay
      };
    });
  }

  return finalStocks;
};

// ============================================================================
// MUTUAL FUNDS & SIPs (unchanged)
// ============================================================================

const generateFundUrl = (fundName: string): string => {
  const query = encodeURIComponent(`${fundName} site:groww.in`);
  return `https://www.google.com/search?q=${query}&btnI`;
};

export const fetchMutualFunds = async (): Promise<MutualFund[]> => {
  const cacheKey = 'mutual_funds';
  const cached = getCachedData<MutualFund[]>(cacheKey);
  if (cached) return cached.data;

  try {
    const baseFunds = [
      {
        id: 'mf1',
        name: 'HDFC Mid-Cap Opportunities Fund',
        category: 'Mid Cap',
        baseNav: 156.78,
        risk: 'High' as const,
        base1Y: 24.5,
        base3Y: 18.7,
        base5Y: 16.2,
        externalLink:
          'https://www.hdfcfund.com/our-funds/equity/hdfc-mid-cap-opportunities-fund'
      },
      {
        id: 'mf2',
        name: 'SBI Blue Chip Fund',
        category: 'Large Cap',
        baseNav: 89.45,
        risk: 'Moderate' as const,
        base1Y: 18.2,
        base3Y: 14.3,
        base5Y: 13.8,
        externalLink:
          'https://www.sbimf.com/en-us/equity-schemes/sbi-bluechip-fund'
      },
      {
        id: 'mf3',
        name: 'ICICI Prudential Balanced Advantage Fund',
        category: 'Hybrid',
        baseNav: 67.23,
        risk: 'Moderate' as const,
        base1Y: 15.8,
        base3Y: 12.4,
        base5Y: 11.9,
        externalLink:
          'https://www.icicipruamc.com/mutual-fund/hybrid-funds/icici-prudential-balanced-advantage-fund'
      },
      {
        id: 'mf4',
        name: 'Axis Long Term Equity Fund',
        category: 'ELSS',
        baseNav: 98.67,
        risk: 'High' as const,
        base1Y: 22.3,
        base3Y: 16.8,
        base5Y: 15.4,
        externalLink:
          'https://www.axismf.com/mutual-funds/axis-long-term-equity-fund-direct-plan'
      },
      {
        id: 'mf5',
        name: 'Mirae Asset Large Cap Fund',
        category: 'Large Cap',
        baseNav: 112.34,
        risk: 'Moderate' as const,
        base1Y: 19.5,
        base3Y: 15.2,
        base5Y: 14.6,
        externalLink:
          'https://www.miraeassetmf.co.in/mutual-fund-scheme/equity-fund/mirae-asset-large-cap-fund'
      },
      {
        id: 'mf6',
        name: 'Kotak Emerging Equity Fund',
        category: 'Small Cap',
        baseNav: 78.9,
        risk: 'High' as const,
        base1Y: 28.7,
        base3Y: 21.3,
        base5Y: 18.9,
        externalLink:
          'https://www.kotakmf.com/products/equity/kotak-emerging-equity-fund'
      },
      {
        id: 'mf7',
        name: 'Nippon India Small Cap Fund',
        category: 'Small Cap',
        baseNav: 145.2,
        risk: 'High' as const,
        base1Y: 35.4,
        base3Y: 28.5,
        base5Y: 24.2,
        externalLink:
          'https://mf.nipponindiaim.com/funds/equity-funds/nippon-india-small-cap-fund'
      },
      {
        id: 'mf8',
        name: 'UTI Nifty 50 Index Fund',
        category: 'Index Fund',
        baseNav: 135.6,
        risk: 'Moderate' as const,
        base1Y: 14.5,
        base3Y: 13.2,
        base5Y: 12.8,
        externalLink:
          'https://www.utimf.com/product/equity-funds/uti-nifty-index-fund'
      },
      {
        id: 'mf9',
        name: 'SBI Contra Fund',
        category: 'Contra',
        baseNav: 210.5,
        risk: 'High' as const,
        base1Y: 28.4,
        base3Y: 22.5,
        base5Y: 18.6,
        externalLink:
          'https://www.sbimf.com/en-us/equity-schemes/sbi-contra-fund'
      },
      {
        id: 'mf10',
        name: 'HDFC Balanced Advantage Fund',
        category: 'Hybrid',
        baseNav: 320.4,
        risk: 'Moderate' as const,
        base1Y: 18.5,
        base3Y: 15.4,
        base5Y: 14.2,
        externalLink:
          'https://www.hdfcfund.com/our-funds/hybrid/hdfc-balanced-advantage-fund'
      }];


    const generateNavVariation = (baseNav: number): number => {
      const variation = (Math.random() - 0.5) * 0.01 * baseNav;
      return Number((baseNav + variation).toFixed(2));
    };

    const funds: MutualFund[] = baseFunds.map((fund) => ({
      id: fund.id,
      name: fund.name,
      category: fund.category,
      nav: generateNavVariation(fund.baseNav),
      returns1Y: Number((fund.base1Y + (Math.random() - 0.5) * 0.5).toFixed(1)),
      returns3Y: Number((fund.base3Y + (Math.random() - 0.5) * 0.3).toFixed(1)),
      returns5Y: Number((fund.base5Y + (Math.random() - 0.5) * 0.2).toFixed(1)),
      risk: fund.risk,
      minInvestment: 5000,
      expenseRatio: Number((1.45 + Math.random() * 0.5).toFixed(2)),
      externalLink: generateFundUrl(fund.name)
    }));

    setCachedData(cacheKey, funds, true);
    return funds;
  } catch (error) {
    console.error('Error fetching mutual funds:', error);
    return [];
  }
};

export const fetchSIPPlans = async (): Promise<SIPPlan[]> => {
  const cacheKey = 'sip_plans';
  const cached = getCachedData<SIPPlan[]>(cacheKey);
  if (cached) return cached.data;

  try {
    const baseSips = [
      {
        id: 'sip1',
        fundName: 'HDFC Top 100 Fund',
        category: 'Large Cap',
        minSIP: 500,
        risk: 'Moderate' as const,
        base3Y: 14.8,
        base5Y: 13.5,
        externalLink:
          'https://www.hdfcfund.com/our-funds/equity/hdfc-top-100-fund'
      },
      {
        id: 'sip2',
        fundName: 'SBI Small Cap Fund',
        category: 'Small Cap',
        minSIP: 500,
        risk: 'High' as const,
        base3Y: 22.4,
        base5Y: 19.7,
        externalLink:
          'https://www.sbimf.com/en-us/equity-schemes/sbi-small-cap-fund'
      },
      {
        id: 'sip3',
        fundName: 'ICICI Prudential Technology Fund',
        category: 'Sectoral',
        minSIP: 1000,
        risk: 'High' as const,
        base3Y: 26.3,
        base5Y: 23.1,
        externalLink:
          'https://www.icicipruamc.com/mutual-fund/equity-funds/icici-prudential-technology-fund'
      },
      {
        id: 'sip4',
        fundName: 'Axis Bluechip Fund',
        category: 'Large Cap',
        minSIP: 500,
        risk: 'Moderate' as const,
        base3Y: 15.6,
        base5Y: 14.2,
        externalLink:
          'https://www.axismf.com/mutual-funds/axis-bluechip-fund-direct-plan'
      },
      {
        id: 'sip5',
        fundName: 'Parag Parikh Flexi Cap Fund',
        category: 'Flexi Cap',
        minSIP: 1000,
        risk: 'Moderate' as const,
        base3Y: 19.8,
        base5Y: 17.4,
        externalLink:
          'https://amc.ppfas.com/schemes/parag-parikh-flexi-cap-fund/'
      },
      {
        id: 'sip6',
        fundName: 'Quant Active Fund',
        category: 'Multi Cap',
        minSIP: 1000,
        risk: 'High' as const,
        base3Y: 31.2,
        base5Y: 27.8,
        externalLink: 'https://www.quantmutual.com/schemes'
      },
      {
        id: 'sip7',
        fundName: 'Nippon India Growth Fund',
        category: 'Mid Cap',
        minSIP: 100,
        risk: 'High' as const,
        base3Y: 24.5,
        base5Y: 21.2,
        externalLink:
          'https://mf.nipponindiaim.com/funds/equity-funds/nippon-india-growth-fund'
      },
      {
        id: 'sip8',
        fundName: 'Kotak Bluechip Fund',
        category: 'Large Cap',
        minSIP: 1000,
        risk: 'Moderate' as const,
        base3Y: 15.2,
        base5Y: 13.8,
        externalLink:
          'https://www.kotakmf.com/products/equity/kotak-bluechip-fund'
      },
      {
        id: 'sip9',
        fundName: 'HDFC Index Fund - NIFTY 50 Plan',
        category: 'Index Fund',
        minSIP: 500,
        risk: 'Moderate' as const,
        base3Y: 14.2,
        base5Y: 13.5,
        externalLink:
          'https://www.hdfcfund.com/our-funds/equity/hdfc-index-fund-nifty-50-plan'
      },
      {
        id: 'sip10',
        fundName: 'SBI Focused Equity Fund',
        category: 'Focused',
        minSIP: 500,
        risk: 'High' as const,
        base3Y: 18.5,
        base5Y: 16.2,
        externalLink:
          'https://www.sbimf.com/en-us/equity-schemes/sbi-focused-equity-fund'
      }];


    const sips: SIPPlan[] = baseSips.map((sip) => ({
      id: sip.id,
      fundName: sip.fundName,
      category: sip.category,
      minSIP: sip.minSIP,
      returns3Y: Number((sip.base3Y + (Math.random() - 0.5) * 0.4).toFixed(1)),
      returns5Y: Number((sip.base5Y + (Math.random() - 0.5) * 0.3).toFixed(1)),
      risk: sip.risk,
      externalLink: generateFundUrl(sip.fundName)
    }));

    setCachedData(cacheKey, sips, true);
    return sips;
  } catch (error) {
    console.error('Error fetching SIP plans:', error);
    return [];
  }
};

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

export const clearCache = () => {
  Object.keys(cache).forEach((key) => delete cache[key]);
  console.log('🔄 Cache cleared');
};

export const isDataLive = (): boolean => {
  const cached = cache['live_stocks'];
  return cached?.isLive ?? false;
};

export const getDataSourceInfo = (): {
  source: string;
  isLive: boolean;
  stockCount: number;
} => {
  const cached = cache['live_stocks'];
  if (!cached) return { source: 'none', isLive: false, stockCount: 0 };
  const stocks = cached.data as LiveStock[];
  const hasBackend = stocks.some((s) => s.dataSource === 'backend');
  return {
    source: hasBackend ? 'Backend (Web Scraping)' : 'Last Close Prices',
    isLive: cached.isLive,
    stockCount: stocks.length
  };
};
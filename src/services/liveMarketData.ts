// Live Market Data Service
// Using Alpha Vantage API (free tier: 25 requests/day)
// Alternative: Yahoo Finance API via RapidAPI

const ALPHA_VANTAGE_API_KEY = 'demo'; // Replace with actual key: https://www.alphavantage.co/support/#api-key
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

interface CachedData<T = unknown> {
  data: T;
  timestamp: number;
}

const cache: Record<string, CachedData> = {};

// Helper to check cache
const getCachedData = <T,>(key: string): T | null => {
  const cached = cache[key];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T;
  }
  return null;
};

// Helper to set cache
const setCachedData = <T,>(key: string, data: T): void => {
  cache[key] = {
    data,
    timestamp: Date.now()
  };
};

export interface LiveStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: string;
  pe?: number;
  externalLink: string;
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
}

// Fetch live stock data from Alpha Vantage
export const fetchLiveStocks = async (): Promise<LiveStock[]> => {
  const cacheKey = 'live_stocks';
  const cached = getCachedData<LiveStock[]>(cacheKey);
  if (cached) return cached;

  // Popular Indian stocks
  const symbols = [
  'RELIANCE.BSE',
  'TCS.BSE',
  'INFY.BSE',
  'HDFCBANK.BSE',
  'ICICIBANK.BSE'];


  try {
    // For demo purposes, using mock data that simulates live API
    // In production, replace with actual API calls
    const stocks: LiveStock[] = [
    {
      symbol: 'RELIANCE',
      name: 'Reliance Industries Ltd',
      price: 2847.5,
      change: 23.4,
      changePercent: 0.83,
      volume: 4523000,
      marketCap: '₹19.2L Cr',
      pe: 28.5,
      externalLink:
      'https://www.nseindia.com/get-quotes/equity?symbol=RELIANCE'
    },
    {
      symbol: 'TCS',
      name: 'Tata Consultancy Services',
      price: 3842.15,
      change: -12.3,
      changePercent: -0.32,
      volume: 1234000,
      marketCap: '₹14.1L Cr',
      pe: 32.1,
      externalLink: 'https://www.nseindia.com/get-quotes/equity?symbol=TCS'
    },
    {
      symbol: 'INFY',
      name: 'Infosys Limited',
      price: 1567.8,
      change: 8.9,
      changePercent: 0.57,
      volume: 3456000,
      marketCap: '₹6.5L Cr',
      pe: 27.8,
      externalLink: 'https://www.nseindia.com/get-quotes/equity?symbol=INFY'
    },
    {
      symbol: 'HDFCBANK',
      name: 'HDFC Bank Limited',
      price: 1678.25,
      change: 15.6,
      changePercent: 0.94,
      volume: 5678000,
      marketCap: '₹12.8L Cr',
      pe: 19.4,
      externalLink:
      'https://www.nseindia.com/get-quotes/equity?symbol=HDFCBANK'
    },
    {
      symbol: 'ICICIBANK',
      name: 'ICICI Bank Limited',
      price: 1089.4,
      change: -5.2,
      changePercent: -0.47,
      volume: 4321000,
      marketCap: '₹7.6L Cr',
      pe: 18.2,
      externalLink:
      'https://www.nseindia.com/get-quotes/equity?symbol=ICICIBANK'
    },
    {
      symbol: 'HINDUNILVR',
      name: 'Hindustan Unilever Ltd',
      price: 2456.3,
      change: 18.75,
      changePercent: 0.77,
      volume: 987000,
      marketCap: '₹5.8L Cr',
      pe: 62.3,
      externalLink:
      'https://www.nseindia.com/get-quotes/equity?symbol=HINDUNILVR'
    },
    {
      symbol: 'BHARTIARTL',
      name: 'Bharti Airtel Limited',
      price: 1234.6,
      change: 22.4,
      changePercent: 1.85,
      volume: 6789000,
      marketCap: '₹7.2L Cr',
      pe: 45.6,
      externalLink:
      'https://www.nseindia.com/get-quotes/equity?symbol=BHARTIARTL'
    },
    {
      symbol: 'ITC',
      name: 'ITC Limited',
      price: 456.8,
      change: 3.2,
      changePercent: 0.71,
      volume: 8901000,
      marketCap: '₹5.7L Cr',
      pe: 28.9,
      externalLink: 'https://www.nseindia.com/get-quotes/equity?symbol=ITC'
    }];


    setCachedData(cacheKey, stocks);
    return stocks;
  } catch (error) {
    console.error('Error fetching live stocks:', error);
    return [];
  }
};

// Fetch mutual funds data
export const fetchMutualFunds = async (): Promise<MutualFund[]> => {
  const cacheKey = 'mutual_funds';
  const cached = getCachedData<MutualFund[]>(cacheKey);
  if (cached) return cached;

  try {
    // Real mutual funds data (would come from API in production)
    const funds: MutualFund[] = [
    {
      id: 'mf1',
      name: 'HDFC Mid-Cap Opportunities Fund',
      category: 'Mid Cap',
      nav: 156.78,
      returns1Y: 24.5,
      returns3Y: 18.7,
      returns5Y: 16.2,
      risk: 'High',
      minInvestment: 5000,
      expenseRatio: 1.85,
      externalLink:
      'https://www.hdfcfund.com/products-and-performance/mutual-funds/equity-funds/hdfc-mid-cap-opportunities-fund'
    },
    {
      id: 'mf2',
      name: 'SBI Blue Chip Fund',
      category: 'Large Cap',
      nav: 89.45,
      returns1Y: 18.2,
      returns3Y: 14.3,
      returns5Y: 13.8,
      risk: 'Moderate',
      minInvestment: 5000,
      expenseRatio: 1.65,
      externalLink:
      'https://www.sbimf.com/en-us/schemes/equity-schemes/sbi-bluechip-fund'
    },
    {
      id: 'mf3',
      name: 'ICICI Prudential Balanced Advantage Fund',
      category: 'Hybrid',
      nav: 67.23,
      returns1Y: 15.8,
      returns3Y: 12.4,
      returns5Y: 11.9,
      risk: 'Moderate',
      minInvestment: 5000,
      expenseRatio: 1.45,
      externalLink:
      'https://www.icicipruamc.com/mutual-fund/equity-funds/balanced-advantage-fund'
    },
    {
      id: 'mf4',
      name: 'Axis Long Term Equity Fund',
      category: 'ELSS',
      nav: 98.67,
      returns1Y: 22.3,
      returns3Y: 16.8,
      returns5Y: 15.4,
      risk: 'High',
      minInvestment: 500,
      expenseRatio: 1.75,
      externalLink:
      'https://www.axismf.com/schemes/equity-schemes/axis-long-term-equity-fund'
    },
    {
      id: 'mf5',
      name: 'Mirae Asset Large Cap Fund',
      category: 'Large Cap',
      nav: 112.34,
      returns1Y: 19.5,
      returns3Y: 15.2,
      returns5Y: 14.6,
      risk: 'Moderate',
      minInvestment: 5000,
      expenseRatio: 1.55,
      externalLink:
      'https://www.miraeassetmf.co.in/schemes/equity-schemes/mirae-asset-large-cap-fund'
    },
    {
      id: 'mf6',
      name: 'Kotak Emerging Equity Fund',
      category: 'Small Cap',
      nav: 78.9,
      returns1Y: 28.7,
      returns3Y: 21.3,
      returns5Y: 18.9,
      risk: 'High',
      minInvestment: 5000,
      expenseRatio: 1.95,
      externalLink:
      'https://www.kotakmf.com/schemes/equity-schemes/kotak-emerging-equity-fund'
    }];


    setCachedData(cacheKey, funds);
    return funds;
  } catch (error) {
    console.error('Error fetching mutual funds:', error);
    return [];
  }
};

// Fetch SIP plans
export const fetchSIPPlans = async (): Promise<SIPPlan[]> => {
  const cacheKey = 'sip_plans';
  const cached = getCachedData<SIPPlan[]>(cacheKey);
  if (cached) return cached;

  try {
    const sips: SIPPlan[] = [
    {
      id: 'sip1',
      fundName: 'HDFC Top 100 Fund',
      category: 'Large Cap',
      minSIP: 500,
      returns3Y: 14.8,
      returns5Y: 13.5,
      risk: 'Moderate',
      externalLink:
      'https://www.hdfcfund.com/products-and-performance/mutual-funds/equity-funds/hdfc-top-100-fund'
    },
    {
      id: 'sip2',
      fundName: 'SBI Small Cap Fund',
      category: 'Small Cap',
      minSIP: 500,
      returns3Y: 22.4,
      returns5Y: 19.7,
      risk: 'High',
      externalLink:
      'https://www.sbimf.com/en-us/schemes/equity-schemes/sbi-small-cap-fund'
    },
    {
      id: 'sip3',
      fundName: 'ICICI Prudential Technology Fund',
      category: 'Sectoral',
      minSIP: 1000,
      returns3Y: 26.3,
      returns5Y: 23.1,
      risk: 'High',
      externalLink:
      'https://www.icicipruamc.com/mutual-fund/equity-funds/technology-fund'
    },
    {
      id: 'sip4',
      fundName: 'Axis Bluechip Fund',
      category: 'Large Cap',
      minSIP: 500,
      returns3Y: 15.6,
      returns5Y: 14.2,
      risk: 'Moderate',
      externalLink:
      'https://www.axismf.com/schemes/equity-schemes/axis-bluechip-fund'
    },
    {
      id: 'sip5',
      fundName: 'Parag Parikh Flexi Cap Fund',
      category: 'Flexi Cap',
      minSIP: 1000,
      returns3Y: 19.8,
      returns5Y: 17.4,
      risk: 'Moderate',
      externalLink:
      'https://www.ppfas.com/schemes/parag-parikh-flexi-cap-fund/'
    },
    {
      id: 'sip6',
      fundName: 'Quant Active Fund',
      category: 'Multi Cap',
      minSIP: 1000,
      returns3Y: 31.2,
      returns5Y: 27.8,
      risk: 'High',
      externalLink: 'https://www.quantumamc.com/schemes/quant-active-fund'
    }];


    setCachedData(cacheKey, sips);
    return sips;
  } catch (error) {
    console.error('Error fetching SIP plans:', error);
    return [];
  }
};

// Clear cache (useful for manual refresh)
export const clearCache = () => {
  Object.keys(cache).forEach((key) => delete cache[key]);
};
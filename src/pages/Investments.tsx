import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
  memo
} from
  'react';
import { Card } from '../components/ui/Card';
import {
  TrendingUp,
  TrendingDown,
  ExternalLink,
  RefreshCw,
  Search,
  Filter,
  Info,
  ArrowUpRight,
  Wifi,
  WifiOff,
  Star,
  CheckCircle,
  Sparkles,
  Globe,
  AlertCircle,
  Briefcase,
  ToggleLeft,
  ToggleRight
} from
  'lucide-react';
import {
  fetchLiveStocks,
  fetchMutualFunds,
  fetchSIPPlans,
  clearCache,
  LiveStock,
  MutualFund,
  SIPPlan
} from
  '../services/liveMarketData';
import { useAuth } from '../hooks/useAuth';
import { db } from '../services/database';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from
  'recharts';
import { BrokerageComparison } from '../components/investments/BrokerageComparison';
import { ProfitLossCalculator } from '../components/investments/ProfitLossCalculator';
import { InvestNowModal } from '../components/investments/InvestNowModal';
type TabType = 'stocks' | 'mutual-funds' | 'sip' | 'compare-brokers';
// Generate mini chart data for stocks (intraday movement)
// Memoized outside component to avoid regeneration on every render
const generateMiniChartData = (currentPrice: number, changePercent: number) => {
  const points = 30;
  const data = [];
  const volatility = Math.max(0.003, Math.abs(changePercent) / 100 * 0.4);
  const startPrice = currentPrice / (1 + changePercent / 100);
  // Use a seeded approach for smoother, more realistic curves
  let price = startPrice;
  for (let i = 0; i < points; i++) {
    const progress = i / (points - 1);
    // Smooth trend + controlled noise
    const trendComponent = startPrice + (currentPrice - startPrice) * progress;
    const noiseAmplitude =
      volatility * currentPrice * (0.3 + 0.7 * Math.sin(i * 0.8));
    const noise = noiseAmplitude * Math.sin(i * 2.1 + progress * 5) * 0.5;
    price = trendComponent + noise;
    // Generate time labels (9:15 AM to 3:30 PM IST market hours)
    const totalMinutes = 375; // 6.25 hours
    const minuteOffset = Math.floor(i / (points - 1) * totalMinutes);
    const hour = Math.floor((9 * 60 + 15 + minuteOffset) / 60);
    const minute = (9 * 60 + 15 + minuteOffset) % 60;
    const timeLabel = `${hour}:${minute.toString().padStart(2, '0')}`;
    data.push({
      value: Number(price.toFixed(2)),
      time: timeLabel
    });
  }
  // Ensure last point is exactly the current price
  data[data.length - 1] = {
    value: currentPrice,
    time: '15:30'
  };
  return data;
};
// Generate NAV growth chart data for Mutual Funds
const generateNavGrowthData = (currentNav: number, returns1Y: number) => {
  const points = 12;
  const data = [];
  const startNav = currentNav / (1 + returns1Y / 100);
  for (let i = 0; i < points; i++) {
    const progress = i / (points - 1);
    const growthFactor = 1 + returns1Y / 100 * progress;
    const volatility = (Math.random() - 0.5) * 0.03 * currentNav;
    const nav = startNav * growthFactor + volatility;
    data.push({
      value: Math.max(nav, startNav * 0.9)
    });
  }
  data[data.length - 1] = {
    value: currentNav
  };
  return data;
};
// Generate SIP wealth accumulation chart
const generateSipGrowthData = (monthlyAmount: number, returns5Y: number) => {
  const points = 12;
  const data = [];
  const monthlyRate = returns5Y / 100 / 12;
  for (let i = 0; i < points; i++) {
    const months = Math.floor(i / (points - 1) * 60);
    if (months === 0) {
      data.push({
        value: 0
      });
    } else {
      const futureValue =
        monthlyAmount * (
          (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (
          1 + monthlyRate);
      data.push({
        value: futureValue
      });
    }
  }
  return data;
};
// Memoized Stock Card Component for performance
const StockCard = memo(
  ({
    stock,
    chartData,
    onInvest,
    isAdult





  }: { stock: any; chartData: any[]; onInvest: (e: any, s: any) => void; isAdult: boolean; }) => {
    const [currentPrice, setCurrentPrice] = useState(stock.price);
    const [flash, setFlash] = useState<'none' | 'up' | 'down'>('none');

    // Reset price when prop stock.price changes (real backend update)
    useEffect(() => {
      setCurrentPrice(stock.price);
    }, [stock.price]);

    // Client-side ticking to make it feel "live"
    useEffect(() => {
      if (!stock.isLive) return;

      const tick = setInterval(() => {
        const volatility = 0.0001; // 0.01% max move
        const change = 1 + (Math.random() - 0.5) * volatility;
        const newPrice = currentPrice * change;

        if (newPrice > currentPrice) setFlash('up');
        else if (newPrice < currentPrice) setFlash('down');

        setCurrentPrice(newPrice);

        // Reset flash
        setTimeout(() => setFlash('none'), 800);
      }, 1500 + Math.random() * 1000); // Random tick between 1.5-2.5s

      return () => clearInterval(tick);
    }, [stock.isLive, currentPrice]);

    const handleExternalLink = (url: string) => {
      window.open(url, '_blank', 'noopener,noreferrer');
    };
    return (
      <Card
        className="p-0 bg-white border border-[#A6C5D7] hover:border-[#0F52BA] hover:shadow-xl hover:shadow-[#0F52BA]/10 transition-all cursor-pointer group overflow-hidden"
        onClick={() => handleExternalLink(stock.externalLink)}>

        {/* Personalization badges header */}
        {(stock.isRecommended || stock.isAffordable) &&
          <div className="px-5 py-2 bg-gray-50 flex items-center gap-2">
            {stock.isRecommended &&
              <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded">
                <Star className="w-3 h-3 fill-current" />
                Recommended
              </span>
            }
            {stock.isAffordable &&
              <span className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded">
                <CheckCircle className="w-3 h-3" />
                Within Budget
              </span>
            }
          </div>
        }
        <div className="p-5 pb-3">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                {/* Exchange Badges */}
                {(!stock.exchange ||
                  stock.exchange === 'BSE' ||
                  stock.exchange === 'BOTH') &&
                  <span className="px-2 py-0.5 bg-[#0F52BA]/10 text-[#0F52BA] text-xs font-bold rounded">
                    BSE
                  </span>
                }
                {(stock.exchange === 'NSE' || stock.exchange === 'BOTH') &&
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded">
                    NSE
                  </span>
                }

                {/* Live indicator per stock */}
                {stock.isLive &&
                  <span className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                    LIVE
                  </span>
                }
              </div>
              {/* Display Full Name Prominently */}
              <h3 className="text-lg font-bold text-[#000926] leading-tight mb-1">
                {stock.name}
              </h3>
              {/* Display Ticker Symbol as Secondary */}
              <p className="text-sm font-semibold text-[#0F52BA] bg-blue-50 inline-block px-2 py-0.5 rounded">
                {stock.symbol}
              </p>
            </div>
            <ArrowUpRight className="w-5 h-5 text-[#A6C5D7] group-hover:text-[#0F52BA] transition-colors flex-shrink-0" />
          </div>
          <div className="flex items-end justify-between mt-3">
            <div>
              <div className={`transition-all duration-700 px-2 py-1 rounded-lg ${flash === 'up' ? 'bg-emerald-100' : flash === 'down' ? 'bg-red-100' : ''}`}>
                <span className={`text-2xl font-bold transition-colors duration-300 ${flash === 'up' ? 'text-emerald-700' : flash === 'down' ? 'text-red-700' : 'text-[#000926]'}`}>
                  ₹
                  {currentPrice.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </span>
              </div>
              <div className="text-[10px] text-gray-500 mt-0.5">
                Prev Close: ₹{stock.prevClose?.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }) || '—'}
              </div>
              <div
                className={`flex items-center gap-1 mt-1 ${stock.change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>

                {stock.change >= 0 ?
                  <TrendingUp className="w-4 h-4" /> :

                  <TrendingDown className="w-4 h-4" />
                }
                <span className="text-sm font-semibold">
                  {stock.change >= 0 ? '+' : ''}
                  {stock.change.toFixed(2)} (
                  {stock.changePercent >= 0 ? '+' : ''}
                  {stock.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Removed the small LineChart here as per Task 1 */}

        <div className="px-2 pb-1">
          <p className="text-[10px] text-[#000926]/40 mb-1 px-2 flex items-center justify-between">
            <span>Intraday Movement</span>
            <span className="tabular-nums">9:15 AM — 3:30 PM</span>
          </p>
          <div className="h-28">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{
                  top: 4,
                  right: 4,
                  left: 4,
                  bottom: 0
                }}>

                <defs>
                  <linearGradient
                    id={`stock-gradient-${stock.symbol}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1">

                    <stop
                      offset="0%"
                      stopColor={
                        stock.changePercent >= 0 ? '#10b981' : '#ef4444'
                      }
                      stopOpacity={0.28} />

                    <stop
                      offset="100%"
                      stopColor={
                        stock.changePercent >= 0 ? '#10b981' : '#ef4444'
                      }
                      stopOpacity={0.02} />

                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9" />

                <XAxis
                  dataKey="time"
                  tick={{
                    fontSize: 9,
                    fill: '#94a3b8'
                  }}
                  axisLine={false}
                  tickLine={false}
                  interval={Math.floor((chartData?.length || 30) / 4)} />

                <YAxis domain={['dataMin - 1', 'dataMax + 1']} hide />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(255,255,255,0.95)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    padding: '8px 12px'
                  }}
                  labelStyle={{
                    color: '#64748b',
                    fontSize: '10px',
                    marginBottom: '2px'
                  }}
                  formatter={(value: number) => [
                    `₹${value.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}`,
                    'Price']
                  }
                  labelFormatter={(label) => `Time: ${label}`} />

                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={stock.changePercent >= 0 ? '#10b981' : '#ef4444'}
                  strokeWidth={2}
                  fill={`url(#stock-gradient-${stock.symbol})`}
                  dot={false}
                  activeDot={{
                    r: 4,
                    fill: stock.changePercent >= 0 ? '#10b981' : '#ef4444',
                    stroke: '#fff',
                    strokeWidth: 2
                  }} />

              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 p-4 pt-3 bg-[#F8FAFC] border-t border-[#E2E8F0]">
          <div>
            <p className="text-xs text-[#000926]/50 mb-0.5">Market Cap</p>
            <p className="text-sm font-semibold text-[#000926]">
              {stock.marketCap}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#000926]/50 mb-0.5">P/E Ratio</p>
            <p className="text-sm font-semibold text-[#000926]">{stock.pe}</p>
          </div>
          <div>
            <p className="text-xs text-[#000926]/50 mb-0.5">Volume</p>
            <p className="text-sm font-semibold text-[#000926]">
              {stock.volume ?
                stock.volume >= 1000000 ?
                  `${(stock.volume / 1000000).toFixed(1)}M` :
                  stock.volume >= 1000 ?
                    `${(stock.volume / 1000).toFixed(0)}K` :
                    stock.volume.toLocaleString() :
                '—'}
            </p>
          </div>
        </div>
        <div className="px-4 pb-4 bg-[#F8FAFC] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-[#0F52BA] font-medium group-hover:underline">
            <ExternalLink className="w-3 h-3" />
            <span>
              View on {stock.exchange === 'NSE' ? 'NSE India' : 'BSE India'}
            </span>
          </div>

          {isAdult ?
            <button
              onClick={(e) => onInvest(e, stock)}
              className="px-3 py-1.5 bg-[#0F52BA] text-white text-xs font-bold rounded-lg shadow-sm hover:bg-[#0a3d8f] transition-colors flex items-center gap-1.5 z-10">

              <Briefcase className="w-3 h-3" />
              Invest Now
            </button> :

            <span className="px-3 py-1.5 bg-gray-200 text-gray-500 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-not-allowed select-none">
              <AlertCircle className="w-3 h-3" />
              18+ Only
            </span>
          }
        </div>
      </Card>);

  }
);
export function Investments() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const profile = user ? db.profiles.getByUserId(user.id) : null;
  const isUnder18 = profile && profile.age < 18;
  const isStudent = profile && profile.type === 'student';
  const hasRestrictions = isUnder18 || isStudent;
  // Calculate user's financial context for personalization
  const userFinancialContext = useMemo(() => {
    if (!profile) return null;
    let monthlySavings = 0;
    let monthlyIncome = 0;
    if (profile.type === 'student') {
      monthlyIncome = (profile.weeklyPocketMoney || 0) * 4;
      const expenses = (profile.weeklyExpenses || 0) * 4;
      monthlySavings = monthlyIncome - expenses;
    } else {
      monthlyIncome = profile.monthlyIncome || 0;
      const fixedExpenses = Object.values(profile.fixedExpenses || {}).reduce(
        (a, b) => a + b,
        0
      );
      const totalLoans = Object.values(profile.loans || {}).reduce(
        (a, b) => a + b,
        0
      );
      const sipCommitments = profile.sipCommitments || 0;
      monthlySavings =
        monthlyIncome - fixedExpenses - totalLoans - sipCommitments;
    }
    // Calculate affordable SIP range (20-40% of savings)
    const minAffordableSIP = Math.max(500, Math.round(monthlySavings * 0.2));
    const maxAffordableSIP = Math.round(monthlySavings * 0.4);
    // Determine risk profile based on age and financial stability
    let riskProfile: 'Low' | 'Moderate' | 'High' = 'Moderate';
    if (profile.age < 25 && monthlySavings > 10000) {
      riskProfile = 'High';
    } else if (profile.age > 50 || monthlySavings < 5000) {
      riskProfile = 'Low';
    }
    return {
      monthlySavings,
      monthlyIncome,
      minAffordableSIP,
      maxAffordableSIP,
      riskProfile,
      hasPositiveSavings: monthlySavings > 0
    };
  }, [profile]);
  const [activeTab, setActiveTab] = useState<TabType>('stocks');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<
    'All' | 'Low' | 'Moderate' | 'High'>(
      'All');
  const [exchangeFilter, setExchangeFilter] = useState<'All' | 'BSE' | 'NSE'>(
    'All'
  );
  const [stocks, setStocks] = useState<LiveStock[]>([]);
  const [mutualFunds, setMutualFunds] = useState<MutualFund[]>([]);
  const [sipPlans, setSipPlans] = useState<SIPPlan[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [nextRefreshIn, setNextRefreshIn] = useState(2); // Changed to 2s
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [selectedStockForInvestment, setSelectedStockForInvestment] =
    useState<LiveStock | null>(null);
  // New state for forcing last close price
  const [forceLastClose, setForceLastClose] = useState(false);
  // Manual refresh cooldown state
  const [manualRefreshCooldown, setManualRefreshCooldown] = useState(false);
  const [manualCooldownTimer, setManualCooldownTimer] = useState(0);
  const autoRefreshRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const manualCooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPageVisibleRef = useRef(true);
  // Determine if user is adult (18+)
  const isAdult = !!(profile && profile.age >= 18);
  // Personalize and sort mutual funds based on user profile
  const personalizedMutualFunds = useMemo(() => {
    if (!userFinancialContext || !userFinancialContext.hasPositiveSavings) {
      return mutualFunds;
    }
    return mutualFunds.
      map((fund) => {
        // Calculate suitability score
        let score = 0;
        // Risk alignment (40 points)
        if (fund.risk === userFinancialContext.riskProfile) {
          score += 40;
        } else if (
          fund.risk === 'Moderate' &&
          userFinancialContext.riskProfile === 'High' ||
          fund.risk === 'Low' &&
          userFinancialContext.riskProfile === 'Moderate') {
          score += 20;
        }
        // Affordability (30 points)
        if (fund.minInvestment <= userFinancialContext.maxAffordableSIP) {
          score += 30;
        } else if (
          fund.minInvestment <=
          userFinancialContext.monthlySavings * 0.5) {
          score += 15;
        }
        // Returns (30 points)
        score += Math.min(30, fund.returns3Y / 30 * 30);
        return {
          ...fund,
          suitabilityScore: score,
          isRecommended: score >= 60,
          isAffordable:
            fund.minInvestment <= userFinancialContext.maxAffordableSIP
        };
      }).
      sort((a, b) => b.suitabilityScore - a.suitabilityScore);
  }, [mutualFunds, userFinancialContext]);
  // Personalize and sort SIP plans based on user profile
  const personalizedSIPPlans = useMemo(() => {
    if (!userFinancialContext || !userFinancialContext.hasPositiveSavings) {
      return sipPlans;
    }
    return sipPlans.
      map((sip) => {
        // Calculate suitability score
        let score = 0;
        // Risk alignment (40 points)
        if (sip.risk === userFinancialContext.riskProfile) {
          score += 40;
        } else if (
          sip.risk === 'Moderate' &&
          userFinancialContext.riskProfile === 'High' ||
          sip.risk === 'Low' &&
          userFinancialContext.riskProfile === 'Moderate') {
          score += 20;
        }
        // Affordability (40 points)
        if (
          sip.minSIP >= userFinancialContext.minAffordableSIP &&
          sip.minSIP <= userFinancialContext.maxAffordableSIP) {
          score += 40; // Perfect fit
        } else if (sip.minSIP <= userFinancialContext.maxAffordableSIP) {
          score += 30; // Affordable
        } else if (sip.minSIP <= userFinancialContext.monthlySavings * 0.5) {
          score += 15; // Stretch but possible
        }
        // Returns (20 points)
        score += Math.min(20, sip.returns5Y / 25 * 20);
        return {
          ...sip,
          suitabilityScore: score,
          isPerfectMatch: score >= 80,
          isRecommended: score >= 60,
          isAffordable: sip.minSIP <= userFinancialContext.maxAffordableSIP
        };
      }).
      sort((a, b) => b.suitabilityScore - a.suitabilityScore);
  }, [sipPlans, userFinancialContext]);
  // Check if any stock has live data
  const hasLiveData = useMemo(() => stocks.some((s) => s.isLive), [stocks]);
  const liveStockCount = useMemo(
    () => stocks.filter((s) => s.isLive).length,
    [stocks]
  );
  const isClosingData = useMemo(
    () => !hasLiveData && stocks.some((s) => s.dataSource === 'last_close'),
    [stocks, hasLiveData]
  );
  // Personalize and sort stocks based on user profile
  const personalizedStocks = useMemo(() => {
    if (!userFinancialContext || !userFinancialContext.hasPositiveSavings) {
      return stocks;
    }
    const { riskProfile, monthlySavings } = userFinancialContext;
    const userAge = profile?.age || 30;
    return stocks.
      map((stock) => {
        let suitabilityScore = 50;
        const pe = stock.pe || 25;
        const priceRatio = stock.price / monthlySavings;
        // Affordability (0-25 points)
        if (priceRatio < 0.15) suitabilityScore += 25; else
          if (priceRatio < 0.3) suitabilityScore += 20; else
            if (priceRatio < 0.5) suitabilityScore += 10; else
              if (priceRatio > 1) suitabilityScore -= 10;
        // Risk alignment (0-30 points)
        const volatility = Math.abs(stock.changePercent);
        if (riskProfile === 'Low') {
          if (pe < 25) suitabilityScore += 15;
          if (volatility < 1) suitabilityScore += 15; else
            if (volatility > 2) suitabilityScore -= 10;
        } else if (riskProfile === 'High') {
          if (pe > 25 && pe < 80) suitabilityScore += 10;
          if (volatility > 0.5) suitabilityScore += 10;
          const growthSymbols = [
            'INFY',
            'TCS',
            'WIPRO',
            'TECHM',
            'BHARTIARTL',
            'BAJFINANCE',
            'TITAN',
            'ADANIENT',
            'TATAMOTORS'];

          if (growthSymbols.includes(stock.symbol)) suitabilityScore += 10;
        } else {
          if (pe > 15 && pe < 45) suitabilityScore += 15;
          if (volatility < 2) suitabilityScore += 10;
          suitabilityScore += 5;
        }
        // Age-based sector preference (0-10 points)
        const defensiveSymbols = [
          'HINDUNILVR',
          'ITC',
          'NESTLEIND',
          'HDFCBANK',
          'KOTAKBANK',
          'ASIANPAINT',
          'SBIN',
          'NTPC',
          'POWERGRID'];

        const growthSymbols = [
          'BHARTIARTL',
          'BAJFINANCE',
          'TITAN',
          'MARUTI',
          'INFY',
          'TCS',
          'HCLTECH'];

        if (userAge < 30 && growthSymbols.includes(stock.symbol)) {
          suitabilityScore += 10;
        } else if (userAge >= 40 && defensiveSymbols.includes(stock.symbol)) {
          suitabilityScore += 10;
        }
        // Profile-based tiebreaker for variation between users
        const profileSeed = (monthlySavings * 7 + userAge * 13) % 17;
        suitabilityScore += (profileSeed + stock.symbol.charCodeAt(0)) % 5;
        return {
          ...stock,
          suitabilityScore,
          isRecommended: suitabilityScore >= 75,
          isAffordable: stock.price <= monthlySavings * 0.5
        };
      }).
      sort((a, b) => b.suitabilityScore - a.suitabilityScore);
  }, [stocks, userFinancialContext, profile]);
  // Generate chart data for stocks - Memoized
  const stockChartData = useMemo(() => {
    const chartData: Record<
      string,
      {
        value: number;
      }[]> =
      {};
    stocks.forEach((stock) => {
      chartData[stock.symbol] = generateMiniChartData(
        stock.price,
        stock.changePercent
      );
    });
    return chartData;
  }, [stocks]);
  // Generate chart data for mutual funds
  const fundChartData = useMemo(() => {
    const chartData: Record<
      string,
      {
        value: number;
      }[]> =
      {};
    mutualFunds.forEach((fund) => {
      chartData[fund.id] = generateNavGrowthData(fund.nav, fund.returns1Y);
    });
    return chartData;
  }, [mutualFunds]);
  // Generate chart data for SIPs
  const sipChartData = useMemo(() => {
    const chartData: Record<
      string,
      {
        value: number;
      }[]> =
      {};
    sipPlans.forEach((sip) => {
      chartData[sip.id] = generateSipGrowthData(sip.minSIP, sip.returns5Y);
    });
    return chartData;
  }, [sipPlans]);
  useEffect(() => {
    loadMarketData();
  }, [forceLastClose]); // Reload when toggle changes
  useEffect(() => {
    if (searchParams.get('openChat') === 'true') {
      navigate('/investment-guidance');
    }
  }, [searchParams, navigate]);
  const loadMarketData = async () => {
    setLoading(true);
    try {
      // Fetch data based on active tab to optimize initial load
      // But we still fetch all for now to keep it simple, just optimized the refresh rate
      const [stocksData, fundsData, sipsData] = await Promise.all([
        fetchLiveStocks(forceLastClose),
        fetchMutualFunds(),
        fetchSIPPlans()]
      );
      setStocks(stocksData);
      setMutualFunds(fundsData);
      setSipPlans(sipsData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading market data:', error);
    } finally {
      setLoading(false);
    }
  };
  // Silent refresh — no loading skeleton, just updates data in background
  const silentRefresh = useCallback(async () => {
    if (!isPageVisibleRef.current) return;
    console.log('🔄 Auto-refreshing market data...');
    clearCache();
    try {
      const [stocksData, fundsData, sipsData] = await Promise.all([
        fetchLiveStocks(forceLastClose),
        fetchMutualFunds(),
        fetchSIPPlans()]
      );
      setStocks(stocksData);
      setMutualFunds(fundsData);
      setSipPlans(sipsData);
      setLastUpdated(new Date());
      setNextRefreshIn(2); // Reset to 2s
    } catch (error) {
      console.error('Auto-refresh error:', error);
    }
  }, [forceLastClose]);
  const handleRefresh = () => {
    if (manualRefreshCooldown) return;
    clearCache();
    setNextRefreshIn(2); // Reset countdown on manual refresh
    loadMarketData();
    // Start cooldown (3 seconds)
    setManualRefreshCooldown(true);
    setManualCooldownTimer(3);
    if (manualCooldownRef.current) clearInterval(manualCooldownRef.current);
    manualCooldownRef.current = setInterval(() => {
      setManualCooldownTimer((prev) => {
        if (prev <= 1) {
          setManualRefreshCooldown(false);
          if (manualCooldownRef.current)
            clearInterval(manualCooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  const handleExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  const handleInvestClick = useCallback(
    (e: React.MouseEvent, stock: LiveStock) => {
      e.stopPropagation();
      setSelectedStockForInvestment(stock);
    },
    []
  );
  // Auto-refresh interval (every 2 seconds)
  useEffect(() => {
    if (!autoRefreshEnabled) {
      if (autoRefreshRef.current) clearInterval(autoRefreshRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
      return;
    }
    // Countdown timer — ticks every second
    countdownRef.current = setInterval(() => {
      setNextRefreshIn((prev) => {
        if (prev <= 1) return 2;
        return prev - 1;
      });
    }, 1000);
    // Data refresh — every 2 seconds
    autoRefreshRef.current = setInterval(() => {
      silentRefresh();
    }, 2000);
    return () => {
      if (autoRefreshRef.current) clearInterval(autoRefreshRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [autoRefreshEnabled, silentRefresh]);
  // Pause auto-refresh when tab is hidden, resume when visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      isPageVisibleRef.current = !document.hidden;
      if (!document.hidden && autoRefreshEnabled) {
        // Tab became visible — do a silent refresh if stale
        silentRefresh();
        setNextRefreshIn(2);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [autoRefreshEnabled, silentRefresh]);
  // Cleanup manual cooldown on unmount
  useEffect(() => {
    return () => {
      if (manualCooldownRef.current) clearInterval(manualCooldownRef.current);
    };
  }, []);
  const filteredStocks = personalizedStocks.filter((stock) => {
    const matchesSearch =
      stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesExchange =
      exchangeFilter === 'All' ||
      stock.exchange === exchangeFilter ||
      stock.exchange === 'BOTH';
    return matchesSearch && matchesExchange;
  });
  const filteredMutualFunds = personalizedMutualFunds.filter((fund) => {
    const matchesSearch =
      fund.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fund.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = riskFilter === 'All' || fund.risk === riskFilter;
    return matchesSearch && matchesRisk;
  });
  const filteredSIPs = personalizedSIPPlans.filter((sip) => {
    const matchesSearch =
      sip.fundName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sip.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = riskFilter === 'All' || sip.risk === riskFilter;
    return matchesSearch && matchesRisk;
  });
  return (
    <div className="w-full bg-[#D6E6F3] p-6 rounded-2xl">
      <InvestNowModal
        stock={selectedStockForInvestment}
        isOpen={!!selectedStockForInvestment}
        onClose={() => setSelectedStockForInvestment(null)} />


      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#000926] mb-2">
              Investment Guidance
            </h1>
            <p className="text-[#000926]/70">
              Explore investment opportunities suitable for your financial goals
            </p>
            {lastUpdated &&
              <p className="text-[#000926]/40 text-xs mt-1">
                Last updated:{' '}
                {lastUpdated.toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
                {autoRefreshEnabled && ' • Auto-refreshing every 2s'}
              </p>
            }
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Last Close Toggle */}
            <button
              onClick={() => setForceLastClose(!forceLastClose)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${forceLastClose ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-white text-gray-600 border-gray-200'}`}
              title="Toggle between Live Data and Last Closing Prices">

              {forceLastClose ?
                <ToggleRight className="w-5 h-5 text-blue-600" /> :

                <ToggleLeft className="w-5 h-5 text-gray-400" />
              }
              {forceLastClose ? 'Last Close Price' : 'Live Data'}
            </button>

            {/* Auto-refresh countdown — only show when auto-refresh is ON */}
            {!loading && autoRefreshEnabled &&
              <div className="flex items-center gap-2 px-3 py-2 bg-white/70 border border-[#A6C5D7]/50 rounded-xl text-xs text-[#000926]/60">
                <div className="relative w-4 h-4">
                  <svg className="w-4 h-4 -rotate-90" viewBox="0 0 16 16">
                    <circle
                      cx="8"
                      cy="8"
                      r="6"
                      fill="none"
                      stroke="#E2E8F0"
                      strokeWidth="2" />

                    <circle
                      cx="8"
                      cy="8"
                      r="6"
                      fill="none"
                      stroke="#0F52BA"
                      strokeWidth="2"
                      strokeDasharray={`${nextRefreshIn / 2 * 37.7} 37.7`}
                      strokeLinecap="round"
                      className="transition-all duration-1000" />

                  </svg>
                </div>
                <span className="font-medium tabular-nums">
                  {nextRefreshIn}s
                </span>
              </div>
            }

            {/* Auto-refresh toggle */}
            <button
              onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${autoRefreshEnabled ? 'bg-[#0F52BA]/10 text-[#0F52BA] border-[#0F52BA]/30' : 'bg-gray-100 text-gray-500 border-gray-200'}`}
              title={
                autoRefreshEnabled ?
                  'Auto-refresh ON (every 2s)' :
                  'Auto-refresh OFF'
              }>

              <RefreshCw
                className={`w-3.5 h-3.5 ${autoRefreshEnabled ? 'animate-spin' : ''}`}
                style={
                  autoRefreshEnabled ?
                    {
                      animationDuration: '3s'
                    } :
                    {}
                } />

              Auto
            </button>

            {/* Live Data Indicator */}
            {!loading &&
              <div
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold cursor-default select-none transition-all ${hasLiveData && !forceLastClose ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300 shadow-sm shadow-emerald-200' : isClosingData || forceLastClose ? 'bg-blue-100 text-blue-700 border-2 border-blue-300 shadow-sm shadow-blue-200' : 'bg-amber-100 text-amber-700 border-2 border-amber-300 shadow-sm shadow-amber-200'}`}>

                {hasLiveData && !forceLastClose ?
                  <>
                    <Wifi className="w-4 h-4" />
                    <span>
                      Live Data ({liveStockCount}/{stocks.length})
                    </span>
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  </> :
                  isClosingData || forceLastClose ?
                    <>
                      <WifiOff className="w-4 h-4" />
                      <span>Last Close Prices</span>
                      <span className="w-2.5 h-2.5 bg-blue-500 rounded-full"></span>
                    </> :

                    <>
                      <WifiOff className="w-4 h-4" />
                      <span>Offline</span>
                      <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse"></span>
                    </>
                }
              </div>
            }

            {/* Manual Refresh — only show when auto-refresh is OFF */}
            {!autoRefreshEnabled &&
              <button
                onClick={handleRefresh}
                className={`flex items-center gap-2 px-4 py-2 border rounded-xl transition-all ${manualRefreshCooldown || loading ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-white hover:bg-[#A6C5D7]/20 border-[#A6C5D7] text-[#000926]'}`}
                disabled={loading || manualRefreshCooldown}
                title={
                  manualRefreshCooldown ?
                    `Wait ${manualCooldownTimer}s before refreshing again` :
                    'Refresh market data'
                }>

                <RefreshCw
                  className={`w-4 h-4 ${loading ? 'animate-spin' : ''} ${manualRefreshCooldown ? 'text-gray-400' : 'text-[#0F52BA]'}`} />

                {manualRefreshCooldown ?
                  `Wait ${manualCooldownTimer}s` :
                  'Refresh'}
              </button>
            }
          </div>
        </div>

        {hasRestrictions &&
          <div className="bg-[#A6C5D7]/20 border border-[#A6C5D7] rounded-xl p-6 flex items-start gap-4 mb-6">
            <div className="p-2 bg-[#D6E6F3] rounded-lg">
              <AlertCircle className="w-6 h-6 text-[#0F52BA]" />
            </div>
            <div>
              <h3 className="text-[#000926] font-bold mb-1">
                Investment Restrictions Apply
              </h3>
              <p className="text-[#000926]/80 text-sm leading-relaxed mb-3">
                {isUnder18 ?
                  'You must be 18 or older to invest in stocks, mutual funds, and SIPs. This page is for educational purposes only.' :
                  'As a student, we recommend focusing on building an emergency fund first. Investments carry risks and require stable income.'}
              </p>
              <p className="text-[#0F52BA] text-xs font-medium">
                💡 Tip:{' '}
                {isUnder18 ?
                  'Use this time to learn about investing. You can start once you turn 18!' :
                  'Consider starting with small SIPs (₹500/month) once you have 3 months of expenses saved.'}
              </p>
            </div>
          </div>
        }

        {/* Only show market data info if NOT comparing brokers */}
        {activeTab !== 'compare-brokers' &&
          <div className="bg-white/50 border border-[#A6C5D7] rounded-xl p-6 flex items-start gap-4 mb-8">
            <div className="p-2 bg-[#D6E6F3] rounded-lg">
              <Info className="w-6 h-6 text-[#0F52BA]" />
            </div>
            <div>
              <h3 className="text-[#000926] font-bold mb-1">
                {hasLiveData && !forceLastClose ?
                  '📡 Live Market Data' :
                  isClosingData || forceLastClose ?
                    '📊 Last Closing Prices' :
                    '📊 Market Data Unavailable'}
              </h3>
              <p className="text-[#000926]/80 text-sm leading-relaxed">
                {hasLiveData && !forceLastClose ?
                  'Stock prices are fetched live from BSE/NSE India. Prices may be delayed by up to 15 minutes. Click any stock to view real-time data.' :
                  isClosingData || forceLastClose ?
                    'Showing the last known closing prices. Live data is currently unavailable or disabled. Prices shown are from the most recent market close.' :
                    'Market data is currently unavailable. Please try refreshing or check your internet connection.'}
              </p>
            </div>
          </div>
        }
      </div>

      {/* Personalization Banner */}
      {userFinancialContext &&
        userFinancialContext.hasPositiveSavings && (
          activeTab === 'mutual-funds' ||
          activeTab === 'sip' ||
          activeTab === 'stocks') &&
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-6 mb-6 animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-purple-900 mb-2">
                Personalized for Your Financial Profile
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                <div className="bg-white/60 rounded-lg p-3">
                  <p className="text-xs text-purple-600 font-medium mb-1">
                    Monthly Savings
                  </p>
                  <p className="text-xl font-bold text-purple-900">
                    ₹{userFinancialContext.monthlySavings.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white/60 rounded-lg p-3">
                  <p className="text-xs text-purple-600 font-medium mb-1">
                    Recommended SIP Range
                  </p>
                  <p className="text-xl font-bold text-purple-900">
                    ₹{userFinancialContext.minAffordableSIP.toLocaleString()}{' '}
                    - ₹
                    {userFinancialContext.maxAffordableSIP.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white/60 rounded-lg p-3">
                  <p className="text-xs text-purple-600 font-medium mb-1">
                    Your Risk Profile
                  </p>
                  <p className="text-xl font-bold text-purple-900">
                    {userFinancialContext.riskProfile}
                  </p>
                </div>
              </div>
              <p className="text-sm text-purple-700">
                {activeTab === 'stocks' ?
                  '💡 Stocks are sorted by how well they match your risk profile and budget. Look for "Recommended" badges!' :
                  activeTab === 'mutual-funds' ?
                    '💡 Funds are sorted by how well they match your financial situation. Look for "Recommended" badges!' :
                    '💡 SIP plans are sorted by affordability and returns. "Perfect Match" plans fit your budget perfectly!'}
              </p>
            </div>
          </div>
        </div>
      }

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('stocks')}
          className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${activeTab === 'stocks' ? 'bg-[#0F52BA] text-white shadow-lg shadow-[#0F52BA]/20' : 'bg-white text-[#000926] hover:bg-[#D6E6F3] border border-[#A6C5D7]'}`}>

          📈 Stocks{' '}
          {hasLiveData && activeTab === 'stocks' && !forceLastClose &&
            <span className="ml-1 w-2 h-2 bg-emerald-400 rounded-full inline-block animate-pulse"></span>
          }
        </button>
        <button
          onClick={() => setActiveTab('mutual-funds')}
          className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${activeTab === 'mutual-funds' ? 'bg-[#0F52BA] text-white shadow-lg shadow-[#0F52BA]/20' : 'bg-white text-[#000926] hover:bg-[#D6E6F3] border border-[#A6C5D7]'}`}>

          💼 Mutual Funds
        </button>
        <button
          onClick={() => setActiveTab('sip')}
          className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${activeTab === 'sip' ? 'bg-[#0F52BA] text-white shadow-lg shadow-[#0F52BA]/20' : 'bg-white text-[#000926] hover:bg-[#D6E6F3] border border-[#A6C5D7]'}`}>

          🎯 SIP Plans
        </button>
        <button
          onClick={() => setActiveTab('compare-brokers')}
          className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${activeTab === 'compare-brokers' ? 'bg-[#0F52BA] text-white shadow-lg shadow-[#0F52BA]/20' : 'bg-white text-[#000926] hover:bg-[#D6E6F3] border border-[#A6C5D7]'}`}>

          ⚖️ Compare Brokers
        </button>
        <button
          onClick={() => navigate('/investment-guidance')}
          className="px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap bg-gradient-to-r from-[#0F52BA] to-[#000926] text-white hover:shadow-xl hover:scale-[1.02]">

          💡 Investment Guidance
        </button>
      </div>

      {/* Search and Filters */}
      {activeTab !== 'compare-brokers' &&
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A6C5D7]" />
            <input
              type="text"
              placeholder={`Search ${activeTab === 'stocks' ? 'stocks' : activeTab === 'mutual-funds' ? 'mutual funds' : 'SIP plans'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-[#A6C5D7] rounded-xl text-[#000926] placeholder-[#A6C5D7] focus:border-[#0F52BA] focus:ring-2 focus:ring-[#0F52BA]/20 transition-all" />

          </div>

          {/* Exchange Filter for Stocks */}
          {activeTab === 'stocks' &&
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#000926]/60 pointer-events-none" />
              <select
                value={exchangeFilter}
                onChange={(e) =>
                  setExchangeFilter(e.target.value as 'All' | 'BSE' | 'NSE')
                }
                className="pl-10 pr-8 py-3 bg-white border border-[#A6C5D7] rounded-xl text-[#000926] focus:border-[#0F52BA] focus:ring-2 focus:ring-[#0F52BA]/20 transition-all appearance-none cursor-pointer hover:border-[#0F52BA]">

                <option value="All">All Exchanges</option>
                <option value="BSE">BSE Only</option>
                <option value="NSE">NSE Only</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-4 h-4 text-[#000926]/60"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7" />

                </svg>
              </div>
            </div>
          }

          {/* Risk Filter for Funds/SIPs */}
          {activeTab !== 'stocks' &&
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#000926]/60 pointer-events-none" />
              <select
                value={riskFilter}
                onChange={(e) =>
                  setRiskFilter(
                    e.target.value as 'All' | 'Low' | 'Moderate' | 'High'
                  )
                }
                className="pl-10 pr-8 py-3 bg-white border border-[#A6C5D7] rounded-xl text-[#000926] focus:border-[#0F52BA] focus:ring-2 focus:ring-[#0F52BA]/20 transition-all appearance-none cursor-pointer hover:border-[#0F52BA]">

                <option value="All">All Risk Levels</option>
                <option value="Low">Low Risk</option>
                <option value="Moderate">Moderate Risk</option>
                <option value="High">High Risk</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-4 h-4 text-[#000926]/60"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7" />

                </svg>
              </div>
            </div>
          }
        </div>
      }

      {/* Content */}
      {loading ?
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) =>
            <Card key={i} className="p-6 bg-white border border-[#A6C5D7]">
              <div className="skeleton h-6 w-3/4 mb-4 rounded bg-[#D6E6F3] animate-pulse"></div>
              <div className="skeleton h-4 w-1/2 mb-2 rounded bg-[#D6E6F3] animate-pulse"></div>
              <div className="skeleton h-16 w-full rounded bg-[#D6E6F3] animate-pulse"></div>
            </Card>
          )}
        </div> :

        <>
          {/* Stocks Tab */}
          {activeTab === 'stocks' &&
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStocks.map((stock) =>
                <StockCard
                  key={stock.symbol}
                  stock={stock}
                  chartData={stockChartData[stock.symbol] || []}
                  onInvest={handleInvestClick}
                  isAdult={isAdult} />

              )}
            </div>
          }

          {/* Mutual Funds Tab */}
          {activeTab === 'mutual-funds' &&
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMutualFunds.map((fund, index) =>
                <Card
                  key={fund.id}
                  className="p-0 bg-white border border-[#A6C5D7] hover:border-[#0F52BA] hover:shadow-xl hover:shadow-[#0F52BA]/10 transition-all cursor-pointer group overflow-hidden"
                  onClick={() => handleExternalLink(fund.externalLink)}
                  style={{
                    animationDelay: `${index * 0.05}s`
                  }}>

                  <div
                    className={`px-5 py-2 ${fund.risk === 'Low' ? 'bg-emerald-50' : fund.risk === 'Moderate' ? 'bg-amber-50' : 'bg-red-50'}`}>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-bold ${fund.risk === 'Low' ? 'bg-emerald-100 text-emerald-700' : fund.risk === 'Moderate' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>

                          {fund.risk} Risk
                        </span>
                        {fund.isRecommended &&
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded">
                            <Star className="w-3 h-3 fill-current" />
                            Recommended
                          </span>
                        }
                      </div>
                      <span className="text-xs text-[#000926]/60">
                        {fund.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 pr-2">
                        <h3 className="text-lg font-bold text-[#000926] mb-1 line-clamp-2">
                          {fund.name}
                        </h3>
                        <p className="text-sm text-[#000926]/60">
                          NAV: ₹{fund.nav.toFixed(2)}
                        </p>
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-[#A6C5D7] group-hover:text-[#0F52BA] transition-colors flex-shrink-0" />
                    </div>
                  </div>
                  <div className="h-20 px-3">
                    <p className="text-[10px] text-[#000926]/40 mb-1 px-1">
                      NAV Growth (1Y)
                    </p>
                    <ResponsiveContainer width="100%" height="85%">
                      <AreaChart data={fundChartData[fund.id] || []}>
                        <defs>
                          <linearGradient
                            id={`gradient-${fund.id}`}
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1">

                            <stop
                              offset="5%"
                              stopColor="#0F52BA"
                              stopOpacity={0.3} />

                            <stop
                              offset="95%"
                              stopColor="#0F52BA"
                              stopOpacity={0} />

                          </linearGradient>
                        </defs>
                        <YAxis domain={['dataMin', 'dataMax']} hide />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#0F52BA"
                          strokeWidth={2}
                          fill={`url(#gradient-${fund.id})`} />

                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-3 gap-2 px-5 pb-4">
                    <div className="bg-gradient-to-br from-[#0F52BA]/5 to-[#0F52BA]/10 rounded-xl p-2 text-center">
                      <p className="text-[10px] text-[#000926]/50 mb-0.5">1Y</p>
                      <p className="text-sm font-bold text-[#0F52BA]">
                        +{fund.returns1Y}%
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-[#0F52BA]/5 to-[#0F52BA]/10 rounded-xl p-2 text-center">
                      <p className="text-[10px] text-[#000926]/50 mb-0.5">3Y</p>
                      <p className="text-sm font-bold text-[#0F52BA]">
                        +{fund.returns3Y}%
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-[#0F52BA]/5 to-[#0F52BA]/10 rounded-xl p-2 text-center">
                      <p className="text-[10px] text-[#000926]/50 mb-0.5">5Y</p>
                      <p className="text-sm font-bold text-[#0F52BA]">
                        +{fund.returns5Y}%
                      </p>
                    </div>
                  </div>
                  <div className="px-5 pb-4 pt-2 bg-[#F8FAFC] border-t border-[#E2E8F0]">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-[#000926]/60">
                        Min: ₹{fund.minInvestment.toLocaleString()}
                      </span>
                      {fund.isAffordable &&
                        <span className="flex items-center gap-1 text-emerald-600 font-medium">
                          <CheckCircle className="w-3 h-3" />
                          Within Budget
                        </span>
                      }
                    </div>
                    <div className="flex items-center justify-between text-xs text-[#000926]/60 mb-2">
                      <span>Expense: {fund.expenseRatio}%</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#0F52BA] font-medium group-hover:underline">
                      <ExternalLink className="w-3 h-3" />
                      <a
                        href={fund.externalLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                        onClick={(e) => e.stopPropagation()}>

                        View Fund Details →
                      </a>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          }

          {/* SIP Tab */}
          {activeTab === 'sip' &&
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSIPs.map((sip, index) =>
                <Card
                  key={sip.id}
                  className="p-0 bg-white border border-[#A6C5D7] hover:border-[#0F52BA] hover:shadow-xl hover:shadow-[#0F52BA]/10 transition-all cursor-pointer group overflow-hidden"
                  onClick={() => handleExternalLink(sip.externalLink)}
                  style={{
                    animationDelay: `${index * 0.05}s`
                  }}>

                  <div
                    className={`px-5 py-2 ${sip.risk === 'Low' ? 'bg-emerald-50' : sip.risk === 'Moderate' ? 'bg-amber-50' : 'bg-red-50'}`}>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-bold ${sip.risk === 'Low' ? 'bg-emerald-100 text-emerald-700' : sip.risk === 'Moderate' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>

                          {sip.risk} Risk
                        </span>
                        {sip.isPerfectMatch &&
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs font-bold rounded">
                            <Star className="w-3 h-3 fill-current" />
                            Perfect Match
                          </span>
                        }
                        {!sip.isPerfectMatch && sip.isRecommended &&
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded">
                            <Star className="w-3 h-3 fill-current" />
                            Recommended
                          </span>
                        }
                      </div>
                      <span className="text-xs text-[#000926]/60">
                        {sip.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 pr-2">
                        <h3 className="text-lg font-bold text-[#000926] mb-1 line-clamp-2">
                          {sip.fundName}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-[#0F52BA]">
                            ₹{sip.minSIP.toLocaleString()}
                          </span>
                          <span className="text-sm text-[#000926]/60">
                            /month
                          </span>
                        </div>
                        {sip.isAffordable &&
                          <span className="inline-flex items-center gap-1 mt-1 text-xs text-emerald-600 font-medium">
                            <CheckCircle className="w-3 h-3" />
                            Fits Your Budget
                          </span>
                        }
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-[#A6C5D7] group-hover:text-[#0F52BA] transition-colors flex-shrink-0" />
                    </div>
                  </div>
                  <div className="h-20 px-3">
                    <p className="text-[10px] text-[#000926]/40 mb-1 px-1">
                      Wealth Growth (5Y Projection)
                    </p>
                    <ResponsiveContainer width="100%" height="85%">
                      <AreaChart data={sipChartData[sip.id] || []}>
                        <defs>
                          <linearGradient
                            id={`sip-gradient-${sip.id}`}
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1">

                            <stop
                              offset="5%"
                              stopColor="#10b981"
                              stopOpacity={0.3} />

                            <stop
                              offset="95%"
                              stopColor="#10b981"
                              stopOpacity={0} />

                          </linearGradient>
                        </defs>
                        <YAxis domain={['dataMin', 'dataMax']} hide />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#10b981"
                          strokeWidth={2}
                          fill={`url(#sip-gradient-${sip.id})`} />

                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-3 px-5 pb-4">
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-2">
                      <p className="text-[10px] text-emerald-600/70 mb-0.5">
                        3Y Returns
                      </p>
                      <p className="text-lg font-bold text-emerald-600">
                        +{sip.returns3Y}%
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-[#0F52BA]/5 to-[#0F52BA]/10 rounded-xl p-2">
                      <p className="text-[10px] text-[#0F52BA]/70 mb-0.5">
                        5Y Returns
                      </p>
                      <p className="text-lg font-bold text-[#0F52BA]">
                        +{sip.returns5Y}%
                      </p>
                    </div>
                  </div>
                  <div className="px-5 pb-4 pt-2 bg-[#F8FAFC] border-t border-[#E2E8F0]">
                    <div className="bg-white/80 rounded-lg p-2 mb-3">
                      <p className="text-[10px] text-[#000926]/70 flex items-center gap-1">
                        <span className="text-emerald-500">✓</span> Start with
                        just ₹{sip.minSIP}/month
                      </p>
                      <p className="text-[10px] text-[#000926]/70 flex items-center gap-1">
                        <span className="text-emerald-500">✓</span> Ideal for
                        long-term wealth creation
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#0F52BA] font-medium group-hover:underline">
                      <ExternalLink className="w-3 h-3" />
                      <a
                        href={sip.externalLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                        onClick={(e) => e.stopPropagation()}>

                        View SIP Details →
                      </a>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          }

          {/* Compare Brokers Tab */}
          {activeTab === 'compare-brokers' &&
            <div className="space-y-8 animate-fade-in">
              <BrokerageComparison />
              <ProfitLossCalculator />
            </div>
          }
        </>
      }
    </div>);

}
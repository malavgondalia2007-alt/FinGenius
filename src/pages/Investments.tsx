import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
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
  AlertCircle } from
'lucide-react';
import {
  fetchLiveStocks,
  fetchMutualFunds,
  fetchSIPPlans,
  clearCache,
  LiveStock,
  MutualFund,
  SIPPlan } from
'../services/liveMarketData';
import { useAuth } from '../hooks/useAuth';
import { db } from '../services/database';
type TabType = 'stocks' | 'mutual-funds' | 'sip';
export function Investments() {
  const { user } = useAuth();
  const profile = user ? db.profiles.getByUserId(user.id) : null;
  // Check restrictions
  const isUnder18 = profile && profile.age < 18;
  const isStudent = profile && profile.type === 'student';
  const hasRestrictions = isUnder18 || isStudent;
  const [activeTab, setActiveTab] = useState<TabType>('stocks');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<
    'All' | 'Low' | 'Moderate' | 'High'>(
    'All');
  // Live data states
  const [stocks, setStocks] = useState<LiveStock[]>([]);
  const [mutualFunds, setMutualFunds] = useState<MutualFund[]>([]);
  const [sipPlans, setSipPlans] = useState<SIPPlan[]>([]);
  // Load live data
  useEffect(() => {
    loadMarketData();
  }, []);
  const loadMarketData = async () => {
    setLoading(true);
    try {
      const [stocksData, fundsData, sipsData] = await Promise.all([
      fetchLiveStocks(),
      fetchMutualFunds(),
      fetchSIPPlans()]
      );
      setStocks(stocksData);
      setMutualFunds(fundsData);
      setSipPlans(sipsData);
    } catch (error) {
      console.error('Error loading market data:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleRefresh = () => {
    clearCache();
    loadMarketData();
  };
  const handleExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  // Filter functions
  const filteredStocks = stocks.filter(
    (stock) =>
    stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stock.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredMutualFunds = mutualFunds.filter((fund) => {
    const matchesSearch =
    fund.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    fund.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = riskFilter === 'All' || fund.risk === riskFilter;
    return matchesSearch && matchesRisk;
  });
  const filteredSIPs = sipPlans.filter((sip) => {
    const matchesSearch =
    sip.fundName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sip.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = riskFilter === 'All' || sip.risk === riskFilter;
    return matchesSearch && matchesRisk;
  });
  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Investment Guidance
            </h1>
            <p className="text-gray-600">
              Explore investment opportunities suitable for your financial goals
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-gray-700 transition-all"
            disabled={loading}>

            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>

        {/* Age/Student Restriction Banner */}
        {hasRestrictions &&
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex items-start gap-4 mb-6">
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-amber-900 font-bold mb-1">
                Investment Restrictions Apply
              </h3>
              <p className="text-amber-800 text-sm leading-relaxed mb-3">
                {isUnder18 ?
              'You must be 18 or older to invest in stocks, mutual funds, and SIPs. This page is for educational purposes only.' :
              'As a student, we recommend focusing on building an emergency fund first. Investments carry risks and require stable income.'}
              </p>
              <p className="text-amber-700 text-xs">
                💡 Tip:{' '}
                {isUnder18 ?
              'Use this time to learn about investing. You can start once you turn 18!' :
              'Consider starting with small SIPs (₹500/month) once you have 3 months of expenses saved.'}
              </p>
            </div>
          </div>
        }

        {/* Educational Disclaimer Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 flex items-start gap-4 mb-8">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Info className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-blue-900 font-bold mb-1">
              Educational Resource Only
            </h3>
            <p className="text-blue-800 text-sm leading-relaxed">
              This page provides investment suggestions based on general market
              data. FinGenius does not track, store, or calculate your personal
              portfolio values. We recommend consulting a certified financial
              advisor before making any investment decisions.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('stocks')}
          className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${activeTab === 'stocks' ? 'bg-gradient-to-r from-royal-600 to-midnight-600 text-white shadow-royal' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}>

          Stocks
        </button>
        <button
          onClick={() => setActiveTab('mutual-funds')}
          className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${activeTab === 'mutual-funds' ? 'bg-gradient-to-r from-royal-600 to-midnight-600 text-white shadow-royal' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}>

          Mutual Funds
        </button>
        <button
          onClick={() => setActiveTab('sip')}
          className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${activeTab === 'sip' ? 'bg-gradient-to-r from-royal-600 to-midnight-600 text-white shadow-royal' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}>

          SIP Plans
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab === 'stocks' ? 'stocks' : activeTab === 'mutual-funds' ? 'mutual funds' : 'SIP plans'}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" />

        </div>

        {activeTab !== 'stocks' &&
        <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
            value={riskFilter}
            onChange={(e) =>
            setRiskFilter(
              e.target.value as 'All' | 'Low' | 'Moderate' | 'High'
            )
            }
            className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all">

              <option value="All">All Risk Levels</option>
              <option value="Low">Low Risk</option>
              <option value="Moderate">Moderate Risk</option>
              <option value="High">High Risk</option>
            </select>
          </div>
        }
      </div>

      {/* Content */}
      {loading ?
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) =>
        <Card key={i} className="p-6">
              <div className="skeleton h-6 w-3/4 mb-4 rounded"></div>
              <div className="skeleton h-4 w-1/2 mb-2 rounded"></div>
              <div className="skeleton h-8 w-full rounded"></div>
            </Card>
        )}
        </div> :

      <>
          {/* Stocks Tab */}
          {activeTab === 'stocks' &&
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStocks.map((stock, index) =>
          <Card
            key={stock.symbol}
            className="p-6 hover:border-blue-300 transition-all cursor-pointer group"
            onClick={() => handleExternalLink(stock.externalLink)}
            style={{
              animationDelay: `${index * 0.05}s`
            }}>

                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {stock.symbol}
                      </h3>
                      <p className="text-sm text-gray-600">{stock.name}</p>
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>

                  <div className="mb-4">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-2xl font-bold text-gray-900">
                        ₹{stock.price.toFixed(2)}
                      </span>
                      <span
                  className={`flex items-center gap-1 text-sm font-semibold ${stock.change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>

                        {stock.change >= 0 ?
                  <TrendingUp className="w-4 h-4" /> :

                  <TrendingDown className="w-4 h-4" />
                  }
                        {stock.changePercent >= 0 ? '+' : ''}
                        {stock.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Market Cap</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {stock.marketCap}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">P/E Ratio</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {stock.pe}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-xs text-blue-600 group-hover:text-blue-700 transition-colors">
                    <ExternalLink className="w-3 h-3" />
                    <span>View Details</span>
                  </div>
                </Card>
          )}
            </div>
        }

          {/* Mutual Funds Tab */}
          {activeTab === 'mutual-funds' &&
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredMutualFunds.map((fund, index) =>
          <Card
            key={fund.id}
            className="p-6 hover:border-emerald-300 transition-all cursor-pointer group"
            onClick={() => handleExternalLink(fund.externalLink)}
            style={{
              animationDelay: `${index * 0.05}s`
            }}>

                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {fund.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          {fund.category}
                        </span>
                        <span
                    className={`px-2 py-0.5 rounded text-xs font-semibold ${fund.risk === 'Low' ? 'bg-emerald-100 text-emerald-700' : fund.risk === 'Moderate' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>

                          {fund.risk} Risk
                        </span>
                      </div>
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition-colors flex-shrink-0" />
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">1Y Returns</p>
                      <p className="text-lg font-bold text-emerald-600">
                        +{fund.returns1Y}%
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">3Y Returns</p>
                      <p className="text-lg font-bold text-emerald-600">
                        +{fund.returns3Y}%
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">5Y Returns</p>
                      <p className="text-lg font-bold text-emerald-600">
                        +{fund.returns5Y}%
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-xs text-emerald-600 group-hover:text-emerald-700 transition-colors">
                    <ExternalLink className="w-3 h-3" />
                    <span>Learn More</span>
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
            className="p-6 hover:border-amber-300 transition-all cursor-pointer group"
            onClick={() => handleExternalLink(sip.externalLink)}
            style={{
              animationDelay: `${index * 0.05}s`
            }}>

                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {sip.fundName}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          {sip.category}
                        </span>
                        <span
                    className={`px-2 py-0.5 rounded text-xs font-semibold ${sip.risk === 'Low' ? 'bg-emerald-100 text-emerald-700' : sip.risk === 'Moderate' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>

                          {sip.risk} Risk
                        </span>
                      </div>
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-amber-600 transition-colors flex-shrink-0" />
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Start SIP from</p>
                    <span className="text-2xl font-bold text-gray-900">
                      ₹{sip.minSIP.toLocaleString()}/mo
                    </span>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-600 mb-2">
                      Ideal for long-term wealth creation
                    </p>
                    <div className="flex items-center gap-2 text-xs text-amber-600 group-hover:text-amber-700 transition-colors">
                      <ExternalLink className="w-3 h-3" />
                      <span>View Plan Details</span>
                    </div>
                  </div>
                </Card>
          )}
            </div>
        }
        </>
      }
    </Layout>);

}
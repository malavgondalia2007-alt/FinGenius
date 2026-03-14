import React, { useCallback, useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import {
  AlertTriangle,
  TrendingUp,
  Loader2,
  ArrowLeft,
  History,
  Trash2,
  Clock,
  Info } from
'lucide-react';
import { RiskProfile, SIPPrediction, FundData } from '../../types/investments';
import { SIPCalculation } from '../../types';
import {
  calculateSIPFutureValue,
  adjustCAGRByRisk,
  calculateInvestmentBreakdown,
  formatCurrency } from
'../../utils/sipCalculations';
import {
  getSIPFundRecommendations,
  fetchMutualFunds } from
'../../services/indiaInvestApi';
import {
  getBestRecommendations,
  RecommendationResult } from
'../../utils/fundRecommendations';
import { SIPRecommendationResults } from './SIPRecommendationResults';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../services/database';
interface SIPCalculatorProps {
  initialAmount?: number;
  initialDuration?: number;
  initialRisk?: RiskProfile;
  onClose?: () => void;
  onRecommendationsReady?: (recommendations: any[], calculatorData: any) => void;
}
export function SIPCalculator({
  initialAmount = 5000,
  initialDuration = 10,
  initialRisk = 'medium',
  onClose,
  onRecommendationsReady
}: SIPCalculatorProps) {
  const { user } = useAuth();
  // Input State
  const [amount, setAmount] = useState<number>(initialAmount);
  const [duration, setDuration] = useState<number>(initialDuration);
  const [risk, setRisk] = useState<RiskProfile>(initialRisk);
  const [inflationAdjusted, setInflationAdjusted] = useState(false);
  const [inflationRate, setInflationRate] = useState(6); // 6% default inflation
  // Data State
  const [loading, setLoading] = useState<boolean>(true);
  const [calculating, setCalculating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [funds, setFunds] = useState<FundData[]>([]);
  const [prediction, setPrediction] = useState<SIPPrediction | null>(null);
  // Recommendation State
  const [recommendationResult, setRecommendationResult] =
  useState<RecommendationResult | null>(null);
  const [showRecommendations, setShowRecommendations] = useState<boolean>(false);
  // History State
  const [sipHistory, setSipHistory] = useState<SIPCalculation[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  // Load SIP history
  useEffect(() => {
    if (user) {
      setSipHistory(db.sipHistory.getByUserId(user.id));
    }
  }, [user]);
  // Save calculation to history
  const saveToHistory = useCallback(() => {
    if (!user || !prediction) return;
    const calculation: SIPCalculation = {
      id: crypto.randomUUID(),
      userId: user.id,
      monthlyAmount: amount,
      durationYears: duration,
      riskProfile: risk,
      estimatedValue: prediction.estimatedValue,
      totalInvestment: prediction.totalInvestment,
      estimatedGains: prediction.estimatedGains,
      cagrUsed: prediction.cagrUsed,
      fundUsed: prediction.fundUsed,
      createdAt: new Date().toISOString()
    };
    db.sipHistory.create(calculation);
    setSipHistory(db.sipHistory.getByUserId(user.id));
  }, [user, prediction, amount, duration, risk]);
  // Auto-save when prediction changes (debounced)
  useEffect(() => {
    if (prediction && user && !loading) {
      const timer = setTimeout(() => {
        saveToHistory();
      }, 2000); // Save after 2 seconds of no changes
      return () => clearTimeout(timer);
    }
  }, [prediction?.estimatedValue, user, loading]);
  const handleDeleteHistory = (id: string) => {
    db.sipHistory.delete(id);
    if (user) {
      setSipHistory(db.sipHistory.getByUserId(user.id));
    }
  };
  const handleClearHistory = () => {
    if (
    user &&
    window.confirm('Are you sure you want to clear all calculation history?'))
    {
      db.sipHistory.clearByUserId(user.id);
      setSipHistory([]);
    }
  };
  const handleLoadFromHistory = (calc: SIPCalculation) => {
    setAmount(calc.monthlyAmount);
    setDuration(calc.durationYears);
    setRisk(calc.riskProfile);
    setShowHistory(false);
  };
  // Fetch fund data based on risk
  const fetchFundData = useCallback(async (currentRisk: RiskProfile) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSIPFundRecommendations(currentRisk);
      setFunds(data);
    } catch (err) {
      console.error('Failed to fetch fund data:', err);
      setError(
        'Unable to fetch live market data. Using conservative estimates.'
      );
      setFunds([]);
    } finally {
      setLoading(false);
    }
  }, []);
  // Initial fetch
  useEffect(() => {
    fetchFundData(risk);
  }, [risk, fetchFundData]);
  // Calculate prediction
  useEffect(() => {
    const { cagr, fundName } = adjustCAGRByRisk(funds, risk);
    // Adjust CAGR for inflation if enabled
    const effectiveCAGR = inflationAdjusted ?
    ((1 + cagr / 100) / (1 + inflationRate / 100) - 1) * 100 :
    cagr;
    const totalInvestment = amount * duration * 12;
    const estimatedValue = calculateSIPFutureValue(
      amount,
      effectiveCAGR,
      duration
    );
    const estimatedGains = estimatedValue - totalInvestment;
    setPrediction({
      totalInvestment,
      estimatedValue,
      estimatedGains,
      cagrUsed: cagr,
      fundUsed: fundName
    });
  }, [amount, duration, risk, funds, inflationAdjusted, inflationRate]);
  const breakdown = prediction ?
  calculateInvestmentBreakdown(prediction) :
  {
    investmentPercentage: 0,
    gainsPercentage: 0
  };
  const handleGetRecommendations = async () => {
    setCalculating(true);
    try {
      const allFunds = await fetchMutualFunds();
      let monthlySavings = 20000;
      if (user) {
        const profile = db.profiles.getByUserId(user.id);
        if (profile && profile.monthlyIncome && profile.monthlyExpenses) {
          monthlySavings = profile.monthlyIncome - profile.monthlyExpenses;
        }
      }
      const result = getBestRecommendations(
        allFunds,
        risk,
        monthlySavings,
        amount
      );
      setRecommendationResult(result);
      setShowRecommendations(true);
    } catch (err) {
      console.error('Error generating recommendations:', err);
      setError('Failed to generate recommendations. Please try again.');
    } finally {
      setCalculating(false);
    }
  };
  const handleReset = () => {
    setShowRecommendations(false);
    setRecommendationResult(null);
  };
  if (showRecommendations && recommendationResult) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={handleReset}
            className="pl-0 hover:pl-2 transition-all">

            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Calculator
          </Button>
        </div>
        <SIPRecommendationResults
          result={recommendationResult}
          sipAmount={amount}
          durationYears={duration}
          onReset={handleReset} />

      </div>);

  }
  return (
    <Card className="w-full max-w-2xl mx-auto overflow-hidden border-t-4 border-t-blue-600 shadow-lg">
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              SIP Calculator
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Estimate your wealth creation with real-time market data
            </p>
          </div>
          <div className="flex items-center gap-2">
            {sipHistory.length > 0 &&
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className={`flex items-center gap-1.5 ${showHistory ? 'bg-blue-50 border-blue-300' : ''}`}>

                <History className="w-4 h-4" />
                History ({sipHistory.length})
              </Button>
            }
            {onClose &&
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600">

                ✕
              </Button>
            }
          </div>
        </div>

        {/* History Panel */}
        {showHistory && sipHistory.length > 0 &&
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                Recent Calculations
              </h3>
              <Button
              variant="ghost"
              size="sm"
              onClick={handleClearHistory}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 text-xs">

                <Trash2 className="w-3 h-3 mr-1" />
                Clear All
              </Button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {sipHistory.slice(0, 10).map((calc) =>
            <div
              key={calc.id}
              onClick={() => handleLoadFromHistory(calc)}
              className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all group">

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">
                        ₹{calc.monthlyAmount.toLocaleString()}/mo
                      </span>
                      <span className="text-xs text-gray-500">×</span>
                      <span className="text-sm text-gray-600">
                        {calc.durationYears} years
                      </span>
                      <span
                    className={`text-xs px-1.5 py-0.5 rounded ${calc.riskProfile === 'low' ? 'bg-green-100 text-green-700' : calc.riskProfile === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>

                        {calc.riskProfile}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>
                        Est. Value:{' '}
                        <span className="font-medium text-gray-700">
                          {formatCurrency(calc.estimatedValue)}
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteHistory(calc.id);
                  }}
                  className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">

                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
            )}
            </div>
          </div>
        }

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Inputs Section */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Investment
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                  ₹
                </span>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) =>
                  setAmount(Math.max(0, Number(e.target.value)))
                  }
                  className="pl-8"
                  placeholder="5000" />

              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (Years)
              </label>
              <Input
                type="number"
                value={duration}
                onChange={(e) =>
                setDuration(Math.max(1, Math.min(50, Number(e.target.value))))
                }
                placeholder="10"
                min={1}
                max={50} />

              <input
                type="range"
                min="1"
                max="30"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full mt-2 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />

            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Risk Profile
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'medium', 'high'] as const).map((r) =>
                <button
                  key={r}
                  onClick={() => setRisk(r)}
                  className={`
                      py-2 px-3 text-sm font-medium rounded-md border transition-all
                      ${risk === r ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}
                    `}>

                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                )}
              </div>
            </div>

            {/* Inflation Toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="inflation"
                  checked={inflationAdjusted}
                  onChange={(e) => setInflationAdjusted(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />

                <label
                  htmlFor="inflation"
                  className="text-sm font-medium text-gray-700 cursor-pointer">

                  Adjust for Inflation
                </label>
              </div>
              {inflationAdjusted &&
              <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">Rate:</span>
                  <input
                  type="number"
                  value={inflationRate}
                  onChange={(e) => setInflationRate(Number(e.target.value))}
                  className="w-12 h-6 text-xs border border-gray-300 rounded px-1" />

                  <span className="text-xs text-gray-500">%</span>
                </div>
              }
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 flex flex-col justify-center space-y-6 border border-blue-100">
            {loading && !prediction ?
            <div className="flex items-center justify-center h-48">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              </div> :
            prediction ?
            <>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
                    Estimated Future Value
                    {inflationAdjusted &&
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                        Real Value
                      </span>
                  }
                  </p>
                  <p className="text-4xl font-bold text-gray-900">
                    {formatCurrency(prediction.estimatedValue)}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Invested Amount</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(prediction.totalInvestment)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Estimated Gains</span>
                    <span className="font-semibold text-green-600">
                      +{formatCurrency(prediction.estimatedGains)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Expected Return</span>
                    <span className="font-semibold text-blue-600">
                      {prediction.cagrUsed.toFixed(1)}% p.a.
                    </span>
                  </div>
                </div>

                {/* Visual Breakdown */}
                <div className="space-y-2">
                  <div className="h-5 w-full bg-gray-200 rounded-full overflow-hidden flex shadow-inner">
                    <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                    style={{
                      width: `${breakdown.investmentPercentage}%`
                    }}
                    title={`Invested: ${breakdown.investmentPercentage}%`} />

                    <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                    style={{
                      width: `${breakdown.gainsPercentage}%`
                    }}
                    title={`Gains: ${breakdown.gainsPercentage}%`} />

                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm" />
                      <span className="font-medium">Investment</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm" />
                      <span className="font-medium">Gains</span>
                    </div>
                  </div>
                </div>
              </> :
            null}
          </div>
        </div>

        {/* Get Recommendations Button */}
        {prediction &&
        <div className="flex justify-center gap-3">
            <Button
            onClick={handleGetRecommendations}
            disabled={calculating}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all">

              {calculating ?
            <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Funds...
                </> :

            'Get Personalized SIP Recommendations'
            }
            </Button>
          </div>
        }

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 items-start">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 leading-relaxed">
            <p className="font-semibold mb-1">Disclaimer</p>
            This is an estimated projection based on historical and current
            market data. Actual returns may vary. Mutual fund investments are
            subject to market risks. Please read all scheme-related documents
            carefully before investing.
          </div>
        </div>
      </div>
    </Card>);

}
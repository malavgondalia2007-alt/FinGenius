import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { CheckCircle, AlertTriangle, TrendingUp, Shield, DollarSign, ArrowRight } from 'lucide-react';
import { IndiaInvestFund } from '../../services/indiaInvestApi';
import { formatCurrency } from '../../utils/sipCalculations';
import { RecommendationResult } from '../../utils/fundRecommendations';
interface SIPRecommendationResultsProps {
  result: RecommendationResult;
  sipAmount: number;
  durationYears: number;
  onReset: () => void;
}
export function SIPRecommendationResults({
  result,
  sipAmount,
  durationYears,
  onReset
}: SIPRecommendationResultsProps) {
  const {
    topFund,
    alternatives,
    safeLimit
  } = result;
  if (!topFund) {
    return <Card className="p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Matching Funds Found
        </h3>
        <p className="text-gray-600 mb-6">
          We couldn't find any funds matching your exact criteria. Try adjusting
          your risk profile or SIP amount.
        </p>
        <Button onClick={onReset}>Adjust Parameters</Button>
      </Card>;
  }
  // Calculate projections for the top fund
  const expectedReturn = topFund.returns5Yr || topFund.returns3Yr;
  const monthlyRate = expectedReturn / 100 / 12;
  const months = durationYears * 12;
  const investedAmount = sipAmount * months;
  const futureValue = sipAmount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
  const gains = futureValue - investedAmount;
  return <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 1. Projection Summary Card */}
      <Card className="bg-gradient-to-br from-indigo-900 to-blue-900 text-white border-none overflow-hidden relative">
        <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="p-6 md:p-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <h3 className="text-blue-100 font-medium mb-1">
                Estimated Future Value
              </h3>
              <div className="text-4xl md:text-5xl font-bold tracking-tight">
                {formatCurrency(Math.round(futureValue))}
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
              <TrendingUp className="h-4 w-4 text-green-400" />
              <span className="font-medium">
                {expectedReturn}% Expected Return
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-6 border-t border-white/10">
            <div>
              <p className="text-blue-200 text-sm mb-1">Invested Amount</p>
              <p className="text-xl font-semibold">
                {formatCurrency(investedAmount)}
              </p>
            </div>
            <div>
              <p className="text-blue-200 text-sm mb-1">Estimated Gains</p>
              <p className="text-xl font-semibold text-green-400">
                +{formatCurrency(Math.round(gains))}
              </p>
            </div>
            <div className="col-span-2 md:col-span-1">
              <p className="text-blue-200 text-sm mb-1">Duration</p>
              <p className="text-xl font-semibold">{durationYears} Years</p>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. Safety Warning (if applicable) */}
      {!safeLimit.isSafe && <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-amber-800 text-sm">
              SIP Amount Exceeds Safe Limit
            </h4>
            <p className="text-amber-700 text-sm mt-1">
              Your proposed SIP of {formatCurrency(sipAmount)} is higher than
              the recommended safe limit of {formatCurrency(safeLimit.max)} (40%
              of savings). Consider reducing it to maintain liquidity.
            </p>
          </div>
        </div>}

      {/* 3. Top Recommendation */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <CheckCircle className="h-6 w-6 text-green-600" />
          Best Fund For You
        </h3>

        <Card className="border-2 border-blue-600 shadow-lg overflow-hidden">
          <div className="bg-blue-50 p-4 border-b border-blue-100 flex justify-between items-center">
            <span className="text-blue-700 font-semibold text-sm tracking-wide uppercase">
              Top Recommendation
            </span>
            <Badge variant="success" className="bg-green-100 text-green-800 border-green-200">
              Score: 92/100
            </Badge>
          </div>

          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">
                  {topFund.schemeName}
                </h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                    {topFund.schemeCategory}
                  </Badge>
                  <Badge variant="outline" className="border-gray-200 text-gray-600">
                    {topFund.riskLevel} Risk
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 mb-1">3Y Returns</p>
                <p className="text-2xl font-bold text-green-600">
                  {topFund.returns3Yr}%
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h5 className="font-semibold text-gray-900 mb-2 text-sm">
                Why this fund?
              </h5>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>
                    Matches your{' '}
                    <strong>{topFund.riskLevel.toLowerCase()} risk</strong>{' '}
                    profile perfectly
                  </span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>
                    Consistent returns of{' '}
                    <strong>{topFund.returns5Yr || topFund.returns3Yr}%</strong>{' '}
                    over long term
                  </span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>
                    Low expense ratio of{' '}
                    <strong>{topFund.expenseRatio}%</strong> maximizes your
                    gains
                  </span>
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Expense Ratio</p>
                <p className="font-medium text-gray-900">
                  {topFund.expenseRatio}%
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Fund Size (AUM)</p>
                <p className="font-medium text-gray-900">₹{topFund.aum} Cr</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Min SIP</p>
                <p className="font-medium text-gray-900">
                  ₹{topFund.minSipAmount}
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">NAV</p>
                <p className="font-medium text-gray-900">₹{topFund.nav}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 4. Alternatives */}
      {alternatives.length > 0 && <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Alternative Options
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alternatives.map((fund) => <Card key={fund.schemeCode} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-semibold text-gray-900 line-clamp-2 flex-1 mr-2">
                    {fund.schemeName}
                  </h4>
                  <span className="text-green-600 font-bold text-sm bg-green-50 px-2 py-1 rounded">
                    {fund.returns3Yr}%
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="text-xs">
                    {fund.schemeCategory}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {fund.riskLevel} Risk
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500 pt-3 border-t border-gray-100">
                  <span>Exp: {fund.expenseRatio}%</span>
                  <span>AUM: ₹{fund.aum}Cr</span>
                </div>
              </Card>)}
          </div>
        </div>}

      <div className="flex justify-center pt-4">
        <Button variant="outline" onClick={onReset}>
          Modify Inputs
        </Button>
      </div>
    </div>;
}
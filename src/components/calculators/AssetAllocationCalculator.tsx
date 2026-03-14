import React, { useEffect, useState } from 'react';
import { Input } from '../ui/Input';
import { getAssetAllocation } from '../../utils/investmentCalculations';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend } from
'recharts';
import { Shield, TrendingUp, AlertTriangle } from 'lucide-react';
export function AssetAllocationCalculator() {
  const [age, setAge] = useState(30);
  const [riskProfile, setRiskProfile] = useState<
    'conservative' | 'moderate' | 'aggressive'>(
    'moderate');
  const [allocation, setAllocation] = useState<any>(null);
  useEffect(() => {
    setAllocation(getAssetAllocation(age, riskProfile));
  }, [age, riskProfile]);
  if (!allocation) return null;
  const data = [
  {
    name: 'Equity (Stocks)',
    value: allocation.equity.total,
    color: '#2563EB'
  },
  {
    name: 'Debt (Bonds/FDs)',
    value: allocation.debt.total,
    color: '#10B981'
  },
  {
    name: 'Gold/Others',
    value: allocation.gold,
    color: '#F59E0B'
  } // Amber
  ].filter((d) => d.value > 0);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Age
          </label>
          <Input
            type="number"
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            min={18}
            max={100} />

          <input
            type="range"
            min="18"
            max="80"
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            className="w-full mt-2 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />

        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Risk Tolerance
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['conservative', 'moderate', 'aggressive'] as const).map((r) =>
            <button
              key={r}
              onClick={() => setRiskProfile(r)}
              className={`py-2 px-3 text-sm font-medium rounded-lg border transition-all capitalize
                  ${riskProfile === r ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>

                {r}
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {riskProfile === 'conservative' &&
            'Prioritizes capital protection over growth.'}
            {riskProfile === 'moderate' && 'Balances growth and stability.'}
            {riskProfile === 'aggressive' &&
            'Seeks maximum growth, accepts higher volatility.'}
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Strategy
          </h4>
          <p className="text-sm text-blue-800">
            Based on the "100 minus Age" rule adjusted for your {riskProfile}{' '}
            risk profile, you should allocate{' '}
            <strong>{allocation.equity.total}%</strong> to equities.
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">
          Recommended Allocation
        </h3>

        <div className="h-64 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value">

                {data.map((entry, index) =>
                <Cell key={`cell-${index}`} fill={entry.color} />
                )}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Text */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none pb-8">
            <p className="text-xs text-gray-500">Equity</p>
            <p className="text-xl font-bold text-gray-900">
              {allocation.equity.total}%
            </p>
          </div>
        </div>

        <div className="space-y-3 mt-4">
          <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-600"></span>
              Large Cap Equity
            </span>
            <span className="font-medium">{allocation.equity.largeCap}%</span>
          </div>
          <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-400"></span>
              Mid/Small Cap
            </span>
            <span className="font-medium">
              {allocation.equity.midCap + allocation.equity.smallCap}%
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              Debt / Fixed Income
            </span>
            <span className="font-medium">{allocation.debt.total}%</span>
          </div>
        </div>
      </div>
    </div>);

}
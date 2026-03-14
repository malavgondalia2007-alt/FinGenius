import React, { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { calculateLumpSum } from '../../utils/investmentCalculations';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend } from
'recharts';
import { TrendingUp, DollarSign, Calendar } from 'lucide-react';
export function LumpSumCalculator() {
  const [investment, setInvestment] = useState(100000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);
  const [result, setResult] = useState({
    invested: 0,
    totalValue: 0,
    gains: 0
  });
  useEffect(() => {
    setResult(calculateLumpSum(investment, rate, years));
  }, [investment, rate, years]);
  const data = [
  {
    name: 'Invested Amount',
    value: result.invested,
    color: '#E2E8F0'
  },
  {
    name: 'Est. Returns',
    value: result.gains,
    color: '#10B981'
  }];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total Investment
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
              ₹
            </span>
            <Input
              type="number"
              value={investment}
              onChange={(e) => setInvestment(Number(e.target.value))}
              className="pl-8" />

          </div>
          <input
            type="range"
            min="5000"
            max="10000000"
            step="5000"
            value={investment}
            onChange={(e) => setInvestment(Number(e.target.value))}
            className="w-full mt-2 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />

        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expected Return Rate (p.a)
          </label>
          <div className="relative">
            <Input
              type="number"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="pr-8" />

            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
              %
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="30"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-full mt-2 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />

        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time Period (Years)
          </label>
          <Input
            type="number"
            value={years}
            onChange={(e) => setYears(Number(e.target.value))} />

          <input
            type="range"
            min="1"
            max="50"
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="w-full mt-2 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />

        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-6 flex flex-col items-center justify-center">
        <div className="text-center mb-6">
          <p className="text-sm text-gray-500 mb-1">
            Total Value after {years} years
          </p>
          <h3 className="text-3xl font-bold text-gray-900">
            ₹{result.totalValue.toLocaleString()}
          </h3>
        </div>

        <div className="h-64 w-full">
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
              <Tooltip
                formatter={(value: number) => `₹${value.toLocaleString()}`} />

              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="w-full space-y-3 mt-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Invested Amount</span>
            <span className="font-bold text-gray-900">
              ₹{result.invested.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Est. Returns</span>
            <span className="font-bold text-emerald-600">
              +₹{result.gains.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>);

}
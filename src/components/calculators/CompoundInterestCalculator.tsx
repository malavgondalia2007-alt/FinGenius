import React, { useEffect, useState } from 'react';
import { Input } from '../ui/Input';
import { calculateCompoundInterest } from '../../utils/investmentCalculations';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend } from
'recharts';
export function CompoundInterestCalculator() {
  const [principal, setPrincipal] = useState(50000);
  const [rate, setRate] = useState(8);
  const [years, setYears] = useState(15);
  const [frequency, setFrequency] = useState(1); // 1 = Annually
  const [result, setResult] = useState({
    invested: 0,
    totalValue: 0,
    gains: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);
  useEffect(() => {
    const res = calculateCompoundInterest(principal, rate, years, frequency);
    setResult(res);
    // Generate chart data for each year
    const data = [];
    for (let i = 1; i <= years; i++) {
      const yearlyRes = calculateCompoundInterest(principal, rate, i, frequency);
      data.push({
        year: `Year ${i}`,
        Principal: yearlyRes.invested,
        Interest: yearlyRes.gains
      });
    }
    setChartData(data);
  }, [principal, rate, years, frequency]);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Principal Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
              ₹
            </span>
            <Input
              type="number"
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value))}
              className="pl-8" />

          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Interest Rate (%)
          </label>
          <Input
            type="number"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))} />

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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Compounding Frequency
          </label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(Number(e.target.value))}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">

            <option value={1}>Annually</option>
            <option value={2}>Semi-Annually</option>
            <option value={4}>Quarterly</option>
            <option value={12}>Monthly</option>
          </select>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-xs text-gray-500">Total Amount</p>
            <p className="text-xl font-bold text-blue-600">
              ₹{result.totalValue.toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-xs text-gray-500">Total Interest</p>
            <p className="text-xl font-bold text-emerald-600">
              ₹{result.gains.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 0,
                bottom: 5
              }}>

              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="year" hide />
              <YAxis tickFormatter={(value) => `₹${value / 1000}k`} />
              <Tooltip
                formatter={(value: number) => `₹${value.toLocaleString()}`} />

              <Legend />
              <Bar dataKey="Principal" stackId="a" fill="#94A3B8" />
              <Bar dataKey="Interest" stackId="a" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>);

}
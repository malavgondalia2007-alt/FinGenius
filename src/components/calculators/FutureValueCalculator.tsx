import React, { useEffect, useState } from 'react';
import { Input } from '../ui/Input';
import { calculateFutureValue } from '../../utils/investmentCalculations';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer } from
'recharts';
export function FutureValueCalculator() {
  const [presentValue, setPresentValue] = useState(10000);
  const [rate, setRate] = useState(10);
  const [years, setYears] = useState(10);
  const [periodicPayment, setPeriodicPayment] = useState(5000);
  const [result, setResult] = useState({
    invested: 0,
    totalValue: 0,
    gains: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);
  useEffect(() => {
    setResult(calculateFutureValue(presentValue, rate, years, periodicPayment));
    const data = [];
    for (let i = 0; i <= years; i++) {
      const res = calculateFutureValue(presentValue, rate, i, periodicPayment);
      data.push({
        year: i,
        value: res.totalValue,
        invested: res.invested
      });
    }
    setChartData(data);
  }, [presentValue, rate, years, periodicPayment]);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Initial Investment (Present Value)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
              ₹
            </span>
            <Input
              type="number"
              value={presentValue}
              onChange={(e) => setPresentValue(Number(e.target.value))}
              className="pl-8" />

          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monthly Contribution
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
              ₹
            </span>
            <Input
              type="number"
              value={periodicPayment}
              onChange={(e) => setPeriodicPayment(Number(e.target.value))}
              className="pl-8" />

          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expected Return Rate (%)
          </label>
          <Input
            type="number"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))} />

        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duration (Years)
          </label>
          <Input
            type="number"
            value={years}
            onChange={(e) => setYears(Number(e.target.value))} />

          <input
            type="range"
            min="1"
            max="40"
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="w-full mt-2 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />

        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-6">
        <div className="text-center mb-6">
          <p className="text-sm text-gray-500 mb-1">Future Value</p>
          <h3 className="text-3xl font-bold text-blue-600">
            ₹{result.totalValue.toLocaleString()}
          </h3>
          <p className="text-sm text-gray-500 mt-2">
            Total Invested:{' '}
            <span className="font-semibold text-gray-700">
              ₹{result.invested.toLocaleString()}
            </span>
          </p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0
              }}>

              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="year" />
              <YAxis tickFormatter={(value) => `₹${value / 1000}k`} />
              <Tooltip
                formatter={(value: number) => `₹${value.toLocaleString()}`} />

              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#2563EB"
                fillOpacity={1}
                fill="url(#colorValue)" />

              <Area
                type="monotone"
                dataKey="invested"
                stroke="#94A3B8"
                fill="transparent"
                strokeDasharray="5 5" />

            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>);

}
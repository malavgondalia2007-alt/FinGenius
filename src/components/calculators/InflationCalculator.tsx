import React, { useEffect, useState } from 'react';
import { Input } from '../ui/Input';
import { calculateInflationAdjustedReturn } from '../../utils/investmentCalculations';
import { ArrowRight, TrendingDown } from 'lucide-react';
export function InflationCalculator() {
  const [amount, setAmount] = useState(100000);
  const [returnRate, setReturnRate] = useState(12);
  const [inflationRate, setInflationRate] = useState(6);
  const [years, setYears] = useState(10);
  const [result, setResult] = useState({
    nominalValue: 0,
    realValue: 0,
    purchasingPowerLoss: 0,
    realRate: 0
  });
  useEffect(() => {
    setResult(
      calculateInflationAdjustedReturn(
        amount,
        returnRate,
        inflationRate,
        years
      )
    );
  }, [amount, returnRate, inflationRate, years]);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Investment Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
              ₹
            </span>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="pl-8" />

          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Return Rate (%)
            </label>
            <Input
              type="number"
              value={returnRate}
              onChange={(e) => setReturnRate(Number(e.target.value))} />

          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inflation Rate (%)
            </label>
            <Input
              type="number"
              value={inflationRate}
              onChange={(e) => setInflationRate(Number(e.target.value))} />

          </div>
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
            max="40"
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="w-full mt-2 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />

        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">
            Nominal Value (Without Inflation)
          </p>
          <h3 className="text-2xl font-bold text-gray-900">
            ₹{result.nominalValue.toLocaleString()}
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            What it looks like on paper
          </p>
        </div>

        <div className="flex justify-center">
          <ArrowRight className="w-6 h-6 text-gray-400 rotate-90 md:rotate-0" />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-sm text-blue-700 mb-1 font-medium">
              Real Value (Purchasing Power)
            </p>
            <h3 className="text-3xl font-bold text-blue-900">
              ₹{result.realValue.toLocaleString()}
            </h3>
            <p className="text-xs text-blue-600 mt-2">
              Real Return Rate:{' '}
              <span className="font-bold">{result.realRate}%</span>
            </p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10">
            <TrendingDown className="w-32 h-32 text-blue-900" />
          </div>
        </div>

        <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-sm text-red-800">
          <p>
            <strong>Inflation Impact:</strong> You lose purchasing power
            equivalent to
            <span className="font-bold">
              {' '}
              ₹{result.purchasingPowerLoss.toLocaleString()}
            </span>{' '}
            over {years} years.
          </p>
        </div>
      </div>
    </div>);

}
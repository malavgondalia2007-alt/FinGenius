import React, { useEffect, useState } from 'react';
import { Input } from '../ui/Input';
import { calculateROI } from '../../utils/investmentCalculations';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
export function ROICalculator() {
  const [initial, setInitial] = useState(50000);
  const [final, setFinal] = useState(75000);
  const [result, setResult] = useState({
    gains: 0,
    roi: 0
  });
  useEffect(() => {
    setResult(calculateROI(initial, final));
  }, [initial, final]);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Initial Investment
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
              ₹
            </span>
            <Input
              type="number"
              value={initial}
              onChange={(e) => setInitial(Number(e.target.value))}
              className="pl-8" />

          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Final Value
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
              ₹
            </span>
            <Input
              type="number"
              value={final}
              onChange={(e) => setFinal(Number(e.target.value))}
              className="pl-8" />

          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div
          className={`p-6 rounded-xl border-2 ${result.roi >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'} text-center`}>

          <p className="text-sm font-medium text-gray-600 mb-1">
            Return on Investment (ROI)
          </p>
          <div className="flex items-center justify-center gap-2">
            {result.roi >= 0 ?
            <TrendingUp className="w-8 h-8 text-emerald-600" /> :

            <TrendingDown className="w-8 h-8 text-red-600" />
            }
            <h3
              className={`text-4xl font-bold ${result.roi >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>

              {result.roi}%
            </h3>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-white border border-gray-200 text-center shadow-sm">
          <p className="text-sm font-medium text-gray-600 mb-1">
            Total Gain/Loss
          </p>
          <h3
            className={`text-2xl font-bold ${result.gains >= 0 ? 'text-gray-900' : 'text-red-600'}`}>

            {result.gains >= 0 ? '+' : ''}₹{result.gains.toLocaleString()}
          </h3>
        </div>
      </div>
    </div>);

}
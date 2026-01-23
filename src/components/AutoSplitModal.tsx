import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Split, Check, X } from 'lucide-react';
interface AutoSplitModalProps {
  onConfirm: (percentage: number) => void;
  onDecline: () => void;
}
export function AutoSplitModal({ onConfirm, onDecline }: AutoSplitModalProps) {
  const [percentage, setPercentage] = useState(20);
  const data = [
  {
    name: 'Savings',
    value: percentage,
    color: '#10B981'
  },
  {
    name: 'Spending',
    value: 100 - percentage,
    color: '#E5E7EB'
  }];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <Card className="max-w-md w-full p-6 relative">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Split className="w-6 h-6 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            Auto-Split Income?
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Would you like to automatically allocate a percentage of your income
            for goal planning?
          </p>
        </div>

        <div className="mb-8">
          <div className="h-40 relative mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value">

                  {data.map((entry, index) =>
                  <Cell key={`cell-${index}`} fill={entry.color} />
                  )}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-2xl font-bold text-emerald-600">
                {percentage}%
              </span>
              <span className="text-xs text-gray-500">Savings</span>
            </div>
          </div>

          <div className="px-4">
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={percentage}
              onChange={(e) => setPercentage(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600" />

            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <p className="text-xs text-blue-800 leading-relaxed">
            <strong>Note:</strong> This split is used ONLY for goal calculations
            and AI recommendations. It never affects your actual expenses or
            forces deductions.
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="ghost" onClick={onDecline} className="flex-1">
            No, thanks
          </Button>
          <Button
            variant="emerald"
            onClick={() => onConfirm(percentage)}
            className="flex-1">

            Enable Auto-Split
          </Button>
        </div>
      </Card>
    </div>);

}
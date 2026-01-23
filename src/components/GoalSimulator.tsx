import React, { useEffect, useState } from 'react';
import { Goal, UserProfile } from '../types';
import { calculateGoalFeasibility } from '../utils/financialIntelligence';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import {
  ArrowLeft,
  TrendingUp,
  Calendar,
  Target,
  AlertCircle,
  CheckCircle } from
'lucide-react';
interface GoalSimulatorProps {
  goal: Goal;
  profile: UserProfile | null;
  onClose: () => void;
}
export function GoalSimulator({ goal, profile, onClose }: GoalSimulatorProps) {
  const [monthlySavings, setMonthlySavings] = useState(1000);
  const [feasibility, setFeasibility] = useState<any>(null);
  useEffect(() => {
    // Initial calculation
    const result = calculateGoalFeasibility(
      goal.targetAmount,
      goal.savedAmount,
      monthlySavings,
      new Date(goal.deadline)
    );
    setFeasibility(result);
  }, [monthlySavings, goal]);
  const maxSavings = profile ?
  profile.type === 'student' ?
  (profile.weeklyPocketMoney || 0) * 4 :
  (profile.monthlyIncome || 0) * 0.5 :
  50000;
  return (
    <Card className="p-6 animate-fade-in border-2 border-purple-100 shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Go back">

            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900">
              Goal Simulator: {goal.name}
            </h3>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Adjust Monthly Contribution:{' '}
          <span className="text-purple-600 font-bold text-lg ml-2">
            ₹{monthlySavings.toLocaleString()}
          </span>
        </label>
        <input
          type="range"
          min="100"
          max={maxSavings}
          step="100"
          value={monthlySavings}
          onChange={(e) => setMonthlySavings(parseInt(e.target.value))}
          className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600" />

        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>₹100</span>
          <span>₹{maxSavings.toLocaleString()}</span>
        </div>
      </div>

      {feasibility &&
      <div className="space-y-6">
          {/* Success Probability - Enhanced */}
          <div
          className={`rounded-xl p-6 ${feasibility.probability > 70 ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200' : feasibility.probability > 40 ? 'bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200' : 'bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200'}`}>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {feasibility.probability > 70 ?
              <CheckCircle className="w-8 h-8 text-emerald-600" /> :
              feasibility.probability > 40 ?
              <AlertCircle className="w-8 h-8 text-amber-600" /> :

              <AlertCircle className="w-8 h-8 text-red-600" />
              }
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Success Probability
                  </p>
                  <p
                  className={`text-3xl font-bold ${feasibility.probability > 70 ? 'text-emerald-600' : feasibility.probability > 40 ? 'text-amber-600' : 'text-red-600'}`}>

                    {feasibility.probability}%
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600 mb-1">Confidence Level</p>
                <p
                className={`text-sm font-bold ${feasibility.probability > 70 ? 'text-emerald-700' : feasibility.probability > 40 ? 'text-amber-700' : 'text-red-700'}`}>

                  {feasibility.probability > 70 ?
                'High' :
                feasibility.probability > 40 ?
                'Medium' :
                'Low'}
                </p>
              </div>
            </div>

            <div className="w-full bg-white/50 rounded-full h-4 overflow-hidden">
              <div
              className={`h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2 ${feasibility.probability > 70 ? 'bg-emerald-500' : feasibility.probability > 40 ? 'bg-amber-500' : 'bg-red-500'}`}
              style={{
                width: `${feasibility.probability}%`
              }}>

                <span className="text-xs font-bold text-white">
                  {feasibility.probability}%
                </span>
              </div>
            </div>
          </div>

          {/* Timeline Comparison */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border-2 border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <p className="text-xs font-medium text-gray-600">
                  Projected Completion
                </p>
              </div>
              <p className="font-bold text-gray-900 text-lg">
                {feasibility.projectedDate.toLocaleDateString(undefined, {
                month: 'short',
                year: 'numeric'
              })}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border-2 border-purple-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-purple-600" />
                <p className="text-xs font-medium text-gray-600">Target Date</p>
              </div>
              <p className="font-bold text-gray-900 text-lg">
                {new Date(goal.deadline).toLocaleDateString(undefined, {
                month: 'short',
                year: 'numeric'
              })}
              </p>
            </div>
          </div>

          {/* AI Insight */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-800 leading-relaxed">
                <span className="font-bold">AI Insight:</span>{' '}
                {feasibility.message}
              </p>
            </div>
          </div>

          {/* Action Button */}
          <Button
          onClick={onClose}
          fullWidth
          className="bg-purple-600 hover:bg-purple-700 text-white">

            Apply This Plan
          </Button>
        </div>
      }
    </Card>);

}
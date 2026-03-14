import React from 'react';
import { Goal } from '../types';
import { checkGoalFeasibilityWithDeadline } from '../utils/savingsCalculations';
import { Badge } from './ui/Badge';
import { Clock, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
interface GoalFeasibilityCheckerProps {
  goal: Goal;
  monthlyNetSavings: number;
}
export function GoalFeasibilityChecker({
  goal,
  monthlyNetSavings
}: GoalFeasibilityCheckerProps) {
  // Don't show for completed goals
  if (goal.savedAmount >= goal.targetAmount) return null;
  const { realisticMonths, monthlyRequired, percentOfSavings, feasibility } =
  checkGoalFeasibilityWithDeadline(
    goal.targetAmount,
    goal.savedAmount,
    new Date(goal.deadline),
    monthlyNetSavings
  );
  const getFeasibilityConfig = () => {
    switch (feasibility) {
      case 'easy':
        return {
          color: 'success',
          icon: <CheckCircle className="w-4 h-4" />,
          text: 'Comfortable',
          bg: 'bg-emerald-50',
          border: 'border-emerald-100',
          textColor: 'text-emerald-800'
        };
      case 'moderate':
        return {
          color: 'info',
          icon: <TrendingUp className="w-4 h-4" />,
          text: 'Ambitious',
          bg: 'bg-blue-50',
          border: 'border-blue-100',
          textColor: 'text-blue-800'
        };
      case 'tight':
        return {
          color: 'warning',
          icon: <Clock className="w-4 h-4" />,
          text: 'Tight Timeline',
          bg: 'bg-amber-50',
          border: 'border-amber-100',
          textColor: 'text-amber-800'
        };
      case 'unrealistic':
        return {
          color: 'danger',
          icon: <AlertTriangle className="w-4 h-4" />,
          text: 'At Risk',
          bg: 'bg-red-50',
          border: 'border-red-100',
          textColor: 'text-red-800'
        };
    }
  };
  const config = getFeasibilityConfig();
  return (
    <div className={`mt-4 p-4 rounded-xl border ${config.bg} ${config.border}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className={config.textColor}>{config.icon}</span>
          <span className={`font-bold text-sm ${config.textColor}`}>
            Feasibility: {config.text}
          </span>
        </div>
        <Badge variant={config.color as any}>
          Requires {Math.min(100, Math.round(percentOfSavings))}% of Savings
        </Badge>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-charcoal-500">Monthly Required:</span>
          <span className="font-medium text-charcoal-900">
            ₹{Math.round(monthlyRequired).toLocaleString()}
          </span>
        </div>

        {feasibility === 'unrealistic' || feasibility === 'tight' ?
        <div className="mt-2 pt-2 border-t border-gray-200/50">
            <p className="text-xs font-medium text-charcoal-600 mb-1">
              Recommendation:
            </p>
            <p className={`text-xs ${config.textColor}`}>
              Consider extending deadline by{' '}
              <span className="font-bold">
                {Math.max(
                1,
                realisticMonths -
                Math.ceil(
                  (new Date(goal.deadline).getTime() - Date.now()) / (
                  1000 * 60 * 60 * 24 * 30)
                )
              )}{' '}
                months
              </span>{' '}
              to make this achievable.
            </p>
          </div> :

        <div className="mt-2 pt-2 border-t border-gray-200/50">
            <p className={`text-xs ${config.textColor}`}>
              You're on track! This goal fits well within your monthly savings
              capacity.
            </p>
          </div>
        }
      </div>
    </div>);

}